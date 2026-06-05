"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  Mail,
  Search,
  PlusCircle,
  X,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { prescriptionApi, type PrescriptionRequestItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

export const PrescriptionDashboard = () => {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<PrescriptionRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "sent">("all");

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<PrescriptionRequestItem | null>(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewRequest, setViewRequest] = useState<PrescriptionRequestItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New manual prescription state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualSymptoms, setManualSymptoms] = useState("");

  const DEFAULT_PRESCRIPTION_TEMPLATE = `1. Tab. \n   Dosage: \n\n2. Syr. \n   Dosage: \n\nInstructions: `;

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await prescriptionApi.getPrescriptionRequests();
      setRequests(data.requests || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("prescription.noRequestsSub", "Failed to load prescription requests."));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWriteModal = (req: PrescriptionRequestItem) => {
    setSelectedRequest(req);
    setPrescriptionText(DEFAULT_PRESCRIPTION_TEMPLATE);
  };

  const handleOpenCreateModal = () => {
    setManualName("");
    setManualEmail("");
    setManualSymptoms("");
    setPrescriptionText(DEFAULT_PRESCRIPTION_TEMPLATE);
    setShowCreateModal(true);
  };

  const handleManualNameChange = (val: string) => {
    setManualName(val);
  };

  const handleManualSymptomsChange = (val: string) => {
    setManualSymptoms(val);
  };

  const handleResetTemplate = () => {
    setPrescriptionText(DEFAULT_PRESCRIPTION_TEMPLATE);
  };

  const handleCreateAndSendPrescription = async () => {
    if (!manualName.trim() || !manualEmail.trim() || !prescriptionText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await prescriptionApi.createAndSendPrescription({
        patient_name: manualName.trim(),
        patient_email: manualEmail.trim(),
        symptoms: manualSymptoms.trim(),
        prescription_text: prescriptionText,
      });
      setSuccessMessage(
        res.email_sent
          ? t("prescription.sentSuccess", "Prescription sent successfully via email to ") + manualEmail
          : t("prescription.savedSuccess", "Prescription saved successfully! Email delivery fallback logged locally.")
      );
      setShowCreateModal(false);
      void loadRequests();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("prescription.dispatchError", "Failed to create and dispatch prescription."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendPrescription = async () => {
    if (!selectedRequest || !prescriptionText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await prescriptionApi.sendPrescription(selectedRequest.id, prescriptionText);
      setSuccessMessage(
        res.email_sent
          ? t("prescription.sentSuccess", "Prescription sent successfully via email to ") + selectedRequest.patient_email
          : t("prescription.savedSuccess", "Prescription saved successfully! Email delivery fallback logged locally.")
      );
      setSelectedRequest(null);
      void loadRequests();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("prescription.dispatchError", "Failed to dispatch prescription."));
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const sentCount = requests.filter((r) => r.status === "sent").length;

  // Filter requests list
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.patient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.symptoms || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ── top statistics cards ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: t("prescription.totalRequests", "Total Requests"),
            value: totalCount,
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/5 border-blue-500/10",
          },
          {
            title: t("prescription.pendingAction", "Pending Action"),
            value: pendingCount,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/5 border-amber-500/10",
          },
          {
            title: t("prescription.sent", "Prescriptions Sent"),
            value: sentCount,
            icon: CheckCircle2,
            color: "text-teal-500",
            bg: "bg-teal-500/5 border-teal-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className={cn(
              "dash-glass flex items-center justify-between p-5 rounded-2xl border transition duration-300 hover:scale-[1.02]",
              stat.bg
            )}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.title}</p>
              <p className="mt-2 text-3xl font-black text-slate-800 tabular-nums">{stat.value}</p>
            </div>
            <div className={cn("p-3 rounded-xl bg-white/60 shadow-inner", stat.color)}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Notifications / Error */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal-500/25 bg-teal-500/10 px-4 py-3.5 text-sm font-semibold text-teal-800 animate-pulse">
          <CheckCircle2 className="text-teal-600 shrink-0" size={18} />
          <span className="flex-1">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm font-semibold text-red-800">
          <AlertCircle className="text-red-500 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── main actions & list grid ─────────────────────── */}
      <div className="dash-glass rounded-2xl border border-slate-200/50 bg-white p-6 shadow-xs">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Section title */}
          <div>
            <h3 className="text-lg font-bold text-slate-800">{t("prescription.title", "Prescription Requests")}</h3>
            <p className="text-xs font-semibold text-slate-400">{t("prescription.subtitle", "Incoming prescription requests from the AI chatbot widget")}</p>
          </div>

          {/* Filter / Search toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Write New Button */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-750 transition"
            >
              <PlusCircle size={14} /> {t("prescription.write", "Write Prescription")}
            </button>

            {/* Search Input */}
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-2 py-1.5 focus-within:border-teal-400 focus-within:bg-white transition">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder={t("reviews.searchPlaceholder", "Search patient, symptoms...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 w-44"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {(["all", "pending", "sent"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-bold transition capitalize",
                    statusFilter === status
                      ? "bg-teal-650 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {status === "all" ? t("reviews.all", "all") : status === "pending" ? t("reviews.pending", "pending") : t("reviews.repliedLabel", "sent")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── request table ──────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-teal-550" />
            <p className="text-sm font-semibold">{t("prescription.loading", "Loading requests...")}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <FileText size={40} className="text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">{t("prescription.noRequests", "No requests found")}</p>
            <p className="text-xs max-w-xs mt-1">
              {searchQuery || statusFilter !== "all"
                ? t("reviews.noReviewsMatchFilters", "Try adjusting your search query or filter settings.")
                : t("prescription.noRequestsSub", "Prescription requests booked by patients in your chatbot widget will appear here.")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-3">{t("prescription.patient", "Patient")}</th>
                  <th className="pb-3">{t("prescription.symptoms", "Symptoms / Notes")}</th>
                  <th className="pb-3">{t("prescription.date", "Request Date")}</th>
                  <th className="pb-3">{t("prescription.status", "Status")}</th>
                  <th className="pb-3 text-right pr-3">{t("prescription.action", "Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pl-3">
                      <div className="font-bold text-slate-800">{req.patient_name}</div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mt-0.5">
                        <Mail size={11} /> {req.patient_email}
                      </div>
                    </td>
                    <td className="py-4 max-w-[200px] truncate pr-4 font-medium text-slate-500" title={req.symptoms}>
                      {req.symptoms || "—"}
                    </td>
                    <td className="py-4 text-xs font-semibold text-slate-400">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString(
                            language === "hi" ? "hi-IN" : language === "de" ? "de-DE" : "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "—"}
                    </td>
                    <td className="py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide",
                          req.status === "pending"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", req.status === "pending" ? "bg-amber-500" : "bg-teal-500")} />
                        {req.status === "pending" ? t("reviews.pending", "Pending") : t("reviews.repliedLabel", "Sent")}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-3">
                      {req.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => handleOpenWriteModal(req)}
                          className="inline-flex items-center gap-1 rounded-xl bg-teal-650 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-750 transition"
                        >
                          <PlusCircle size={14} /> {t("prescription.write", "Write Prescription")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setViewRequest(req)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-655 hover:bg-slate-55 hover:text-slate-800 transition"
                        >
                          <Eye size={14} /> {t("prescription.viewSent", "View Sent")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Write Prescription Modal ──────────────────────── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0e172a] text-slate-100 shadow-2xl p-6 relative overflow-hidden animate-[dash-enter_0.3s_ease-out]">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="text-teal-400" size={18} />
                <h3 className="text-base font-bold text-white">{t("prescription.createTitle", "Create & Dispatch Prescription")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Patient overview info */}
            <div className="rounded-2xl bg-slate-950 border border-slate-850 p-4.5 space-y-2 text-xs text-slate-300 mb-4">
              <p>
                <span className="font-bold text-slate-500 mr-2 uppercase tracking-wide">{t("prescription.patient", "Patient")}:</span>
                <strong className="text-white">{selectedRequest.patient_name}</strong> ({selectedRequest.patient_email})
              </p>
              <p className="flex items-start gap-1">
                <span className="font-bold text-slate-500 mr-2 uppercase tracking-wide shrink-0">{t("prescription.symptoms", "Symptoms")}:</span>
                <span className="italic leading-normal">{selectedRequest.symptoms || t("prescription.noRequestsSub", "General medication advice requested")}</span>
              </p>
            </div>

            {/* Prescription Details Textarea */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  {t("prescription.write", "Prescription Content")} (Rx)
                </label>
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition"
                >
                  {t("prescription.resetTemplate", "Reset to Template")}
                </button>
              </div>
              <textarea
                rows={12}
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder={t("prescription.medicinesPlaceholder", "Type medicines, dosage and instructions here...")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm font-mono leading-relaxed text-slate-200 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition placeholder:text-slate-650"
              />
              <p className="text-[10px] font-semibold text-slate-500">
                {t("prescription.pdfDisclaimer", "This content will be printed on the official A4 PDF prescription. You can edit this freely.")}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                disabled={submitting}
                className="rounded-xl border border-slate-850 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
              >
                {t("generic.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleSendPrescription}
                disabled={submitting || !prescriptionText.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-500/10 hover:bg-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> {t("prescription.dispatching", "Dispatching...")}
                  </>
                ) : (
                  <>
                    <Mail size={13} /> {t("prescription.sendEmailComplete", "Send Email & Complete")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Prescription Modal ───────────────────────── */}
      {viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0e172a] text-slate-100 shadow-2xl p-6 relative overflow-hidden animate-[dash-enter_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-teal-400" size={18} />
                <h3 className="text-base font-bold text-white">{t("prescription.viewTitle", "View Sent Prescription")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewRequest(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Overview info */}
            <div className="rounded-2xl bg-slate-950 border border-slate-850 p-4.5 text-xs text-slate-350 space-y-1 mb-4">
              <p><span className="font-bold text-slate-500 mr-2 uppercase tracking-wide">{t("prescription.patient", "Patient")}:</span><strong className="text-white">{viewRequest.patient_name}</strong></p>
              <p><span className="font-bold text-slate-500 mr-2 uppercase tracking-wide">{t("chat.emailAddress", "Email")}:</span>{viewRequest.patient_email}</p>
              <p><span className="font-bold text-slate-500 mr-2 uppercase tracking-wide">{t("prescription.status", "Status")}:</span><span className="text-teal-400 font-bold">{t("prescription.dispatchedViaEmail", "Dispatched via Email")}</span></p>
            </div>

            {/* Details content */}
            <div className="space-y-2 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("prescription.write", "Prescription Content")}</p>
              <div className="w-full h-80 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 overflow-y-auto text-sm font-semibold text-slate-200 whitespace-pre-wrap leading-relaxed font-mono">
                {viewRequest.prescription_text}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setViewRequest(null)}
                className="rounded-xl border border-slate-850 bg-slate-900/60 px-5 py-2.5 text-xs font-bold text-slate-350 hover:bg-slate-800 hover:text-white transition"
              >
                {t("chat.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create New Prescription Modal ────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0e172a] text-slate-100 shadow-2xl p-6 relative overflow-hidden animate-[dash-enter_0.3s_ease-out]">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="text-teal-400" size={18} />
                <h3 className="text-base font-bold text-white">{t("prescription.createTitle", "Write & Dispatch Prescription")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Patient Form Fields */}
            <div className="space-y-3 mb-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("chat.patientName", "Patient Name")}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditya"
                    value={manualName}
                    onChange={(e) => handleManualNameChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("chat.emailAddress", "Patient Email")}</label>
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t("chat.symptoms", "Diagnosis / Symptoms")}</label>
                <input
                  type="text"
                  placeholder="e.g. skin allergy, fever"
                  value={manualSymptoms}
                  onChange={(e) => handleManualSymptomsChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition"
                />
              </div>
            </div>

            {/* Prescription Details Textarea */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  {t("prescription.write", "Prescription Content")} (Rx)
                </label>
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition"
                >
                  {t("prescription.resetTemplate", "Reset to Template")}
                </button>
              </div>
              <textarea
                rows={12}
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder={t("prescription.medicinesPlaceholder", "Type medicines, dosage and instructions here...")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm font-mono leading-relaxed text-slate-200 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition placeholder:text-slate-650"
              />
              <p className="text-[10px] font-semibold text-slate-500">
                {t("prescription.pdfDisclaimer", "This content will be printed on the official A4 PDF prescription. You can edit this freely.")}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                className="rounded-xl border border-slate-850 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
              >
                {t("generic.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleCreateAndSendPrescription}
                disabled={submitting || !manualName.trim() || !manualEmail.trim() || !prescriptionText.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-650 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-500/10 hover:bg-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> {t("prescription.dispatching", "Dispatching...")}
                  </>
                ) : (
                  <>
                    <Mail size={13} /> {t("prescription.sendEmailComplete", "Send Email & Complete")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
