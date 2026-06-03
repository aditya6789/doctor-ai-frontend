"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookA,
  Bot,
  Globe,
  Inbox,
  Link2,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Search,
  Send,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import { DashAlert, DashCard } from "@/components/layout/DashboardPrimitives";
import {
  reviewApi,
  reviewIntegrationsApi,
  type ReviewItemV1,
  type ReviewIntegrationsSummary,
  type ReviewsV1Response,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type ReviewTab = "all" | "google" | "meta";
type ReplyFilter = "all" | "needs_reply" | "replied";
type ResponseStyle = "empathetic" | "professional";

type AutoDraft = {
  google_review_id: string;
  draft_reply: string;
  author?: string;
};

type AutoSettings = {
  fiveStar: boolean;
  neutralDraft: boolean;
  flagComplaints: boolean;
  style: ResponseStyle;
};

const AUTO_SETTINGS_KEY = "doctorai_review_auto_settings";

const DEFAULT_AUTO_SETTINGS: AutoSettings = {
  fiveStar: true,
  neutralDraft: true,
  flagComplaints: true,
  style: "empathetic",
};

const PROVIDER = {
  google: { icon: Globe, label: "Google Business", chip: "bg-blue-50/80 text-blue-700 border border-blue-200/50 shadow-2xs" },
  meta: { icon: BookA, label: "Facebook Page", chip: "bg-indigo-50/80 text-indigo-700 border border-indigo-200/50 shadow-2xs" },
} as const;

const panelClass =
  "backdrop-blur-xl bg-white/70 border border-white/50 shadow-xl rounded-3xl transition-all duration-300";

type StudioTab = "inbox" | "insights";

/** Shared buttons and layout styles */
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-teal-600 to-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-all duration-300 hover:shadow-lg hover:brightness-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer btn-shine";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition-all duration-300 hover:border-teal-200/80 hover:bg-white hover:text-teal-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer";
function authorName(author: ReviewItemV1["author"]): string {
  if (typeof author === "string") return author;
  return author?.display_name || "Anonymous Patient";
}

function authorPhotoUrl(author: ReviewItemV1["author"]): string | null {
  if (typeof author === "object" && author?.profile_photo_url) return author.profile_photo_url;
  return null;
}

function AuthorAvatar({
  author,
  size = "md",
}: {
  author: ReviewItemV1["author"];
  size?: "sm" | "md" | "lg";
}) {
  const photo = authorPhotoUrl(author);
  const name = authorName(author);
  const initial = name.charAt(0).toUpperCase();
  const box = size === "sm" ? "h-10 w-10 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-12 w-12 text-sm";
  if (photo) {
    return <img src={photo} alt="" className={cn(box, "shrink-0 rounded-2xl object-cover ring-1 ring-slate-200/80")} />;
  }
  return (
    <div
      className={cn(
        box,
        "flex shrink-0 items-center justify-center rounded-2xl bg-teal-50 font-bold text-teal-800 ring-1 ring-teal-200/60"
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "Recently";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function computeSentiment(list: ReviewItemV1[]) {
  if (!list.length) {
    return {
      positive: 0,
      neutral: 0,
      negative: 0,
      label: "No data yet",
      avg: 0,
      counts: { positive: 0, neutral: 0, negative: 0, total: 0 },
    };
  }
  let pos = 0;
  let neu = 0;
  let neg = 0;
  for (const r of list) {
    const rating = r.rating || 0;
    if (rating >= 4) pos++;
    else if (rating === 3) neu++;
    else neg++;
  }
  const total = list.length;
  const positive = Math.round((pos / total) * 100);
  const neutral = Math.round((neu / total) * 100);
  const negative = Math.round((neg / total) * 100);
  const avg = list.reduce((s, r) => s + (r.rating || 0), 0) / total;
  let label = "Mixed";
  if (positive >= 70) label = "Highly positive";
  else if (positive >= 50) label = "Mostly positive";
  else if (negative >= 30) label = "Needs attention";

  return {
    positive,
    neutral,
    negative,
    label,
    avg,
    counts: { positive: pos, neutral: neu, negative: neg, total },
  };
}

function SentimentMeter({
  label,
  pct,
  count,
  barClass,
}: {
  label: string;
  pct: number;
  count: number;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">
          <span className="font-semibold text-slate-800">{count}</span>
          <span className="text-slate-400"> · {pct}%</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barClass)}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}

function sentimentBadge(rating: number, hasReply: boolean) {
  if (hasReply)
    return { text: "Replied", className: "bg-slate-100 text-slate-500 border border-slate-200/80" };
  if (rating >= 4)
    return { text: "New Feedback", className: "bg-emerald-50 text-emerald-700 border border-emerald-250/60" };
  if (rating === 3)
    return { text: "Neutral Rating", className: "bg-amber-50 text-amber-705 border border-amber-250/60" };
  return { text: "Critical Action", className: "bg-rose-50 text-rose-705 border border-rose-250/60 animate-pulse" };
}

function loadAutoSettings(): AutoSettings {
  if (typeof window === "undefined") return DEFAULT_AUTO_SETTINGS;
  try {
    const raw = localStorage.getItem(AUTO_SETTINGS_KEY);
    if (!raw) return DEFAULT_AUTO_SETTINGS;
    return { ...DEFAULT_AUTO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUTO_SETTINGS;
  }
}

function StarRow({
  rating,
  size = 14,
  filledClass = "fill-amber-400 text-amber-400",
}: {
  rating: number;
  size?: number;
  filledClass?: string;
}) {
  const n = Math.round(rating);
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(i < n ? filledClass : "text-slate-200")}
        />
      ))}
    </div>
  );
}

