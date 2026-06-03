"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Code2, Copy, Link2, Loader2, Mail, Plus, Trash2, Unlink2 } from "lucide-react";
import { ReviewIntegrationsPanel } from "@/components/integrations/ReviewIntegrationsPanel";
import { DashAlert } from "@/components/layout/DashboardPrimitives";
import { API_BASE_URL, bookingApi, chatbotApi, youtubeApi, EmbedWidgetKeyListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

const panel = "dash-glass rounded-3xl border border-slate-200/50 shadow-sm";

const GoogleCalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="28" height="28" aria-hidden>
    <path fill="#FFF" d="M195.368 60.632H60.632v134.736h134.736z" />
    <path fill="#EA4335" d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z" />
    <path fill="#188038" d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172z" />
    <path fill="#1967D2" d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196q0 10.641 5.533 27.436q20.115 5.76 30.316 5.76T256 60.631" />
    <path fill="#FBBC04" d="M256 60.632h-60.632v134.736H256z" />
    <path fill="#34A853" d="M195.368 195.368H60.632V256h134.736z" />
    <path fill="#4285F4" d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="28" height="28" aria-hidden>
    <path
      fill="#E91414"
      d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z"
    />
  </svg>
);

function buildEmbedSnippet(widgetKey: string) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  return `<script
  src="${base}/static/embed-chatbot.js"
  data-api-base="${base}"
  data-widget-key="${widgetKey}"
  async
></script>`;
}

function StatusPill({ connected, ready }: { connected: boolean; ready?: boolean }) {
  if (ready) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/20 shadow-sm shadow-emerald-500/5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Connected
      </span>
    );
  }
  if (connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-500/20 shadow-sm shadow-amber-500/5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Setup needed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2.5 py-1 text-[11px] font-bold text-slate-400 ring-1 ring-slate-200/50">
      Not connected
    </span>
  );
}

