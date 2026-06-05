"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  CalendarDays,
  Clock,
  FileDown,
  Loader2,
  Mic,
  Send,
  Trash2,
  User as UserIcon,
  FileText,
} from "lucide-react";
import {
  bookingApi,
  chatApi,
  chatbotApi,
  prescriptionApi,
  type ChatbotCustomizationResponse,
  type EstimatePdfLine,
  type PreferredLanguage,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface Message {
  role: "user" | "ai" | "assistant";
  content: string;
}

interface BookingAction {
  type?: "BOOK_APPOINTMENT" | "REQUEST_PRESCRIPTION";
  ask_date?: boolean;
  prefill_date?: string | null;
}

interface ChatResponse {
  response: string;
  quick_replies?: string[];
  needs_language_choice?: boolean;
  language?: string | null;
  show_widget?: boolean;
  booking_action?: BookingAction | null;
  estimate_lines?: EstimatePdfLine[];
  estimate_pdf_ready?: boolean;
}

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_WELCOME =
  "Namaste! 👋 I'm your AI Health Assistant. Ask me anything about health, medications, or wellness — I'll reply in seconds.";
const DEFAULT_BOT_TITLE = "AI Health Assistant";
const DEFAULT_PRIMARY = "#14b8a6";

function resolveWelcome(c: ChatbotCustomizationResponse): string {
  const msg = c.welcome_message ?? c.welcome_text;
  return typeof msg === "string" && msg.trim() ? msg.trim() : DEFAULT_WELCOME;
}

function resolvePrimaryColor(c: ChatbotCustomizationResponse): string {
  const hex = c.primary_color;
  return typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex.trim()) ? hex.trim() : DEFAULT_PRIMARY;
}