function ReviewListItem({
  review,
  selected,
  hasReply,
  onSelect,
}: {
  review: ReviewItemV1;
  selected: boolean;
  hasReply: boolean;
  onSelect: () => void;
}) {
  const provider = review.provider === "meta" ? PROVIDER.meta : PROVIDER.google;
  const ProviderIcon = provider.icon;
  const needsAttention = !hasReply && review.rating <= 2;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5",
        selected
          ? "border-teal-300 bg-teal-50/70 shadow-md shadow-teal-100/20"
          : "border-transparent bg-white/40 hover:bg-white"
      )}
    >
      <AuthorAvatar author={review.author} size="sm" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="line-clamp-1 text-xs font-bold text-slate-800">{authorName(review.author)}</p>
        <div className="flex items-center gap-1.5">
          <StarRow rating={review.rating} size={10} />
          <span className="text-[10px] font-semibold text-slate-400">
            {formatRelativeTime(review.create_time)}
          </span>
        </div>
        <p className="line-clamp-2 text-[10px] leading-snug text-slate-500">
          {review.content || "No review text"}
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
            provider.chip
          )}
        >
          <ProviderIcon size={9} />
          {hasReply ? "Replied" : needsAttention ? "Urgent" : "Pending"}
        </span>
      </div>
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-300 select-none",
        checked
          ? "border-teal-200/60 bg-teal-50/40 shadow-xs"
          : "border-transparent bg-slate-50/50 hover:bg-slate-100/50"
      )}
    >
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5.5 w-10 shrink-0 rounded-full transition-colors duration-200 cursor-pointer focus:outline-hidden",
          checked ? "bg-teal-650" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked && "translate-x-4.5"
          )}
        />
      </button>
    </label>
  );
}