function IntegrationCard({
  icon,
  title,
  description,
  connected,
  email,
  connectLabel,
  onConnect,
  onDisconnect,
  busy,
  accent = "teal",
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  email?: string;
  connectLabel: string;
  onConnect: () => void;
  onDisconnect: () => void;
  busy: boolean;
  accent?: "teal" | "red" | "violet";
  className?: string;
}) {
  const brandGlow =
    accent === "red"
      ? "from-red-500/10 via-rose-500/5 to-transparent"
      : accent === "violet"
        ? "from-violet-500/10 via-purple-500/5 to-transparent"
        : "from-teal-500/10 via-cyan-500/5 to-transparent";

  const btnAccent =
    accent === "red"
      ? "bg-red-600 shadow-red-650/20 hover:bg-red-700 hover:shadow-red-650/35 border-red-500/30"
      : accent === "violet"
        ? "bg-violet-600 shadow-violet-650/20 hover:bg-violet-700 hover:shadow-violet-650/35 border-violet-500/30"
        : "bg-teal-600 shadow-teal-650/20 hover:bg-teal-700 hover:shadow-teal-650/35 border-teal-500/30";

  return (
    <div className={cn(panel, "relative overflow-hidden group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg", className)}>
      {/* Background glow orb */}
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition-all duration-500 group-hover:opacity-100", brandGlow)} />
      
      <div className="relative flex flex-1 flex-col justify-between gap-5">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100/50 transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-extrabold text-slate-805 text-[16px]">{title}</h3>
              <StatusPill connected={connected} ready={connected} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
            {connected && email && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs text-slate-650 font-medium">
                <Mail size={13} className="text-slate-400" />
                {email}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-auto flex justify-end pt-3 border-t border-slate-100/50">
          {connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <Unlink2 size={14} />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={busy}
              className={cn(
                "btn-shine inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 disabled:opacity-50",
                btnAccent
              )}
            >
              <Link2 size={14} />
              {connectLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const IntegrationsSettings = () => {
  const [busy, setBusy] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeEmail, setYoutubeEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [embedSnippet, setEmbedSnippet] = useState("");
  const [embedCopied, setEmbedCopied] = useState(false);
  const [embedCreating, setEmbedCreating] = useState(false);

  const [keys, setKeys] = useState<EmbedWidgetKeyListItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [revokingKeyId, setRevokingKeyId] = useState<number | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await chatbotApi.listEmbedKeys();
      setKeys(res.keys || []);
    } catch (err: unknown) {
      console.error("Could not fetch embed keys:", err);
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  const fetchCalendarStatus = async () => {
    try {
      const data = await bookingApi.getCalendarStatus();
      setCalendarConnected(Boolean(data.connected));
      setCalendarEmail(data.email || "");
    } catch {
      setCalendarConnected(false);
      setCalendarEmail("");
    }
  };

  const fetchYoutubeStatus = async () => {
    try {
      const data = await youtubeApi.getStatus();
      setYoutubeConnected(Boolean(data.connected));
      setYoutubeEmail(data.email || "");
    } catch {
      setYoutubeConnected(false);
      setYoutubeEmail("");
    }
  };

  useEffect(() => {
    setBusy(true);
    Promise.all([fetchCalendarStatus(), fetchYoutubeStatus(), fetchKeys()]).finally(() => setBusy(false));
  }, [fetchKeys]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event?.data?.type === "GOOGLE_CALENDAR_CONNECTED") {
        setMessage("Google Calendar connected.");
        setError(null);
        await fetchCalendarStatus();
      }
      if (event?.data?.type === "YOUTUBE_CONNECTED") {
        setMessage("YouTube connected.");
        setError(null);
        await fetchYoutubeStatus();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const generateEmbed = async () => {
    setEmbedCreating(true);
    setError(null);
    const label = newKeyLabel.trim() || "Clinic website";
    try {
      const res = await chatbotApi.createEmbedKey(label);
      setEmbedSnippet(buildEmbedSnippet(res.widget_key));
      setMessage("Embed code ready — copy it below. The key is shown only once.");
      setNewKeyLabel("");
      await fetchKeys();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create embed key.");
    } finally {
      setEmbedCreating(false);
    }
  };

  const revokeKey = async (keyId: number) => {
    setRevokingKeyId(keyId);
    setError(null);
    try {
      await chatbotApi.revokeEmbedKey(keyId);
      setMessage("Embed key revoked successfully.");
      await fetchKeys();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not revoke embed key.");
    } finally {
      setRevokingKeyId(null);
    }
  };

  const copyEmbed = async () => {
    if (!embedSnippet) return;
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch {
      setError("Could not copy. Select the code and copy manually.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      {(message || error) && (
        <DashAlert variant={error ? "error" : "success"}>{error || message}</DashAlert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <IntegrationCard
          icon={<GoogleCalendarIcon />}
          title="Google Calendar"
          description="Appointments from your chat widget sync to your calendar."
          connected={calendarConnected}
          email={calendarEmail}
          connectLabel="Connect"
          onConnect={() => {
            setError(null);
            try {
              bookingApi.connectGoogleCalendarPopup();
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Could not open connect window.");
            }
          }}
          onDisconnect={async () => {
            setBusy(true);
            try {
              await bookingApi.disconnectGoogleCalendar();
              setMessage("Calendar disconnected.");
              await fetchCalendarStatus();
            } catch {
              setError("Could not disconnect calendar.");
            } finally {
              setBusy(false);
            }
          }}
          busy={busy}
        />

        <IntegrationCard
          icon={<YoutubeIcon />}
          title="YouTube"
          description="Publish videos from Video Studio and track performance."
          connected={youtubeConnected}
          email={youtubeEmail}
          connectLabel="Connect"
          accent="red"
          onConnect={() => {
            setError(null);
            try {
              youtubeApi.connectPopup();
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Could not open connect window.");
            }
          }}
          onDisconnect={async () => {
            setBusy(true);
            try {
              await youtubeApi.disconnect();
              setMessage("YouTube disconnected.");
              await fetchYoutubeStatus();
            } catch {
              setError("Could not disconnect YouTube.");
            } finally {
              setBusy(false);
            }
          }}
          busy={busy}
        />

        <ReviewIntegrationsPanel />        <div className={cn(panel, "flex h-full flex-col p-6 sm:col-span-2 relative overflow-hidden group")}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/2 to-transparent opacity-100" />
          
          <div className="relative flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-650 ring-1 ring-violet-500/20 shadow-md">
                <Code2 size={26} />
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-[16px] text-slate-805">Website chatbot</h3>
                <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Paste the embed code on your clinic site before{" "}
                  <code className="rounded-lg bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-600">&lt;/body&gt;</code>. Set
                  branding in <span className="font-semibold text-slate-700">Profile Settings</span> first.
                </p>
              </div>
            </div>
          </div>

          {/* Key label and generation button */}
          <div className="relative mt-5 flex flex-col gap-3.5 sm:flex-row sm:items-end">
            <div className="flex-1 text-left">
              <label htmlFor="key-label" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Key Label / Website name
              </label>
              <input
                id="key-label"
                type="text"
                placeholder="e.g. Clinic Website, Landing Page"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                disabled={embedCreating}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={() => void generateEmbed()}
              disabled={embedCreating}
              className="btn-shine inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-xs font-bold text-white shadow-md shadow-violet-650/25 transition hover:bg-violet-700 active:scale-95 disabled:opacity-50"
            >
              {embedCreating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Generate code
            </button>
          </div>

          {embedSnippet && (
            <div className="relative mt-5 overflow-hidden rounded-2xl border border-violet-200 bg-violet-50/20 p-5 space-y-4 shadow-inner">
              <p className="text-xs font-bold text-violet-800 flex items-center gap-1.5 text-left">
                <span>⚠️</span> Copy this code now. For security reasons, the widget key will not be shown again.
              </p>
              
              {/* Code editor mockup frame */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden text-left">
                {/* Editor Header Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    <span className="ml-2.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">HTML Embed Script</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-650">utf-8</span>
                </div>
                
                {/* Syntax Highlight Panel */}
                <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre scrollbar-thin select-all">
                  <span className="text-slate-500">&lt;</span>
                  <span className="text-teal-400">script</span>
                  <br />
                  &nbsp;&nbsp;<span className="text-pink-400">src</span><span className="text-slate-500">=</span><span className="text-amber-300">&quot;{API_BASE_URL.replace(/\/+$/, "")}/static/embed-chatbot.js&quot;</span>
                  <br />
                  &nbsp;&nbsp;<span className="text-pink-400">data-api-base</span><span className="text-slate-500">=</span><span className="text-amber-300">&quot;{API_BASE_URL.replace(/\/+$/, "")}&quot;</span>
                  <br />
                  &nbsp;&nbsp;<span className="text-pink-400">data-widget-key</span><span className="text-slate-500">=</span><span className="text-purple-405">&quot;{embedSnippet.match(/data-widget-key="([^"]+)"/)?.[1] || "key_here"}&quot;</span>
                  <br />
                  &nbsp;&nbsp;<span className="text-teal-400">async</span>
                  <br />
                  <span className="text-slate-500">&gt;&lt;/</span>
                  <span className="text-teal-400">script</span>
                  <span className="text-slate-500">&gt;</span>
                </div>
              </div>
              
              <div className="flex gap-2 text-left">
                <button
                  type="button"
                  onClick={() => void copyEmbed()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-805 transition hover:bg-teal-100 active:scale-95 shadow-sm"
                >
                  {embedCopied ? <Check size={14} className="text-teal-650 animate-pulse" /> : <Copy size={14} />}
                  {embedCopied ? "Copied!" : "Copy code"}
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedSnippet("")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95 shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Active keys list */}
          <div className="mt-6 pt-6 border-t border-slate-250/20 text-left">
            <h4 className="font-extrabold text-slate-800 text-sm mb-3">Active Embed Keys</h4>
            {loadingKeys ? (
              <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-xs font-medium">
                <Loader2 size={14} className="animate-spin" />
                Loading active keys...
              </div>
            ) : keys.filter(k => k.is_active).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs text-slate-550 font-medium">
                No active embed keys found. Generate a key above to embed the widget.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/40 shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-205/60 bg-slate-50/70 text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                        <th className="px-4 py-3">Label</th>
                        <th className="px-4 py-3">Key Prefix</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Last Used</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {keys
                        .filter(k => k.is_active)
                        .map((k) => (
                          <tr key={k.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-805">{k.label || "Clinic website"}</td>
                            <td className="px-4 py-3 font-mono text-slate-500">{k.key_prefix}</td>
                            <td className="px-4 py-3 text-slate-450">
                              {k.created_at ? new Date(k.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-450 font-medium">
                              {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "Never"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => void revokeKey(k.id)}
                                disabled={revokingKeyId === k.id}
                                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50/70 transition-colors disabled:opacity-50"
                                title="Revoke / Delete Key"
                              >
                                {revokingKeyId === k.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Chatbot look, clinic details & signature —{" "}
        <span className="font-semibold text-slate-650">Profile</span>
      </p>
    </div>
  );
};