export const HealthChat = () => {
  const { language: globalLanguage, setLanguage: setGlobalLanguage, t } = useLanguage();

  const [botTitle, setBotTitle] = useState(DEFAULT_BOT_TITLE);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [defaultWelcome, setDefaultWelcome] = useState(DEFAULT_WELCOME);

  const [messages, setMessages] = useState<Message[]>([{ role: "ai", content: DEFAULT_WELCOME }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showBookingWidget, setShowBookingWidget] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlots, setBookingSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [needsLanguageChoice, setNeedsLanguageChoice] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage | null>(null);
  const [pendingEstimateLines, setPendingEstimateLines] = useState<EstimatePdfLine[] | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Prescription request states
  const [showPrescriptionWidget, setShowPrescriptionWidget] = useState(false);
  const [prescName, setPrescName] = useState("");
  const [prescEmail, setPrescEmail] = useState("");
  const [prescSymptoms, setPrescSymptoms] = useState("");
  const [prescLoading, setPrescLoading] = useState(false);
  const [prescError, setPrescError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>(newSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    void chatbotApi
      .getCustomization()
      .then((c) => {
        const welcome = resolveWelcome(c);
        const title =
          (typeof c.bot_name === "string" && c.bot_name.trim()) ||
          (typeof c.clinic_display_name === "string" && c.clinic_display_name.trim()) ||
          DEFAULT_BOT_TITLE;
        const color = resolvePrimaryColor(c);
        setBotTitle(title);
        setPrimaryColor(color);
        setDefaultWelcome(welcome);
        setMessages([{ role: "ai", content: welcome }]);
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  // Sync global language selector changes down to the chatbot preference
  useEffect(() => {
    if (globalLanguage) {
      setPreferredLanguage(globalLanguage as PreferredLanguage);
    }
  }, [globalLanguage]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, showBookingWidget, showPrescriptionWidget, quickReplies, needsLanguageChoice]);

  const openBookingWidget = (prefillDate?: string) => {
    const finalDate = prefillDate || new Date().toISOString().split("T")[0];
    setShowBookingWidget(true);
    setBookingDate(finalDate);
    setSelectedSlot(null);
    setBookingError(null);
    void loadBookingSlots(finalDate);
  };

  const openPrescriptionWidget = () => {
    setShowPrescriptionWidget(true);
    setPrescName("");
    setPrescEmail("");
    setPrescSymptoms(input || "");
    setPrescError(null);
  };

  const loadBookingSlots = async (dateValue: string) => {
    if (!dateValue) return;
    setSlotsLoading(true);
    setBookingError(null);
    setSelectedSlot(null);
    try {
      const data = await bookingApi.getSlots(dateValue);
      setBookingSlots(data.slots || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load slots.";
      setBookingError(msg);
      setBookingSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const confirmChatBooking = async () => {
    if (!bookingDate || !selectedSlot) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      await bookingApi.book({ date: bookingDate, time_slot: selectedSlot });
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Done! Appointment confirmed for ${bookingDate} at ${selectedSlot}.` },
      ]);
      setShowBookingWidget(false);
      setSelectedSlot(null);
      setBookingSlots([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking failed.";
      if (msg.toLowerCase().includes("409") || msg.toLowerCase().includes("conflict")) {
        setBookingError("This slot is no longer available. Please choose another slot.");
      } else {
        setBookingError(msg);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const confirmPrescriptionRequest = async () => {
    if (!prescName.trim() || !prescEmail.trim() || !prescSymptoms.trim()) {
      setPrescError("Please fill out all fields.");
      return;
    }
    setPrescLoading(true);
    setPrescError(null);
    try {
      await prescriptionApi.requestPrescription({
        patient_name: prescName.trim(),
        patient_email: prescEmail.trim(),
        symptoms: prescSymptoms.trim(),
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Done! Prescription request registered for ${prescName}. It will be sent to ${prescEmail} once approved by the doctor.`,
        },
      ]);
      setShowPrescriptionWidget(false);
      setPrescName("");
      setPrescEmail("");
      setPrescSymptoms("");
    } catch (err: unknown) {
      setPrescError(err instanceof Error ? err.message : "Failed to register prescription request.");
    } finally {
      setPrescLoading(false);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setQuickReplies([]);
    setIsLoading(true);
    try {
      const history = [...messages, userMsg].map((m) => ({
        role: (m.role === "ai" ? "assistant" : m.role) as "user" | "assistant",
        content: m.content,
      }));
      const data = (await chatApi.send({
        messages: history,
        session_id: sessionIdRef.current,
        ...(preferredLanguage ? { preferred_language: preferredLanguage } : {}),
      })) as ChatResponse;

      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      setQuickReplies(Array.isArray(data.quick_replies) ? data.quick_replies : []);
      setNeedsLanguageChoice(Boolean(data.needs_language_choice));
      if (data.language === "hi" || data.language === "en" || data.language === "hinglish" || data.language === "de") {
        setPreferredLanguage(data.language);
        if (data.language !== "hinglish") {
          setGlobalLanguage(data.language);
        }
      }
      if (data.show_widget) {
        openBookingWidget(data.booking_action?.prefill_date || undefined);
      } else if (data.booking_action?.type === "BOOK_APPOINTMENT") {
        openBookingWidget(data.booking_action.prefill_date || "");
      } else if (data.booking_action?.type === "REQUEST_PRESCRIPTION") {
        openPrescriptionWidget();
      }
      const lines = data.estimate_lines;
      if (lines && lines.length > 0) {
        setPendingEstimateLines(lines);
      } else if (!data.estimate_pdf_ready) {
        setPendingEstimateLines(null);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I couldn't reach the AI server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const pickLanguage = (lang: PreferredLanguage) => {
    setPreferredLanguage(lang);
    setNeedsLanguageChoice(false);
    if (lang === "hi" || lang === "en" || lang === "de") {
      setGlobalLanguage(lang);
    }
  };

  const downloadEstimatePdf = async () => {
    if (!pendingEstimateLines?.length) return;
    setPdfDownloading(true);
    try {
      await chatbotApi.downloadEstimatePdf({
        title: "Treatment cost estimate",
        patient_label: "",
        footer_notes: "",
        lines: pendingEstimateLines,
      });
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: e instanceof Error ? e.message : "Could not download the PDF. Try again.",
        },
      ]);
    } finally {
      setPdfDownloading(false);
    }
  };

  const startVoice = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstart = () => setIsRecording(true);
      mediaRecorder.current.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(audioChunks.current, { type: "audio/wav" });
        setIsLoading(true);
        try {
          const d = await chatApi.stt(blob);
          if (d.text) setInput(d.text);
        } catch {
          /* ignore */
        } finally {
          setIsLoading(false);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current.start();
    } catch {
      alert("Microphone access denied.");
    }
  };

  const clearChat = () => {
    sessionIdRef.current = newSessionId();
    setMessages([{ role: "ai", content: defaultWelcome }]);
    setShowBookingWidget(false);
    setBookingSlots([]);
    setSelectedSlot(null);
    setBookingError(null);
    setQuickReplies([]);
    setNeedsLanguageChoice(false);
    setPreferredLanguage(null);
    setPendingEstimateLines(null);
  };

  const accentStyle = { color: primaryColor };
  const filledStyle = { backgroundColor: primaryColor };
  const softBorder = { borderColor: `${primaryColor}40` };
  const softBg = { backgroundColor: `${primaryColor}14` };

  return (
    <div
      className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={softBorder}
    >
      {/* ── header ─────────────────────────────── */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-5 py-4"
        style={{ ...softBorder, ...softBg }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={filledStyle}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{botTitle}</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {t("chat.online", "Online · Ready to help")}
            </p>
            {preferredLanguage && (
              <p className="text-xs text-slate-500">
                {t("content.languageTitle", "Language")}:{" "}
                <span className="font-bold" style={accentStyle}>
                  {preferredLanguage === "de" ? "Deutsch" : preferredLanguage === "hi" ? "हिंदी" : preferredLanguage === "en" ? "English" : preferredLanguage}
                </span>
              </p>
            )}
          </div>
        </div>
        <button
          onClick={clearChat}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          title={t("chat.clear", "Clear chat")}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* ── messages ───────────────────────────── */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={cn("flex items-end gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  !isUser && "border"
                )}
                style={
                  isUser
                    ? filledStyle
                    : { borderColor: `${primaryColor}33`, backgroundColor: `${primaryColor}0d` }
                }
              >
                {isUser ? (
                  <UserIcon size={14} className="text-white" />
                ) : (
                  <Bot size={14} style={accentStyle} />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                  isUser ? "rounded-br-sm text-white" : "rounded-bl-sm border border-slate-100 bg-slate-50 text-slate-800"
                )}
                style={isUser ? filledStyle : undefined}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {needsLanguageChoice && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-800">{t("chat.chooseLanguage", "Choose language")}</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { code: "en" as const, label: "English" },
                  { code: "hi" as const, label: "हिंदी" },
                  { code: "hinglish" as const, label: "Hinglish" },
                  { code: "de" as const, label: "Deutsch" },
                ] as const
              ).map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => pickLanguage(code)}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {pendingEstimateLines && pendingEstimateLines.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50/60 px-4 py-3">
            <FileDown size={16} className="text-teal-600" />
            <span className="text-sm font-semibold text-slate-800">Treatment estimate ready</span>
            <button
              type="button"
              disabled={pdfDownloading}
              onClick={() => void downloadEstimatePdf()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {pdfDownloading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
              Download PDF
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-teal-100 bg-teal-50">
              <Bot size={14} className="text-teal-500" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-100 bg-slate-50 px-4 py-3">
              <Loader2 size={14} className="animate-spin text-teal-500" />
              <span className="text-sm text-slate-500">{t("chat.thinking", "Thinking...")}</span>
            </div>
          </div>
        )}

        {showBookingWidget && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={16} className="text-teal-600" />
              <p className="text-sm font-bold text-slate-800">{t("chat.bookingTitle", "Quick Booking")}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("chat.selectDate", "Select date")}</label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    void loadBookingSlots(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-500">{t("chat.availableSlots", "Available slots")}</p>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-500">
                    <Loader2 size={14} className="animate-spin text-teal-500" /> {t("chat.loadingSlots", "Loading slots...")}
                  </div>
                ) : bookingSlots.length === 0 ? (
                  <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-500">
                    {t("chat.noSlots", "No slots available for selected date.")}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {bookingSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition",
                          selectedSlot === slot
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                        )}
                      >
                        <Clock size={12} />
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {bookingError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {bookingError}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={confirmChatBooking}
                  disabled={!selectedSlot || bookingLoading}
                  className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bookingLoading ? t("chat.confirming", "Confirming...") : t("chat.confirmAppointment", "Confirm Appointment")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingWidget(false)}
                  disabled={bookingLoading}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {t("chat.close", "Close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPrescriptionWidget && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={16} className="text-teal-600" />
              <p className="text-sm font-bold text-slate-800">{t("chat.requestPrescription", "Request Prescription")}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("chat.patientName", "Patient Name")}</label>
                <input
                  type="text"
                  value={prescName}
                  onChange={(e) => setPrescName(e.target.value)}
                  placeholder={t("chat.enterPatientName", "Enter patient name")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("chat.emailAddress", "Email Address (for delivery)")}</label>
                <input
                  type="email"
                  value={prescEmail}
                  onChange={(e) => setPrescEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("chat.symptoms", "Symptoms & Requested Prescription Details")}</label>
                <textarea
                  value={prescSymptoms}
                  onChange={(e) => setPrescSymptoms(e.target.value)}
                  placeholder={t("chat.symptomsPlaceholder", "e.g. Cough and throat irritation for 3 days")}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-400"
                />
              </div>

              {prescError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {prescError}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={confirmPrescriptionRequest}
                  disabled={!prescName.trim() || !prescEmail.trim() || !prescSymptoms.trim() || prescLoading}
                  className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prescLoading ? t("chat.submitting", "Submitting...") : t("chat.submitPrescription", "Submit Prescription Request")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionWidget(false)}
                  disabled={prescLoading}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {t("chat.close", "Close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── input ──────────────────────────────── */}
      <div className="shrink-0 border-t border-teal-100 bg-white px-4 py-4">
        {quickReplies.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickReplies.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isLoading}
                onClick={() => void handleSend(q)}
                className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-teal-400 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-teal-100">
          <button
            type="button"
            onClick={startVoice}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
              isRecording
                ? "animate-pulse bg-red-100 text-red-500"
                : "text-slate-400 hover:bg-teal-50 hover:text-teal-500"
            )}
          >
            <Mic size={16} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSend()}
            placeholder={t("chat.inputPlaceholder", "Ask about symptoms, medications, wellness...")}
            className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40"
            style={filledStyle}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          {t("chat.warning", "AI responses are for informational purposes only. Always consult a doctor for medical advice.")}
        </p>
      </div>
    </div>
  );
};