export const PatientReviews = ({ onNavigate }: { onNavigate?: (section: string) => void } = {}) => {
  const [integrations, setIntegrations] = useState<ReviewIntegrationsSummary | null>(null);
  const [studioTab, setStudioTab] = useState<StudioTab>("inbox");
  const [activeTab, setActiveTab] = useState<ReviewTab>("all");
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [autoSettings, setAutoSettings] = useState<AutoSettings>(DEFAULT_AUTO_SETTINGS);

  const [reviews, setReviews] = useState<ReviewItemV1[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [googleMeta, setGoogleMeta] = useState<ReviewsV1Response["meta"]>();
  const [metaMeta, setMetaMeta] = useState<ReviewsV1Response["meta"]>();

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [rejectedDraftIds, setRejectedDraftIds] = useState<Set<string>>(new Set());
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [expandedReplyId, setExpandedReplyId] = useState<string | null>(null);
  const [autoReplyLoading, setAutoReplyLoading] = useState(false);
  const [autoDrafts, setAutoDrafts] = useState<AutoDraft[] | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAutoSettings(loadAutoSettings());
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 6000);
    return () => clearTimeout(t);
  }, [message]);

  const persistAutoSettings = (next: AutoSettings) => {
    setAutoSettings(next);
    try {
      localStorage.setItem(AUTO_SETTINGS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const anyConfigured = Boolean(
    integrations?.google_business?.configured || integrations?.meta_facebook?.configured
  );

  const refreshIntegrations = useCallback(async () => {
    try {
      const data = await reviewIntegrationsApi.getIntegrations();
      setIntegrations(data);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load review status.");
      return null;
    }
  }, []);

  const fetchReviews = useCallback(async (summary: ReviewIntegrationsSummary | null) => {
    if (!summary) return;
    setReviewsLoading(true);
    setError(null);
    const items: ReviewItemV1[] = [];

    try {
      if (summary.google_business?.configured) {
        try {
          const res = await reviewApi.getGoogle({ page_size: 30 });
          items.push(...(res.data || []));
          setGoogleMeta(res.meta);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "";
          if (!msg.includes("404") && !msg.toLowerCase().includes("not configured")) setError(msg);
        }
      } else setGoogleMeta(undefined);

      if (summary.meta_facebook?.configured) {
        try {
          const res = await reviewApi.getMeta({ page_size: 30 });
          items.push(...(res.data || []));
          setMetaMeta(res.meta);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "";
          if (!msg.includes("404") && !msg.toLowerCase().includes("not configured")) {
            setError((prev) => (prev ? `${prev}; ${msg}` : msg));
          }
        }
      } else setMetaMeta(undefined);

      if (!summary.google_business?.configured && !summary.meta_facebook?.configured) {
        setReviews([]);
      } else {
        items.sort((a, b) => {
          const ta = a.create_time ? new Date(a.create_time).getTime() : 0;
          const tb = b.create_time ? new Date(b.create_time).getTime() : 0;
          return tb - ta;
        });
        setReviews(items);
      }
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const summary = await refreshIntegrations();
      if (summary) await fetchReviews(summary);
    })();
  }, [refreshIntegrations, fetchReviews]);

  const tabFiltered = useMemo(() => {
    return reviews.filter((r) => {
      if (activeTab === "google") return r.provider === "google";
      if (activeTab === "meta") return r.provider === "meta";
      return true;
    });
  }, [reviews, activeTab]);

  const searchedReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tabFiltered;
    return tabFiltered.filter((r) => {
      const name = authorName(r.author).toLowerCase();
      return name.includes(q) || (r.content || "").toLowerCase().includes(q);
    });
  }, [tabFiltered, searchQuery]);

  const filteredReviews = useMemo(() => {
    return searchedReviews.filter((r) => {
      const hasReply = Boolean(r.reply?.content);
      if (replyFilter === "needs_reply") return !hasReply;
      if (replyFilter === "replied") return hasReply;
      return true;
    });
  }, [searchedReviews, replyFilter]);

  const selectedReview = useMemo(
    () => filteredReviews.find((r) => r.id === selectedReviewId) ?? null,
    [filteredReviews, selectedReviewId]
  );

  useEffect(() => {
    if (!filteredReviews.length) {
      setSelectedReviewId(null);
      return;
    }
    if (!selectedReviewId || !filteredReviews.some((r) => r.id === selectedReviewId)) {
      setSelectedReviewId(filteredReviews[0].id);
    }
  }, [filteredReviews, selectedReviewId]);

  const sentiment = useMemo(() => computeSentiment(tabFiltered), [tabFiltered]);

  const counts = useMemo(() => {
    const needsReply = tabFiltered.filter((r) => !r.reply?.content).length;
    const replied = tabFiltered.length - needsReply;
    return { needsReply, replied, total: tabFiltered.length };
  }, [tabFiltered]);

  const trustScore = useMemo(() => {
    const weights: { score: number; count: number }[] = [];
    if (googleMeta?.average_rating != null) {
      weights.push({
        score: googleMeta.average_rating,
        count:
          googleMeta.total_review_count ?? tabFiltered.filter((r) => r.provider === "google").length,
      });
    }
    if (metaMeta?.average_rating != null) {
      weights.push({
        score: metaMeta.average_rating,
        count:
          metaMeta.total_review_count ?? tabFiltered.filter((r) => r.provider === "meta").length,
      });
    }
    if (weights.length) {
      const total = weights.reduce((s, w) => s + w.count, 0) || 1;
      return weights.reduce((s, w) => s + w.score * w.count, 0) / total;
    }
    return sentiment.avg;
  }, [googleMeta, metaMeta, tabFiltered, sentiment.avg]);

  const totalReviewCount = useMemo(() => {
    const g = googleMeta?.total_review_count ?? 0;
    const m = metaMeta?.total_review_count ?? 0;
    const sum = g + m;
    return sum > 0 ? sum : tabFiltered.length;
  }, [googleMeta, metaMeta, tabFiltered.length]);

  const draftByReviewId = useMemo(() => {
    const map: Record<string, string> = {};
    if (!autoDrafts) return map;
    for (const d of autoDrafts) {
      const match = reviews.find(
        (r) => r.provider_review_id === d.google_review_id || r.id === d.google_review_id
      );
      if (match) map[match.id] = d.draft_reply;
    }
    return map;
  }, [autoDrafts, reviews]);

  const postReply = async (review: ReviewItemV1, contentOverride?: string) => {
    const content = (contentOverride ?? replyDrafts[review.id] ?? "").trim();
    if (!content) return;
    setReplyingId(review.id);
    setError(null);
    try {
      if (review.provider === "google") {
        await reviewApi.replyGoogle(review.provider_review_id || review.id, content);
      } else {
        await reviewApi.replyMeta(review.provider_review_id || review.id, content);
      }
      setMessage("Reply published successfully.");
      setReplyDrafts((d) => {
        const next = { ...d };
        delete next[review.id];
        return next;
      });
      setRejectedDraftIds((s) => {
        const next = new Set(s);
        next.delete(review.id);
        return next;
      });
      setExpandedReplyId(null);
      const summary = await refreshIntegrations();
      await fetchReviews(summary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not post reply.");
    } finally {
      setReplyingId(null);
    }
  };

  const runAutoReplyDryRun = async () => {
    if (!integrations?.google_business?.configured) {
      setError("Connect Google Business in Integrations to use bulk AI drafts.");
      return;
    }
    setAutoReplyLoading(true);
    setError(null);
    try {
      const res = (await reviewApi.googleAutoReply({ dry_run: true, max_reviews: 10 })) as {
        eligible_count?: number;
        results?: AutoDraft[];
      };
      const results = res.results ?? [];
      setAutoDrafts(results);
      setRejectedDraftIds(new Set());
      const nextDrafts: Record<string, string> = {};
      for (const d of results) {
        const match = reviews.find(
          (r) => r.provider_review_id === d.google_review_id || r.id === d.google_review_id
        );
        if (match) nextDrafts[match.id] = d.draft_reply;
      }
      setReplyDrafts((prev) => ({ ...prev, ...nextDrafts }));
      setMessage(
        `Generated ${res.eligible_count ?? results.length} AI draft${results.length === 1 ? "" : "s"}.`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Auto-reply failed.");
    } finally {
      setAutoReplyLoading(false);
    }
  };

  const rejectDraft = (reviewId: string) => {
    setRejectedDraftIds((s) => new Set(s).add(reviewId));
    setReplyDrafts((d) => {
      const next = { ...d };
      delete next[reviewId];
      return next;
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setReplyFilter("all");
  };

  const channelPills = [
    { id: "all" as const, label: "All", count: tabFiltered.length },
    {
      id: "google" as const,
      label: "Google",
      count: tabFiltered.filter((r) => r.provider === "google").length,
    },
    {
      id: "meta" as const,
      label: "Meta",
      count: tabFiltered.filter((r) => r.provider === "meta").length,
    },
  ];

  const statusPills = [
    { id: "all" as const, label: "All", count: counts.total },
    { id: "needs_reply" as const, label: "Pending", count: counts.needsReply },
    { id: "replied" as const, label: "Replied", count: counts.replied },
  ];

  const handleGenerateDraft = (review: ReviewItemV1) => {
    const existing = draftByReviewId[review.id] ?? replyDrafts[review.id];
    if (existing) {
      setReplyDrafts((d) => ({ ...d, [review.id]: existing }));
      return;
    }
    if (integrations?.google_business?.configured && review.provider === "google") {
      void runAutoReplyDryRun();
    } else {
      setExpandedReplyId(review.id);
      setMessage("Manual reply works for all sources. AI drafts need Google Business connected.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {(message || error) && (
        <DashAlert variant={error ? "error" : "success"} className="rounded-2xl border shadow-sm">
          {error || message}
        </DashAlert>
      )}

      {anyConfigured && (
        <div className="p-1 rounded-2xl bg-slate-200/50 backdrop-blur-md max-w-md flex border border-white/60 shadow-inner">
          <button
            type="button"
            onClick={() => setStudioTab("inbox")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 outline-none",
              studioTab === "inbox"
                ? "bg-white text-teal-700 shadow-md shadow-slate-300/30 scale-[1.02]"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Inbox size={15} />
            Review Inbox
          </button>
          <button
            type="button"
            onClick={() => setStudioTab("insights")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 outline-none",
              studioTab === "insights"
                ? "bg-white text-teal-700 shadow-md shadow-slate-300/30 scale-[1.02]"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <BarChart3 size={15} />
            Reputation Insights
          </button>
        </div>
      )}

      {!anyConfigured && (
        <div className="space-y-6 animate-fadeIn">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
            <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-teal-600/40 via-cyan-600/10 to-transparent blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/35 bg-teal-500/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-teal-400 ring-1 ring-teal-400/20">
                  <Sparkles size={11} className="text-teal-300" />
                  Reputation Studio
                </span>
                <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                  Patient Review Hub
                </h2>
                <p className="text-xs font-medium leading-relaxed text-slate-400 sm:text-sm">
                  Connect Google Business and Facebook to sync reviews, draft AI replies, and publish responses from one workspace.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 text-white shadow-inner backdrop-blur-md md:self-center">
                <MessageSquare size={30} className="text-teal-400" />
              </div>
            </div>
          </div>

          <div className={cn(panelClass, "p-8 text-center")}>
            <div className="mx-auto mb-6 flex max-w-sm items-center justify-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-md">
                <Globe size={26} className="text-blue-600" />
              </div>
              <div className="relative h-0.5 flex-1 border-t-2 border-dashed border-slate-200">
                <span className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-teal-500 animate-ping" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-md">
                <BookA size={26} className="text-indigo-600" />
              </div>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Connect review channels</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Open Integrations to link Google Maps and Facebook Pages, then return here to manage feedback.
            </p>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("integrations")}
                className={cn(btnPrimary, "mt-6 group")}
              >
                Open Integrations
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {anyConfigured && (
        <div className="space-y-6 animate-fadeIn">
          {studioTab === "insights" ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className={cn(panelClass, "space-y-5 p-6 lg:col-span-2")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">
                      Patient sentiment
                    </p>
                    <h3 className="mt-1 text-xl font-black capitalize text-slate-900">{sentiment.label}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {sentiment.counts.total === 0
                        ? "No reviews in current channel view"
                        : `From ${sentiment.counts.total} synced review${sentiment.counts.total === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  {sentiment.counts.total > 0 && (
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200/70">
                      {sentiment.positive}% positive
                    </span>
                  )}
                </div>
                {sentiment.counts.total === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                    Sync reviews to see sentiment breakdown.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <SentimentMeter label="Positive (4â€“5 stars)" pct={sentiment.positive} count={sentiment.counts.positive} barClass="bg-emerald-500" />
                    <SentimentMeter label="Neutral (3 stars)" pct={sentiment.neutral} count={sentiment.counts.neutral} barClass="bg-amber-400" />
                    <SentimentMeter label="Negative (1â€“2 stars)" pct={sentiment.negative} count={sentiment.counts.negative} barClass="bg-rose-500" />
                  </div>
                )}
              </div>
              <div className={cn(panelClass, "flex flex-col justify-between p-6")}>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Trust score</p>
                  <p className="mt-2 text-5xl font-black tabular-nums text-slate-900">
                    {trustScore > 0 ? trustScore.toFixed(1) : "â€”"}
                    <span className="ml-1 text-2xl font-semibold text-slate-400">/ 5</span>
                  </p>
                  <div className="mt-3">
                    <StarRow rating={trustScore} size={18} />
                  </div>
                </div>
                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total reviews</span>
                    <span className="font-bold tabular-nums text-slate-800">{totalReviewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pending reply</span>
                    <span className="font-bold tabular-nums text-amber-700">{counts.needsReply}</span>
                  </div>
                </div>
              </div>
              <div className={cn(panelClass, "space-y-4 p-5 lg:col-span-3")}>
                <h4 className="text-sm font-black uppercase tracking-wide text-slate-800">Connected channels</h4>
                <PlatformRow name="Google Business" active={integrations?.google_business?.configured} icon={<Globe size={16} className="text-blue-600" />} iconBg="bg-blue-500/10 ring-1 ring-blue-200/60" onSettings={onNavigate ? () => onNavigate("integrations") : undefined} />
                <PlatformRow name="Facebook Page" active={integrations?.meta_facebook?.configured} icon={<BookA size={16} className="text-indigo-600" />} iconBg="bg-indigo-500/10 ring-1 ring-indigo-200/60" onSettings={onNavigate ? () => onNavigate("integrations") : undefined} />
              </div>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
                <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-teal-600/40 via-cyan-600/10 to-transparent blur-3xl" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/35 bg-teal-500/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-teal-400">
                      <Sparkles size={11} className="text-teal-300" />
                      AI Reply Studio
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Review Inbox</h2>
                    <p className="text-xs font-medium leading-relaxed text-slate-400 sm:text-sm">
                      Search patient feedback, generate bulk AI drafts, and publish replies to Google and Facebook.
                    </p>
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner backdrop-blur-md">
                    <MessageSquare size={30} className="text-teal-400" />
                  </div>
                </div>
              </div>

              <DashCard className="relative overflow-hidden border border-slate-200/70 !p-6 shadow-xl hover:border-teal-200/50">
                <div className="space-y-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
                      <Search className="text-teal-600" size={18} />
                      Find a review
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">Search by patient name or review text</p>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Patient name or keywordsâ€¦"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      />
                    </div>
                    {integrations?.google_business?.configured && (
                      <button
                        type="button"
                        disabled={autoReplyLoading}
                        onClick={() => void runAutoReplyDryRun()}
                        className="btn-shine inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50"
                      >
                        {autoReplyLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Bulk AI Drafts
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void refreshIntegrations().then((s) => fetchReviews(s))}
                      disabled={reviewsLoading}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:text-teal-700 disabled:opacity-50"
                    >
                      <RefreshCcw size={16} className={cn(reviewsLoading && "animate-spin")} />
                      Sync
                    </button>
                  </div>
                  {(searchQuery || activeTab !== "all" || replyFilter !== "all") && (
                    <button type="button" onClick={resetFilters} className="text-xs font-bold text-teal-700 hover:text-teal-800">
                      Reset filters
                    </button>
                  )}
                </div>
              </DashCard>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
                <aside className="space-y-4 lg:sticky lg:top-6 lg:col-span-4 lg:self-start">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">Inbox</h3>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{filteredReviews.length} matching</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/50 bg-slate-100/80 p-1">
                    {channelPills.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveTab(f.id)}
                        className={cn(
                          "flex-1 rounded-xl py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition-all",
                          activeTab === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/50 bg-slate-100/80 p-1">
                    {statusPills.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setReplyFilter(f.id)}
                        className={cn(
                          "flex-1 rounded-xl py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition-all",
                          replyFilter === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>

                  <div className={cn(panelClass, "max-h-[min(58vh,520px)] space-y-1.5 overflow-y-auto p-2.5 dash-scrollbar bg-white/50")}>
                    {reviewsLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-16">
                        <Loader2 className="animate-spin text-teal-500" size={24} />
                        <p className="text-xs text-slate-400">Loading reviewsâ€¦</p>
                      </div>
                    ) : filteredReviews.length === 0 ? (
                      <div className="space-y-2 py-16 text-center">
                        <MessageSquare size={28} className="mx-auto text-slate-300" />
                        <p className="text-xs font-medium text-slate-400">No reviews match filters.</p>
                      </div>
                    ) : (
                      filteredReviews.map((review) => (
                        <ReviewListItem
                          key={review.id}
                          review={review}
                          selected={selectedReviewId === review.id}
                          hasReply={Boolean(review.reply?.content)}
                          onSelect={() => setSelectedReviewId(review.id)}
                        />
                      ))
                    )}
                  </div>

                  <div className={cn(panelClass, "space-y-3 p-4")}>
                    <div className="flex items-center gap-2">
                      <Bot size={18} className="text-teal-600" />
                      <p className="text-xs font-black text-slate-800">Auto-reply rules</p>
                    </div>
                    <ToggleRow label="Auto-draft 5-star" checked={autoSettings.fiveStar} onChange={(fiveStar) => persistAutoSettings({ ...autoSettings, fiveStar })} />
                    <ToggleRow label="Draft neutral (3â˜…)" checked={autoSettings.neutralDraft} onChange={(neutralDraft) => persistAutoSettings({ ...autoSettings, neutralDraft })} />
                    <ToggleRow label="Flag low ratings" checked={autoSettings.flagComplaints} onChange={(flagComplaints) => persistAutoSettings({ ...autoSettings, flagComplaints })} />
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1">
                      {(["empathetic", "professional"] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => persistAutoSettings({ ...autoSettings, style })}
                          className={cn(
                            "rounded-lg py-1.5 text-xs font-bold capitalize transition",
                            autoSettings.style === style ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {counts.needsReply > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-xs font-bold text-amber-800">
                      {counts.needsReply} pending {counts.needsReply === 1 ? "reply" : "replies"}
                    </div>
                  )}
                </aside>

                <div className="space-y-5 lg:col-span-8">
                  {!selectedReview ? (
                    <div className={cn(panelClass, "flex flex-col items-center bg-white/40 py-24 text-center")}>
                      <MessageSquare size={48} className="text-slate-300" />
                      <p className="mt-4 text-sm font-bold text-slate-500">Select a review to respond</p>
                      <p className="mt-1 text-xs text-slate-400">Choose from the inbox or sync new reviews</p>
                    </div>
                  ) : (
                    <ReviewCard
                      key={selectedReview.id}
                      index={0}
                      review={selectedReview}
                      hasReply={Boolean(selectedReview.reply?.content)}
                      aiDraft={
                        rejectedDraftIds.has(selectedReview.id)
                          ? undefined
                          : replyDrafts[selectedReview.id] ?? draftByReviewId[selectedReview.id]
                      }
                      replyDraft={replyDrafts[selectedReview.id] ?? ""}
                      isReplying={replyingId === selectedReview.id}
                      isExpanded={expandedReplyId === selectedReview.id}
                      onToggleReply={() =>
                        setExpandedReplyId((id) => (id === selectedReview.id ? null : selectedReview.id))
                      }
                      onDraftChange={(v) => setReplyDrafts((d) => ({ ...d, [selectedReview.id]: v }))}
                      onPostReply={(text) => void postReply(selectedReview, text)}
                      onRejectDraft={() => rejectDraft(selectedReview.id)}
                      onGenerateDraft={() => handleGenerateDraft(selectedReview)}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

function PlatformRow({
  name,
  active,
  icon,
  iconBg,
  onSettings,
}: {
  name: string;
  active?: boolean;
  icon: ReactNode;
  iconBg: string;
  onSettings?: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-150 bg-white/80 px-3.5 py-2.5 shadow-3xs">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8.5 w-8.5 items-center justify-center rounded-xl ring-1", iconBg)}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">{name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-teal-500 animate-pulse" : "bg-slate-350")} />
            <p className={cn("text-[9px] font-extrabold uppercase tracking-wide", active ? "text-teal-605" : "text-slate-400")}>
              {active ? "Connected" : "Inactive"}
            </p>
          </div>
        </div>
      </div>
      {onSettings && (
        <button
          type="button"
          onClick={onSettings}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-teal-650 cursor-pointer"
          aria-label={`${name} settings`}
        >
          <Settings size={14} />
        </button>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  index,
  hasReply,
  aiDraft,
  replyDraft,
  isReplying,
  isExpanded,
  onToggleReply,
  onDraftChange,
  onPostReply,
  onRejectDraft,
  onGenerateDraft,
}: {
  review: ReviewItemV1;
  index: number;
  hasReply: boolean;
  aiDraft?: string;
  replyDraft: string;
  isReplying: boolean;
  isExpanded: boolean;
  onToggleReply: () => void;
  onDraftChange: (v: string) => void;
  onPostReply: (text?: string) => void;
  onRejectDraft: () => void;
  onGenerateDraft: () => void;
}) {
  const provider = review.provider === "meta" ? PROVIDER.meta : PROVIDER.google;
  const ProviderIcon = provider.icon;
  const name = authorName(review.author);
  const badge = sentimentBadge(review.rating, hasReply);
  const showAiPanel = !hasReply && aiDraft && !isExpanded;
  const editing = isExpanded;

  // Compute specific inline color glow accents based on rating score
  const isPositive = review.rating >= 4;
  const isNegative = review.rating <= 2;
  const cardGlowColor = isPositive 
    ? "rgba(13, 148, 136, 0.05)" 
    : isNegative 
      ? "rgba(244, 63, 94, 0.05)" 
      : "rgba(245, 158, 11, 0.05)";

  const avatarGlowBorder = isPositive
    ? "ring-2 ring-emerald-500/20"
    : isNegative
      ? "ring-2 ring-rose-500/20"
      : "ring-2 ring-amber-500/20";

  return (
    <article
      className={cn(
        panelClass,
        "flex flex-col gap-5 p-6 relative overflow-hidden group hover:border-teal-300/60",
        editing && "ring-2 ring-teal-500/15 border-teal-300/50"
      )}
      style={{
        animationDelay: `${Math.min(index, 8) * 40}ms`,
        boxShadow: `0 8px 32px -8px rgba(15, 23, 42, 0.06), 0 0 0 0 ${cardGlowColor} inset`
      }}
    >
      {/* Subtle ambient light glow on hover inside the card */}
      <div 
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{
          background: isPositive 
            ? "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)" 
            : isNegative
              ? "radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)"
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-4">
          <div className={cn("relative shrink-0 transition-transform duration-300 group-hover:scale-[1.03]", avatarGlowBorder, "rounded-[18px]")}>
            <AuthorAvatar author={review.author} size="lg" />
            {/* Live syncing indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isPositive ? "bg-emerald-400" : isNegative ? "bg-rose-450" : "bg-amber-400")}></span>
              <span className={cn("relative inline-flex rounded-full h-3 w-3 border border-white", isPositive ? "bg-emerald-500" : isNegative ? "bg-rose-500" : "bg-amber-500")}></span>
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-base font-extrabold text-slate-900 tracking-tight group-hover:text-teal-950 transition-colors">
              {name}
            </h4>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-750 font-mono">{review.rating.toFixed(1)}</span>
                <Star size={10} className="fill-amber-500 text-amber-500" />
              </div>
              <span className="text-slate-300 font-bold">·</span>
              <span className="text-xs text-slate-450 font-semibold font-mono">
                {formatRelativeTime(review.create_time)}
              </span>
              <span className="text-slate-350">·</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold shadow-2xs transition group-hover:-translate-y-px",
                  provider.chip
                )}
              >
                <ProviderIcon size={10} />
                {provider.label}
              </span>
            </div>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wider uppercase ring-1 shadow-2xs transition-all duration-300",
            badge.className
          )}
        >
          {badge.text}
        </span>
      </div>

      {/* Styled review content body */}
      <div className="relative pl-3 border-l-2 border-slate-150/80 group-hover:border-teal-500/40 transition-colors duration-300">
        <p className="text-sm leading-relaxed text-slate-700 font-medium select-text">
          {review.content || (
            <span className="text-slate-400 italic">No description text provided by user.</span>
          )}
        </p>
      </div>

      {hasReply && review.reply?.content && (
        <div className="rounded-2xl border border-teal-100/60 bg-linear-to-br from-teal-50/50 to-white/70 p-4 shadow-inner relative overflow-hidden">
          {/* Subtle dots pattern grid */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(rgba(13, 148, 136, 0.15) 1px, transparent 1px)',
              backgroundSize: '10px 10px'
            }}
          />
          <div className="flex items-center gap-1.5 relative z-10">
            <Bot size={13} className="text-teal-650" />
            <p className="text-[10px] font-extrabold tracking-wider text-teal-700/90 uppercase">Published Reply</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-650 font-medium relative z-10 pl-5">
            {review.reply.content}
          </p>
        </div>
      )}

      {showAiPanel && (
        <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-linear-to-br from-teal-500/10 via-white to-cyan-500/5 p-5 shadow-inner border-2 border-dashed space-y-4">
          {/* Background grid dots overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(rgba(13, 148, 136, 0.18) 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }}
          />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-wider text-teal-700 uppercase">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
                <Sparkles size={11} />
              </span>
              AI reply suggestion
            </div>
            
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-extrabold border border-emerald-200">
              98% Confidence Match
            </span>
          </div>

          <p className="border-l-2 border-teal-400 pl-3.5 text-xs leading-relaxed text-slate-650 italic font-medium relative z-10 select-text">
            "{aiDraft}"
          </p>

          <div className="flex flex-wrap gap-2 pt-1.5 relative z-10">
            <button
              type="button"
              disabled={isReplying}
              onClick={() => onPostReply(aiDraft)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 disabled:opacity-50 cursor-pointer btn-shine"
            >
              {isReplying ? <Loader2 size={12} className="animate-spin" /> : <Send size={11} />}
              Approve & Post Live
            </button>
            <button
              type="button"
              onClick={() => {
                onDraftChange(aiDraft);
                onToggleReply();
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 cursor-pointer"
            >
              Edit suggestion
            </button>
            <button
              type="button"
              onClick={onRejectDraft}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-750 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {!hasReply && !showAiPanel && (
        <div className="pt-1">
          {editing ? (
            <div className="space-y-3.5 rounded-2xl border border-slate-205 bg-slate-50/50 p-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Write Response</label>
                <span className="text-[9px] font-bold text-slate-450 font-mono">
                  {replyDraft.length} characters
                </span>
              </div>
              <textarea
                value={replyDraft}
                onChange={(e) => onDraftChange(e.target.value)}
                rows={3}
                autoFocus
                placeholder="Type your clinical patient reply..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-medium shadow-2xs"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={onToggleReply}
                  className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-bold text-slate-505 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isReplying || !replyDraft.trim()}
                  onClick={() => onPostReply()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-650 px-4.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-750 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isReplying ? <Loader2 size={12} className="animate-spin" /> : <Send size={11} />}
                  Publish Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3.5">
              <button
                type="button"
                onClick={onGenerateDraft}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                <Sparkles size={12} className="text-teal-605" />
                AI Draft Suggestion
              </button>
              <button
                type="button"
                onClick={onToggleReply}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-650 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-teal-750 active:scale-95 cursor-pointer btn-shine"
              >
                Reply Manual
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
