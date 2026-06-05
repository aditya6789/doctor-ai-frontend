"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Building2,
  FileCheck,
  Globe,
  Mail,
  Palette,
  PenLine,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
  Sparkles,
  User,
  Phone,
  Link2,
  MessageSquare,
  Image,
  Loader2,
  Check,
  Shield,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { DashAlert, DashCard } from "@/components/layout/DashboardPrimitives";
import { useLanguage } from "@/lib/LanguageContext";
import {
  chatbotApi,
  type ChatbotCustomizationResponse,
  type ChatbotCustomizationUpdate,
  type ChatbotPosition,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const KNOWLEDGE_MAX = 12000;
const OFF_TOPIC_MAX = 1000;
const CLINICAL_FOCUS_MAX = 500;
const MAX_EXTRA_URLS = 10;

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function formatScrapeTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

interface ProfileSettingsProps {
  user?: { name?: string; email?: string };
}

export const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const { t, language } = useLanguage();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customizationLoading, setCustomizationLoading] = useState(true);
  const [customizationSaving, setCustomizationSaving] = useState(false);
  const [customizationError, setCustomizationError] = useState<string | null>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);

  const [custEditor, setCustEditor] = useState({
    bot_name: "",
    clinic_name: "",
    doctor_name: "",
    clinic_address: "",
    clinic_phone: "",
    welcome_message: "",
    primary_color: "",
    icon_url: "",
    launcher_text: "",
    position: "right" as ChatbotPosition,
    website_url: "",
    knowledge_additional: "",
    clinical_focus: "",
    scope_strict: true,
    off_topic_keywords: "",
  });
  const [extraUrls, setExtraUrls] = useState<string[]>([]);
  const [newExtraUrl, setNewExtraUrl] = useState("");

  const [scrapeMeta, setScrapeMeta] = useState({
    last_scrape_at: "",
    last_scrape_error: "",
    scraped_content_preview_chars: 0,
  });

  const [custResolved, setCustResolved] = useState({
    clinic_display_name: "",
    doctor_display_name: "",
  });

  const [signatureConfigured, setSignatureConfigured] = useState<boolean | null>(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const fetchSignatureStatus = async () => {
    try {
      const data = await chatbotApi.getSignatureStatus();
      setSignatureConfigured(Boolean(data.configured));
    } catch {
      setSignatureConfigured(null);
    }
  };

  const applyCustomization = (c: ChatbotCustomizationResponse) => {
    setCustEditor({
      bot_name: str(c.bot_name),
      clinic_name: str(c.clinic_name),
      doctor_name: str(c.doctor_name),
      clinic_address: str(c.clinic_address),
      clinic_phone: str(c.clinic_phone),
      welcome_message: str(c.welcome_message ?? c.welcome_text),
      primary_color: str(c.primary_color),
      icon_url: str(c.icon_url),
      launcher_text: str(c.launcher_text),
      position: c.position === "left" ? "left" : "right",
      website_url: str(c.website_url),
      knowledge_additional: str(c.knowledge_additional),
      clinical_focus: str(c.clinical_focus),
      scope_strict: c.scope_strict !== false,
      off_topic_keywords: str(c.off_topic_keywords),
    });
    const urls = Array.isArray(c.scrape_extra_urls)
      ? c.scrape_extra_urls.filter((u) => typeof u === "string" && u.trim())
      : [];
    setExtraUrls(urls.slice(0, MAX_EXTRA_URLS));
    setScrapeMeta({
      last_scrape_at: str(c.last_scrape_at),
      last_scrape_error: str(c.last_scrape_error),
      scraped_content_preview_chars:
        typeof c.scraped_content_preview_chars === "number" ? c.scraped_content_preview_chars : 0,
    });
    setCustResolved({
      clinic_display_name: str(c.clinic_display_name),
      doctor_display_name: str(c.doctor_display_name),
    });
  };

  const fetchCustomization = async () => {
    setCustomizationError(null);
    setCustomizationLoading(true);
    try {
      const c = await chatbotApi.getCustomization();
      applyCustomization(c);
    } catch (err: unknown) {
      setCustomizationError(err instanceof Error ? err.message : t("profile.loadCustomizationFailed", "Could not load chatbot customization."));
    } finally {
      setCustomizationLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([fetchCustomization(), fetchSignatureStatus()]);
  }, []);

  const buildSaveBody = (): ChatbotCustomizationUpdate => ({
    bot_name: custEditor.bot_name.trim(),
    clinic_name: custEditor.clinic_name.trim(),
    doctor_name: custEditor.doctor_name.trim(),
    clinic_address: custEditor.clinic_address.trim(),
    clinic_phone: custEditor.clinic_phone.trim(),
    welcome_message: custEditor.welcome_message.trim(),
    primary_color: custEditor.primary_color.trim(),
    icon_url: custEditor.icon_url.trim(),
    launcher_text: custEditor.launcher_text.trim(),
    position: custEditor.position,
    website_url: custEditor.website_url.trim(),
    knowledge_additional: custEditor.knowledge_additional.trim(),
    clinical_focus: custEditor.clinical_focus.trim(),
    scope_strict: custEditor.scope_strict,
    off_topic_keywords: custEditor.off_topic_keywords.trim(),
    scrape_extra_urls: extraUrls.map((u) => u.trim()).filter(Boolean).slice(0, MAX_EXTRA_URLS),
  });

  const saveChatbotCustomization = async () => {
    setMessage(null);
    setError(null);
    setCustomizationSaving(true);
    try {
      await chatbotApi.putCustomization(buildSaveBody());
      await fetchCustomization();
      setMessage(t("profile.saveSuccessAlert", "Profile saved. PDFs, embed widget, and AI replies use these details."));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("profile.saveErrorAlert", "Could not save profile."));
    } finally {
      setCustomizationSaving(false);
    }
  };

  const runWebsiteScrape = async () => {
    setMessage(null);
    setError(null);
    setScrapeLoading(true);
    try {
      await chatbotApi.putCustomization(buildSaveBody());
      const result = await chatbotApi.scrapeKnowledge({
        url: custEditor.website_url.trim() || undefined,
        extra_urls: extraUrls.map((u) => u.trim()).filter(Boolean),
      });
      await fetchCustomization();
      const pageCount = result.pages?.length ?? 1;
      setMessage(
        t("profile.scrapeSuccessAlert", "Website scraped: {chars} characters from {pages} page(s).")
          .replace("{chars}", String(result.extracted_chars ?? 0))
          .replace("{pages}", String(pageCount))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("profile.scrapeFailedAlert", "Website scrape failed."));
      await fetchCustomization();
    } finally {
      setScrapeLoading(false);
    }
  };

  const addExtraUrl = () => {
    const url = newExtraUrl.trim();
    if (!url) return;
    if (extraUrls.length >= MAX_EXTRA_URLS) {
      setError(t("profile.maxUrlsAlert", "Maximum {max} extra URLs allowed.").replace("{max}", String(MAX_EXTRA_URLS)));
      return;
    }
    if (extraUrls.includes(url)) {
      setNewExtraUrl("");
      return;
    }
    setExtraUrls((p) => [...p, url]);
    setNewExtraUrl("");
    setError(null);
  };

  const removeExtraUrl = (index: number) => {
    setExtraUrls((p) => p.filter((_, i) => i !== index));
  };

  const onSignatureFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMessage(null);
    setError(null);
    setSignatureUploading(true);
    try {
      await chatbotApi.uploadSignature(file);
      setMessage(t("profile.signatureUploadSuccessAlert", "Signature / logo uploaded. It will appear on treatment estimate PDFs."));
      await fetchSignatureStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("profile.signatureUploadFailedAlert", "Signature upload failed."));
    } finally {
      setSignatureUploading(false);
    }
  };

  const setCust =
    (key: keyof typeof custEditor) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val =
        e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setCustEditor((p) => ({ ...p, [key]: val }));
    };

  const inputClass = "w-full rounded-2xl border border-slate-200/80 bg-white/70 pl-11 pr-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400 font-medium";
  const textareaClass = "w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400 font-medium";
  const selectClass = "w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 font-medium";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1";

  const colorPresets = [
    { hex: "#0d9488", name: "Teal Mint" },
    { hex: "#6366f1", name: "Royal Indigo" },
    { hex: "#d946ef", name: "Rose Violet" },
    { hex: "#f97316", name: "Crimson Orange" },
    { hex: "#10b981", name: "Emerald" },
  ];

  const hasScrapedContent = scrapeMeta.scraped_content_preview_chars > 0;
  const scrapeFailed = Boolean(scrapeMeta.last_scrape_error);

  return (
    <div className="w-full space-y-6">
      {(message || error) && (
        <DashAlert variant={error ? "error" : "success"}>{error || message}</DashAlert>
      )}

      <DashCard>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="inline-flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
            <Building2 className="h-6 w-6 shrink-0 text-teal-600" aria-hidden />
            <div>
              <p className="text-base font-bold text-slate-900">{t("profile.clinicAndChatbot", "Clinic & chatbot")}</p>
              <p className="text-xs text-slate-500">
                {t("profile.clinicDesc", "Letterhead fields feed PDFs and the AI system prompt. Login identity stays on /auth/me only.").includes("/auth/me") ? t("profile.clinicDesc", "Letterhead fields feed PDFs and the AI system prompt. Login identity stays on /auth/me only.").split("/auth/me")[0] : t("profile.clinicDesc", "Letterhead fields feed PDFs and the AI system prompt. Login identity stays on /auth/me only.")}
                <code className="rounded bg-slate-100 px-1">/auth/me</code>
                {t("profile.clinicDesc", "Letterhead fields feed PDFs and the AI system prompt. Login identity stays on /auth/me only.").includes("/auth/me") ? t("profile.clinicDesc", "Letterhead fields feed PDFs and the AI system prompt. Login identity stays on /auth/me only.").split("/auth/me")[1] : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || t("profile.defaultUser", "User"))}&background=0f766e&color=fff&bold=true`}
              alt=""
              className="h-9 w-9 rounded-lg"
            />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name || t("profile.defaultDoctor", "Doctor")}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || "—"}</p>
            </div>
          </div>
        </div>

        {customizationLoading ? (
          <p className="text-sm text-slate-500">{t("generic.loading", "Loading...")}</p>
        ) : customizationError ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{customizationError}</p>
            <button
              type="button"
              onClick={() => void fetchCustomization()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("overview.retry", "Retry")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-teal-900">{t("profile.resolvedTitle", "Resolved for PDF & model (read-only)")}</p>
              <p className="mt-1">
                <span className="text-slate-500">{t("profile.clinicLine", "Clinic line: ")}</span>
                {custResolved.clinic_display_name || "—"}
              </p>
              <p>
                <span className="text-slate-500">{t("profile.doctorLine", "Doctor line: ")}</span>
                {custResolved.doctor_display_name || "—"}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2 text-left">
                <label className={labelClass}>{t("profile.botName", "Bot / public title")}</label>
                <div className="relative">
                  <Sparkles size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    value={custEditor.bot_name}
                    onChange={setCust("bot_name")}
                    placeholder={t("profile.botNamePlaceholder", "e.g. ClinicSuite Assistant")}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 text-left">
                <label className={labelClass}>{t("profile.clinicName", "Clinic Name")}</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    value={custEditor.clinic_name}
                    onChange={setCust("clinic_name")}
                    placeholder={t("profile.clinicNamePlaceholder", "Formal clinic name — if empty, bot name is used")}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 text-left">
                <label className={labelClass}>{t("profile.doctorName", "Doctor Name")}</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    value={custEditor.doctor_name}
                    onChange={setCust("doctor_name")}
                    placeholder={t("profile.doctorNamePlaceholder", "e.g. Dr Your Name — if empty, account name is used")}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 text-left">
                <label className={labelClass}>{t("profile.clinicAddress", "Clinic address")}</label>
                <textarea
                  value={custEditor.clinic_address}
                  onChange={setCust("clinic_address")}
                  placeholder={t("profile.clinicAddressPlaceholder", "Full address, city, PIN")}
                  rows={3}
                  className={`${textareaClass} resize-y`}
                />
              </div>

              <div className="sm:col-span-2 text-left">
                <label className={labelClass}>{t("profile.clinicPhone", "Clinic phone")}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    value={custEditor.clinic_phone}
                    onChange={setCust("clinic_phone")}
                    placeholder={t("profile.clinicPhonePlaceholder", "+91 …")}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-3 inline-flex items-center gap-2 text-slate-700">
                <BookOpen size={16} className="text-teal-600" aria-hidden />
                <span className="text-sm font-bold">{t("profile.knowledgeBase", "Knowledge Base")}</span>
              </div>
              <p className="mb-4 text-xs text-slate-500">
                {t("profile.knowledgeDesc", "Manual notes plus scraped website text power AI answers. Scraped text is never exposed publicly — only a character count is shown here.")}
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className={labelClass}>{t("profile.clinicWebsite", "Clinic website (primary scrape URL)")}</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      value={custEditor.website_url}
                      onChange={setCust("website_url")}
                      placeholder={t("profile.clinicWebsitePlaceholder", "https://myclinic.com")}
                      type="url"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className={labelClass}>
                    {t("profile.additionalInfo", "Additional info (timings, fees, services) — max {max} chars").replace("{max}", KNOWLEDGE_MAX.toLocaleString(language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "de-DE"))}
                  </label>
                  <textarea
                    value={custEditor.knowledge_additional}
                    onChange={setCust("knowledge_additional")}
                    maxLength={KNOWLEDGE_MAX}
                    placeholder={t("profile.additionalInfoPlaceholder", "OPD: Mon–Sat 10am–6pm. Consultation ₹500. Cashless: HDFC, ICICI…")}
                    rows={4}
                    className={`${textareaClass} resize-y`}
                  />
                  <p className="text-right text-[10px] font-bold text-slate-400 font-mono">
                    {custEditor.knowledge_additional.length.toLocaleString()} /{" "}
                    {KNOWLEDGE_MAX.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  <span className={labelClass}>{t("profile.extraPages", "Extra pages to scrape (max {max})").replace("{max}", String(MAX_EXTRA_URLS))}</span>
                  <div className="flex gap-2">
                    <div className="relative flex-1 min-w-0">
                      <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        value={newExtraUrl}
                        onChange={(e) => setNewExtraUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExtraUrl())}
                        placeholder={t("profile.extraPagesPlaceholder", "https://myclinic.com/services")}
                        type="url"
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addExtraUrl}
                      disabled={extraUrls.length >= MAX_EXTRA_URLS}
                      className="shrink-0 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100 active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                      {t("profile.addUrl", "Add URL")}
                    </button>
                  </div>
                  {extraUrls.length > 0 && (
                    <ul className="space-y-1.5 mt-2">
                      {extraUrls.map((url, i) => (
                        <li
                          key={`${url}-${i}`}
                          className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs text-slate-600"
                        >
                          <Globe size={13} className="shrink-0 text-teal-600" />
                          <span className="min-w-0 flex-1 truncate font-medium">{url}</span>
                          <button
                            type="button"
                            onClick={() => removeExtraUrl(i)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition active:scale-95"
                            aria-label={t("profile.removeUrl", "Remove URL")}
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Scrape Status Dashboard Terminal */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl font-mono text-xs text-slate-300 relative overflow-hidden text-left">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2.5 mb-3">
                    <span className="h-2 w-2 rounded-full bg-red-500/80" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                    <span className="h-2 w-2 rounded-full bg-green-500/80" />
                    <span className="ml-1 text-[9px] text-slate-500 uppercase tracking-widest">{t("profile.scraperStatus", "Knowledge Scraper Status")}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="text-slate-500">{t("profile.systemLoad", "SYSTEM_LOAD:")}</span>
                      <span className={cn("font-bold uppercase", hasScrapedContent ? "text-emerald-400" : "text-amber-400")}>
                        {hasScrapedContent ? t("profile.statusScrapeActive", "SCRAPE_ACTIVE") : t("profile.statusNoContentLoaded", "NO_CONTENT_LOADED")}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-slate-500">{t("profile.contentSize", "CONTENT_SIZE:")}</span>
                      <span className="font-bold text-teal-400">{scrapeMeta.scraped_content_preview_chars.toLocaleString()} bytes</span>
                    </p>
                    {scrapeMeta.last_scrape_at && (
                      <p className="flex items-center gap-2">
                        <span className="text-slate-500">{t("profile.lastScan", "LAST_SCAN:")}</span>
                        <span className="text-slate-205">{formatScrapeTime(scrapeMeta.last_scrape_at)}</span>
                      </p>
                    )}
                    {scrapeFailed && (
                      <div className="flex items-start gap-2 border border-red-900/30 bg-red-950/20 p-2.5 rounded-xl mt-2 text-red-400">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{t("profile.errorLabel", "ERROR:")} {scrapeMeta.last_scrape_error}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      disabled={scrapeLoading || customizationSaving || !custEditor.website_url.trim()}
                      onClick={() => void runWebsiteScrape()}
                      className="btn-shine inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-950/30 transition hover:bg-teal-700 active:scale-95 disabled:opacity-50"
                    >
                      {scrapeLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                      {scrapeLoading ? t("profile.scrapingAssets", "SCRAPING_ASSETS...") : t("profile.scrapeNow", "SCRAPE NOW")}
                    </button>
                    <span className="text-[10px] text-slate-500 leading-normal">
                      {t("profile.scrapeNote", "Note: Scrape pulls index and deep links up to 10 subpages.")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-3 inline-flex items-center gap-2 text-slate-700">
                <ShieldCheck size={16} className="text-teal-600" aria-hidden />
                <span className="text-sm font-bold">{t("profile.clinicalScope", "Clinical scope")}</span>
              </div>
              <p className="mb-4 text-xs text-slate-500">
                {t("profile.clinicalScopeDesc", "Controls how strictly the bot stays within your specialty and refuses off-topic medical detail.")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 sm:col-span-2">
                  <span className={labelClass}>{t("profile.clinicalFocus", "Clinical focus (comma-separated, max {max})").replace("{max}", CLINICAL_FOCUS_MAX.toLocaleString(language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "de-DE"))}</span>
                  <input
                    value={custEditor.clinical_focus}
                    onChange={setCust("clinical_focus")}
                    maxLength={CLINICAL_FOCUS_MAX}
                    placeholder={t("profile.clinicalFocusPlaceholder", "diabetes, thyroid, sugar, lifestyle")}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className={labelClass}>{t("profile.offTopicKeywords", "Off-topic keywords (max {max})").replace("{max}", OFF_TOPIC_MAX.toLocaleString(language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "de-DE"))}</span>
                  <input
                    value={custEditor.off_topic_keywords}
                    onChange={setCust("off_topic_keywords")}
                    maxLength={OFF_TOPIC_MAX}
                    placeholder={t("profile.offTopicKeywordsPlaceholder", "cancer, chemo, oncology, cardiac surgery")}
                    className={inputClass}
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={custEditor.scope_strict}
                    onChange={setCust("scope_strict")}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">
                    <span className="font-semibold">{t("profile.strictScope", "Strict scope")}</span> {t("profile.strictScopeDesc", "— refuse detailed advice outside clinical focus (recommended)")}
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-3 inline-flex items-center gap-2 text-slate-700">
                <Palette size={16} className="text-teal-600" aria-hidden />
                <span className="text-sm font-bold">{t("profile.embedWidget", "Embed widget")}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 text-left">
                  <label className={labelClass}>{t("profile.welcomeMessage", "Welcome message")}</label>
                  <textarea
                    value={custEditor.welcome_message}
                    onChange={setCust("welcome_message")}
                    placeholder={t("profile.welcomeMessagePlaceholder", "Namaste! Main aapki madad kaise kar sakta hoon?")}
                    rows={2}
                    className={`${textareaClass} resize-y`}
                  />
                </div>

                <div className="sm:col-span-2 text-left space-y-2">
                  <label className={labelClass}>{t("profile.primaryColorTheme", "Primary color theme")}</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {colorPresets.map((preset) => {
                      const isSelected = custEditor.primary_color.toLowerCase() === preset.hex;
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setCustEditor(p => ({ ...p, primary_color: preset.hex }))}
                          className="h-8 w-8 rounded-full border border-slate-205/50 relative shadow-sm transition active:scale-95 flex items-center justify-center cursor-pointer"
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        >
                          {isSelected && <Check size={14} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] animate-scale" />}
                        </button>
                      );
                    })}
                    
                    {/* Custom Hex selector */}
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                      <div className="relative h-8 w-8 rounded-full border border-slate-250/80 overflow-hidden cursor-pointer shadow-sm">
                        <input
                          type="color"
                          value={
                            /^#[0-9A-Fa-f]{6}$/.test(custEditor.primary_color)
                              ? custEditor.primary_color
                              : "#3b82f6"
                          }
                          onChange={(e) =>
                            setCustEditor((p) => ({ ...p, primary_color: e.target.value }))
                          }
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <div className="h-full w-full" style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(custEditor.primary_color) ? custEditor.primary_color : "#3b82f6" }} />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">#</span>
                        <input
                          value={custEditor.primary_color.replace(/^#/, "")}
                          onChange={(e) => setCustEditor(p => ({ ...p, primary_color: `#${e.target.value}` }))}
                          placeholder="3b82f6"
                          maxLength={6}
                          className="w-24 rounded-xl border border-slate-200 bg-white/70 pl-6 pr-2 py-1.5 text-xs text-slate-800 outline-none transition focus:border-teal-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-1 text-left">
                  <label className={labelClass}>{t("profile.widgetPosition", "Widget position")}</label>
                  <select
                    value={custEditor.position}
                    onChange={setCust("position")}
                    className={selectClass}
                  >
                    <option value="right">{t("profile.positionRight", "Right")}</option>
                    <option value="left">{t("profile.positionLeft", "Left")}</option>
                  </select>
                </div>

                <div className="sm:col-span-1 text-left">
                  <label className={labelClass}>{t("profile.launcherLabel", "Launcher label")}</label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      value={custEditor.launcher_text}
                      onChange={setCust("launcher_text")}
                      placeholder={t("profile.launcherPlaceholder", "Chat")}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 text-left">
                  <label className={labelClass}>{t("profile.botIconUrl", "Bot icon URL")}</label>
                  <div className="relative">
                    <Image size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      value={custEditor.icon_url}
                      onChange={setCust("icon_url")}
                      placeholder={t("profile.botIconUrlPlaceholder", "https://cdn.example.com/icon.png")}
                      type="url"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={customizationSaving || scrapeLoading}
                onClick={() => void saveChatbotCustomization()}
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
              >
                {customizationSaving ? t("profile.saving", "Saving...") : t("profile.saveProfile", "Save profile")}
              </button>
              <p className="text-xs text-slate-500">
                {t("profile.saveProfileDesc", "Save clinic + knowledge + scope, then scrape website. Test answers in AI Health Chat.")}
              </p>
            </div>
          </div>
        )}
      </DashCard>

      <DashCard>
        <div className="mb-4 inline-flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <PenLine className="h-6 w-6 shrink-0 text-teal-600" aria-hidden />
          <div>
            <p className="text-base font-bold text-slate-900">{t("profile.pdfSignature", "PDF signature / logo")}</p>
            <p className="text-xs text-slate-500 font-medium">
              {t("profile.pdfSignatureDesc", "Shown at the bottom of treatment estimate PDFs. Accepts PNG, JPEG, WebP, or GIF (max ~2.5 MB).")}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {/* Left Panel: Dropzone simulator */}
          <div
            onClick={() => !signatureUploading && signatureInputRef.current?.click()}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300",
              signatureConfigured
                ? "border-emerald-300 bg-emerald-50/20 hover:border-emerald-400 hover:bg-emerald-50/30"
                : "border-slate-205/60 bg-slate-50/40 hover:border-teal-400 hover:bg-teal-50/10"
            )}
          >
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={onSignatureFile}
            />
            
            <div className={cn(
              "mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition duration-300 group-hover:scale-105",
              signatureConfigured ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600"
            )}>
              {signatureUploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : signatureConfigured ? (
                <FileCheck size={20} />
              ) : (
                <Upload size={20} />
              )}
            </div>

            <p className="text-sm font-semibold text-slate-700">
              {signatureUploading ? t("profile.uploadingSignature", "Uploading Signature Assets...") : signatureConfigured ? t("profile.signatureConfigured", "Signature Configured") : t("profile.uploadSignature", "Upload your Signature / Logo")}
            </p>
            <p className="mt-1 text-xs text-slate-405 font-medium">
              {signatureUploading ? t("profile.uploadingWait", "Please wait, uploading to cloud bucket...") : t("profile.dragDropBrowse", "Drag & drop or click to browse files")}
            </p>
            
            {/* Hover subtle glow ring */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-slate-900/5 group-hover:ring-teal-500/20 transition" />
          </div>

          {/* Right Panel: Status Info & Badges */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("profile.integrationChannel", "Integration Channel")}</span>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                  signatureConfigured 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  {signatureConfigured ? t("profile.statusActive", "ACTIVE") : t("profile.statusPending", "PENDING")}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {signatureConfigured 
                    ? t("profile.signatureConfiguredDesc", "Successfully loaded and configured for the PDF report generator. Your signature or logo will automatically append onto treatment documents.")
                    : t("profile.signaturePendingDesc", "Not configured yet. Estimate PDFs will print a placeholder line instead of your dynamic letterhead signature/logo stamp.")}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">{t("profile.fileLimit", "File Limit: 2.5 MB")}</span>
              {signatureConfigured && (
                <button
                  type="button"
                  disabled={signatureUploading}
                  onClick={() => signatureInputRef.current?.click()}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 transition"
                >
                  {t("profile.replaceSignature", "Replace Signature")}
                </button>
              )}
            </div>
          </div>
        </div>
      </DashCard>
    </div>
  );
};
