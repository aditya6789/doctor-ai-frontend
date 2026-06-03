"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, Loader2, Mail, RefreshCcw, Unlink2 } from "lucide-react";
import { DashAlert } from "@/components/layout/DashboardPrimitives";
import {
  reviewIntegrationsApi,
  type GoogleBusinessLocation,
  type MetaReviewPage,
  type ReviewIntegrationsSummary,
  type ReviewProviderStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const panel = "dash-glass rounded-3xl border border-slate-200/50 shadow-sm";

function ReviewStatusPill({ status }: { status: ReviewProviderStatus }) {
  const ready = status.configured;
  const needsConfig = status.connected && !status.configured;
  if (ready) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/20 shadow-sm shadow-emerald-500/5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Ready
      </span>
    );
  }
  if (needsConfig) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-500/20 shadow-sm shadow-amber-500/5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Pick location
      </span>
    );
  }
  if (status.connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-bold text-slate-650 ring-1 ring-slate-200/50">
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2.5 py-1 text-[11px] font-bold text-slate-400 ring-1 ring-slate-200/50">
      Not connected
    </span>
  );
}

function ProviderConnectCard({
  title,
  description,
  status,
  onConnect,
  onDisconnect,
  busy,
  accent,
}: {
  title: string;
  description: string;
  status: ReviewProviderStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  busy: boolean;
  accent: "red" | "blue";
}) {
  const brandGlow =
    accent === "red"
      ? "from-red-500/10 via-rose-500/5 to-transparent"
      : "from-blue-500/10 via-indigo-500/5 to-transparent";

  const btnAccent =
    accent === "red"
      ? "bg-red-600 shadow-red-650/20 hover:bg-red-700 hover:shadow-red-650/35 border-red-500/30"
      : "bg-blue-650 shadow-blue-650/20 hover:bg-blue-700 hover:shadow-blue-650/35 border-blue-500/30";

  return (
    <div className={cn(panel, "relative overflow-hidden group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg")}>
      {/* Background glow orb */}
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition-all duration-500 group-hover:opacity-100", brandGlow)} />

      <div className="relative flex flex-1 flex-col justify-between gap-5">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-md ring-1 ring-slate-100/50 transition-transform duration-300 group-hover:scale-105",
              accent === "red" ? "bg-red-600 shadow-red-600/20" : "bg-blue-600 shadow-blue-600/20"
            )}
          >
            {accent === "red" ? "G" : "f"}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-extrabold text-[16px] text-slate-805">{title}</h3>
              <ReviewStatusPill status={status} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
            {status.email && (
              <p className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs text-slate-650 font-medium">
                <Mail size={13} className="text-slate-400" />
                {status.email}
              </p>
            )}
            {status.page_name && (
              <p className="text-xs text-slate-500 font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-800 rounded-lg px-2.5 py-1 inline-block mt-1">
                Page: {status.page_name}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-3 border-t border-slate-100/50">
          {status.connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-650 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-50 shadow-sm"
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
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Google Business + Facebook — grid cells inside IntegrationsSettings. */
export const ReviewIntegrationsPanel = () => {
  const [integrations, setIntegrations] = useState<ReviewIntegrationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleLocations, setGoogleLocations] = useState<GoogleBusinessLocation[]>([]);
  const [metaPages, setMetaPages] = useState<MetaReviewPage[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [configSaving, setConfigSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const google = integrations?.google_business;
  const meta = integrations?.meta_facebook;

  const refreshIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewIntegrationsApi.getIntegrations();
      setIntegrations(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load review connections.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGoogleLocations = async () => {
    try {
      const data = await reviewIntegrationsApi.getGoogleLocations();
      setGoogleLocations(data.locations || []);
      if (data.locations?.length === 1) {
        setSelectedAccountId(data.locations[0].account_id);
        setSelectedLocationId(data.locations[0].location_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load locations.");
    }
  };

  const loadMetaPages = async () => {
    try {
      const data = await reviewIntegrationsApi.getMetaPages();
      const pages = data.pages || [];
      setMetaPages(pages);
      if (pages.length === 1) setSelectedPageId(pages[0].id);
      if (pages.length === 0) {
        setError("No Facebook pages found. Try connecting again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load pages.");
    }
  };

  useEffect(() => {
    void refreshIntegrations();
  }, [refreshIntegrations]);

  useEffect(() => {
    if (google?.connected && !google.configured) void loadGoogleLocations();
  }, [google?.connected, google?.configured]);

  useEffect(() => {
    if (meta?.connected && !meta.configured) void loadMetaPages();
  }, [meta?.connected, meta?.configured]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const { type, needs_page_select } = event.data || {};
      if (type === "GOOGLE_BUSINESS_CONNECTED") {
        setMessage("Connected — choose your clinic location below.");
        setError(null);
        await refreshIntegrations();
        await loadGoogleLocations();
      }
      if (type === "META_REVIEWS_CONNECTED") {
        setMessage("Facebook connected.");
        setError(null);
        await refreshIntegrations();
      }
      if (type === "META_REVIEWS_PAGES_READY" || needs_page_select) {
        setMessage("Select your Facebook Page below.");
        setError(null);
        await refreshIntegrations();
        await loadMetaPages();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [refreshIntegrations]);

  const connectGoogle = () => {
    setMessage(null);
    setError(null);
    try {
      reviewIntegrationsApi.connectGooglePopup();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not open connect window.");
    }
  };

  const connectMeta = () => {
    setMessage(null);
    setError(null);
    try {
      reviewIntegrationsApi.connectMetaPopup();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not open connect window.");
    }
  };

  const saveGoogleConfig = async () => {
    if (!selectedAccountId || !selectedLocationId) return;
    setConfigSaving(true);
    setError(null);
    try {
      await reviewIntegrationsApi.saveGoogleConfig(selectedAccountId, selectedLocationId);
      setMessage("Clinic location saved.");
      setGoogleLocations([]);
      await refreshIntegrations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save location.");
    } finally {
      setConfigSaving(false);
    }
  };

  const saveMetaConfig = async () => {
    if (!selectedPageId) return;
    const page = metaPages.find((p) => p.id === selectedPageId);
    setConfigSaving(true);
    setError(null);
    try {
      await reviewIntegrationsApi.saveMetaConfig(selectedPageId, page?.name || "Facebook Page");
      setMessage("Facebook Page saved.");
      setMetaPages([]);
      await refreshIntegrations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save page.");
    } finally {
      setConfigSaving(false);
    }
  };

  return (
    <>
      {(message || error) && (
        <div className="sm:col-span-2">
          <DashAlert variant={error ? "error" : "success"}>{error || message}</DashAlert>
        </div>
      )}

      {google && (
        <ProviderConnectCard
          title="Google Business"
          description="Import and reply to Google reviews."
          status={google}
          onConnect={connectGoogle}
          onDisconnect={async () => {
            setBusy(true);
            try {
              await reviewIntegrationsApi.disconnectGoogle();
              setMessage("Google Business disconnected.");
              await refreshIntegrations();
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Disconnect failed.");
            } finally {
              setBusy(false);
            }
          }}
          busy={busy || loading}
          accent="red"
        />
      )}

      {meta && (
        <ProviderConnectCard
          title="Facebook Page"
          description="Import and reply to Facebook reviews."
          status={meta}
          onConnect={connectMeta}
          onDisconnect={async () => {
            setBusy(true);
            try {
              await reviewIntegrationsApi.disconnectMeta();
              setMessage("Facebook disconnected.");
              await refreshIntegrations();
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Disconnect failed.");
            } finally {
              setBusy(false);
            }
          }}
          busy={busy || loading}
          accent="blue"
        />
      )}

      {google?.connected && !google.configured && (
        <div className={cn(panel, "space-y-4 p-6 sm:col-span-2 relative overflow-hidden text-left bg-white/60 shadow-lg animate-fadeIn")}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          <h4 className="text-sm font-extrabold text-slate-800">Choose Google Business location</h4>
          <p className="text-xs text-slate-500 font-medium">Select the clinic location matching this Google Account details to sync reviews.</p>
          {googleLocations.length === 0 ? (
            <button
              type="button"
              onClick={() => void loadGoogleLocations()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100/80 active:scale-95 shadow-sm"
            >
              <RefreshCcw size={12} />
              Load locations
            </button>
          ) : (
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end">
              <div className="min-w-[200px] flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Location</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    const loc = googleLocations.find((l) => l.location_id === e.target.value);
                    setSelectedLocationId(e.target.value);
                    setSelectedAccountId(loc?.account_id || "");
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white/65 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 font-medium"
                >
                  <option value="">Select location…</option>
                  {googleLocations.map((loc) => (
                    <option key={loc.location_id} value={loc.location_id}>
                      {loc.title || loc.location_id}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={configSaving || !selectedLocationId}
                onClick={() => void saveGoogleConfig()}
                className="btn-shine h-[42px] inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 text-xs font-bold text-white shadow-md shadow-teal-650/20 transition hover:bg-teal-700 active:scale-95 disabled:opacity-50"
              >
                {configSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                {configSaving ? "Saving…" : "Save Location"}
              </button>
            </div>
          )}
        </div>
      )}

      {meta?.connected && !meta.configured && (
        <div className={cn(panel, "space-y-4 p-6 sm:col-span-2 relative overflow-hidden text-left bg-white/60 shadow-lg animate-fadeIn")}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <h4 className="text-sm font-extrabold text-slate-805">Choose Facebook Page</h4>
          <p className="text-xs text-slate-500 font-medium">Select the clinic facebook page matching this Meta Account details to sync reviews.</p>
          {metaPages.length === 0 ? (
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => void loadMetaPages()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100/80 active:scale-95 shadow-sm"
              >
                <RefreshCcw size={12} />
                Load pages
              </button>
              <button
                type="button"
                onClick={connectMeta}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-650 transition hover:bg-slate-50 active:scale-95 shadow-sm"
              >
                Reconnect
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end">
              <div className="min-w-[200px] flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Page</label>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/65 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-medium"
                >
                  <option value="">Select page…</option>
                  {metaPages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={configSaving || !selectedPageId}
                onClick={() => void saveMetaConfig()}
                className="btn-shine h-[42px] inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-650 px-5 text-xs font-bold text-white shadow-md shadow-teal-650/20 transition hover:bg-teal-700 active:scale-95 disabled:opacity-50"
              >
                {configSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                {configSaving ? "Saving…" : "Save Page"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
