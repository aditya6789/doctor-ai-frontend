"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Film,
  Hash,
  Lightbulb,
  Loader2,
  MessageCircle,
  Play,
  RefreshCcw,
  ThumbsUp,
  Upload,
  Video,
  Eye,
  Calendar,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { DashAlert, DashCard } from "@/components/layout/DashboardPrimitives";
import {
  videoApi,
  videoPlaybackUrl,
  type GeneratedVideoEntry,
  type YoutubeVideoInsights,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const suggestions = [
  "Benefits of drinking water in the morning",
  "Yoga for back pain relief",
  "Diabetes management tips",
  "Heart health and diet",
  "Benefits of morning walk",
];

const panelClass = "backdrop-blur-xl bg-white/70 border border-white/50 shadow-xl rounded-3xl transition-all duration-300";

type LibraryFilter = "all" | "draft" | "published" | "scheduled";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function privacyLabel(p?: string | null) {
  if (!p) return "—";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

interface VideoGeneratorProps {
  seedTopic?: string | null;
  onSeedApplied?: () => void;
  initialTab?: "studio" | "analytics";
}

export const VideoGenerator = ({ seedTopic, onSeedApplied, initialTab }: VideoGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [library, setLibrary] = useState<GeneratedVideoEntry[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [libraryLoading, setLibraryLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<YoutubeVideoInsights | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ytTitle, setYtTitle] = useState("");
  const [ytDesc, setYtDesc] = useState("");
  const [ytTags, setYtTags] = useState("health,wellness,doctor,shorts");
  const [privacy, setPrivacy] = useState<"private" | "public" | "unlisted">("unlisted");

  // Scheduling states
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [scheduledTime, setScheduledTime] = useState("");
  const [schedPlatform, setSchedPlatform] = useState<"youtube" | "instagram">("youtube");

  // Tabs & Analytics states
  const [activeTab, setActiveTab] = useState<"studio" | "analytics">("studio");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [chartMetric, setChartMetric] = useState<"views" | "subscribers">("views");

  // Redesign interactive chart states
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; clientX: number; clientY: number; val: number; date: string } | null>(null);

  // Progressive loading step sequence state (0-4)
  const [generationStep, setGenerationStep] = useState(0);

  const selected = library.find((v) => v.id === selectedId) ?? null;
  const isScheduled = selected?.publish_status === "scheduled";
  const isPublished = Boolean(
    (selected?.published_youtube && selected?.youtube_video_id) ||
    selected?.publish_status === "published"
  );
  const playbackUrl = selected ? `${videoPlaybackUrl(selected.playback_path)}?t=${selected.id}` : "";

  const filteredLibrary = useMemo(() => {
    if (libraryFilter === "draft") {
      return library.filter(
        (v) =>
          !v.published_youtube &&
          v.publish_status !== "scheduled" &&
          v.publish_status !== "published"
      );
    }
    if (libraryFilter === "published") {
      return library.filter((v) => v.published_youtube || v.publish_status === "published");
    }
    if (libraryFilter === "scheduled") {
      return library.filter((v) => v.publish_status === "scheduled");
    }
    return library;
  }, [library, libraryFilter]);

  const counts = useMemo(
    () => ({
      all: library.length,
      draft: library.filter(
        (v) =>
          !v.published_youtube &&
          v.publish_status !== "scheduled" &&
          v.publish_status !== "published"
      ).length,
      published: library.filter((v) => v.published_youtube || v.publish_status === "published").length,
      scheduled: library.filter((v) => v.publish_status === "scheduled").length,
    }),
    [library]
  );

  const loadLibrary = useCallback(async () => {
    setLibraryLoading(true);
    try {
      const res = await videoApi.list();
      const videos = res.videos ?? [];
      setLibrary(videos);
      setSelectedId((prev) => {
        if (prev && videos.some((v) => v.id === prev)) return prev;
        return videos[0]?.id ?? null;
      });
    } catch {
      setError("Could not load video library.");
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  const loadInsights = useCallback(async (videoId: string, silent = false) => {
    setInsightsLoading(true);
    if (!silent) setError(null);
    try {
      const data = await videoApi.getYoutubeInsights(videoId);
      setInsights(data);
    } catch (err: unknown) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Could not load YouTube insights.");
      }
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setError(null);
    try {
      const res = await videoApi.getAnalytics();
      setAnalyticsData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    if (seedTopic) {
      setTopic(seedTopic);
      if (onSeedApplied) {
        onSeedApplied();
      }
    }
  }, [seedTopic, onSeedApplied]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      if (initialTab === "analytics") {
        void loadAnalytics();
      }
    }
  }, [initialTab, loadAnalytics]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationStep(0);
      interval = setInterval(() => {
        setGenerationStep((s) => (s < 4 ? s + 1 : s));
      }, 3500);
    } else {
      setGenerationStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    setInsights(null);
    if (!selected?.id) return;
    if (isPublished) {
      void loadInsights(selected.id, true);
    }
  }, [selected?.id, isPublished, loadInsights]);

  useEffect(() => {
    if (!selected || isPublished || isScheduled) return;
    setYtTitle(selected.topic.slice(0, 100));
    setYtDesc("");
    setYtTags("health,wellness,doctor,shorts");
    setPrivacy("unlisted");
    setPublishMode("now");
    setScheduledTime("");
    setSchedPlatform("youtube");
  }, [selected?.id, selected?.topic, isPublished, isScheduled]);

  const handleGenerate = async (t?: string) => {
    const finalTopic = (t ?? topic).trim();
    if (!finalTopic) return;
    setTopic(finalTopic);
    setIsGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const data = await videoApi.generate(finalTopic);
      const entry = data.library_entry;
      setLibrary((prev) => [entry, ...prev.filter((v) => v.id !== entry.id)]);
      setSelectedId(entry.id);
      setLibraryFilter("draft");
      setMessage("Video saved to your library.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate video.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleYouTubePublish = async () => {
    if (!selected || isPublished || isScheduled) return;
    setPublishLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await videoApi.publishToYouTube({
        generated_video_id: selected.id,
        title: ytTitle.trim() || selected.topic.slice(0, 100),
        description: ytDesc,
        tags: ytTags.split(",").map((x) => x.trim()).filter(Boolean),
        privacy_status: privacy,
      });
      const updated = (result as { library_entry?: GeneratedVideoEntry }).library_entry;
      const merged: GeneratedVideoEntry = updated ?? {
        ...selected,
        published_youtube: true,
        youtube_video_id: result.video_id,
        youtube_url: result.url ?? undefined,
        youtube_title: ytTitle,
        youtube_privacy: privacy,
      };
      setLibrary((prev) => prev.map((v) => (v.id === merged.id ? merged : v)));
      setLibraryFilter("published");
      setMessage("Published to YouTube successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "YouTube publish failed.");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleSchedulePublish = async () => {
    if (!selected || !scheduledTime) return;
    setPublishLoading(true);
    setError(null);
    setMessage(null);
    try {
      const isoString = new Date(scheduledTime).toISOString();
      const result = await videoApi.scheduleVideo(selected.id, {
        scheduled_time: isoString,
        platform: schedPlatform,
        title: ytTitle.trim() || selected.topic.slice(0, 100),
        description: ytDesc,
        privacy_status: privacy,
      });
      const updated = result.video as GeneratedVideoEntry;
      setLibrary((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setLibraryFilter("scheduled");
      setMessage(`Video scheduled successfully for ${schedPlatform}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Scheduling failed.");
    } finally {
      setPublishLoading(false);
    }
  };

  const copyHashtags = () => {
    const tags = insights?.recommendations?.suggested_hashtags?.join(" ") ?? "";
    if (!tags) return;
    void navigator.clipboard.writeText(tags);
    setMessage("Hashtags copied to clipboard.");
  };

  const filterPills: { id: LibraryFilter; label: string; count: number }[] = [
    { id: "all", label: "All Assets", count: counts.all },
    { id: "draft", label: "Drafts", count: counts.draft },
    { id: "scheduled", label: "Scheduled", count: counts.scheduled },
    { id: "published", label: "Published", count: counts.published },
  ];

  const renderSvgChart = (viewsTrend: any[]) => {
    if (!viewsTrend || viewsTrend.length < 2) return null;

    const values = viewsTrend.map((item) => Number(item[chartMetric]));
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const rawRange = maxVal - minVal;

    const range = rawRange === 0 ? 10 : rawRange;
    const topLimit = maxVal + range * 0.15;
    const bottomLimit = Math.max(0, minVal - range * 0.1);
    const denom = topLimit - bottomLimit || 1;

    const width = 600;
    const height = 220;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = viewsTrend.map((item, i) => {
      const val = Number(item[chartMetric]);
      const x = paddingLeft + (i * chartWidth) / (viewsTrend.length - 1);
      const y = paddingTop + chartHeight * (1 - (val - bottomLimit) / denom);
      return { x, y };
    });

    // Generate smooth Bezier curve spline
    const getBezierPath = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return "";
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 3;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
        const cpY2 = p1.y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
      return path;
    };

    const pathD = getBezierPath(points);
    const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    const gridLines = [0, 0.5, 1];

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const svgWidth = rect.width;
      const scale = width / svgWidth;
      const xInSvg = clientX * scale;

      let closestIdx = 0;
      let minDiff = Infinity;

      points.forEach((p, idx) => {
        const diff = Math.abs(p.x - xInSvg);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      const item = viewsTrend[closestIdx];
      const pt = points[closestIdx];

      let displayDate = item.date as string;
      try {
        displayDate = new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      } catch {
        displayDate = item.date.slice(5);
      }

      setHoveredPoint({
        x: pt.x,
        y: pt.y,
        clientX: pt.x / scale,
        clientY: pt.y / scale,
        val: Number(item[chartMetric]),
        date: displayDate,
      });
    };

    return (
      <div className="relative w-full overflow-hidden rounded-3xl bg-slate-50/50 p-4 border border-slate-100/70 shadow-inner">
        {/* Interactive Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none rounded-xl border border-violet-100 bg-white p-3 shadow-xl text-left transition-all duration-150"
            style={{
              left: `${hoveredPoint.clientX}px`,
              top: `${hoveredPoint.clientY - 70}px`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {hoveredPoint.date}
            </p>
            <p className="text-xs font-black text-violet-700 mt-1 leading-none">
              {chartMetric === "views"
                ? `${hoveredPoint.val.toLocaleString()} views`
                : `${hoveredPoint.val.toLocaleString()} subscribers`}
            </p>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((ratio) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const val = bottomLimit + (topLimit - bottomLimit) * ratio;
            const formattedVal = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val);
            return (
              <g key={ratio} className="opacity-50">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748b"
                  className="font-bold font-mono"
                >
                  {formattedVal}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={fillD} fill="url(#chart-grad)" />

          {/* Crosshair indicator */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="#7c5cfc"
                strokeWidth="1.2"
                strokeDasharray="3 4"
                opacity="0.7"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6"
                fill="#7c5cfc"
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="4"
                fill="#ffffff"
                stroke="#7c5cfc"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Glow backdrop path */}
          <path
            d={pathD}
            fill="none"
            stroke="#7c5cfc"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
            filter="url(#glow)"
          />

          {/* Core stroke path */}
          <path
            d={pathD}
            fill="none"
            stroke="#7c5cfc"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            if (idx % 3 !== 0 && idx !== points.length - 1) return null;
            return (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#ffffff"
                stroke="#7c5cfc"
                strokeWidth="2"
              />
            );
          })}

          {/* X axis labels (Dates) */}
          {viewsTrend.map((item, i) => {
            if (i % 6 !== 0 && i !== viewsTrend.length - 1) return null;
            const dateStr = item.date as string;
            let displayDate = dateStr;
            try {
              const dt = new Date(dateStr);
              displayDate = dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            } catch {
              displayDate = dateStr.slice(5);
            }
            const x = points[i].x;
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                className="font-bold"
              >
                {displayDate}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {(message || error) && (
        <DashAlert variant={error ? "error" : "success"} className="rounded-2xl border shadow-sm">
          {error || message}
        </DashAlert>
      )}

      {/* Modern Capsule Tab Bar */}
      <div className="p-1 rounded-2xl bg-slate-200/50 backdrop-blur-md max-w-md flex border border-white/60 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("studio")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 outline-none",
            activeTab === "studio"
              ? "bg-white text-violet-700 shadow-md shadow-slate-300/30 scale-[1.02]"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <Film size={15} />
          Video Studio
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("analytics");
            void loadAnalytics();
          }}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 outline-none",
            activeTab === "analytics"
              ? "bg-white text-violet-700 shadow-md shadow-slate-300/30 scale-[1.02]"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <BarChart3 size={15} />
          Analytics Dashboard
        </button>
      </div>

      {activeTab === "studio" ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Glowing Header Banner Card */}
          <div className="relative overflow-hidden bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-850 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/40 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2.5 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/35 text-[10px] font-extrabold text-violet-400 uppercase tracking-widest ring-1 ring-violet-400/20">
                  <Sparkles size={11} className="text-violet-300 animate-spin-slow" />
                  AI Production Engine
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  AI Video Creator
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  Craft stunning patient education shorts and reels instantly. Just type a clinical topic and let our AI assemble the script, voice segments, slides, and subtitle tracks.
                </p>
              </div>
              <div className="shrink-0 flex self-start md:self-center">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-md shadow-inner transition hover:scale-105 duration-300">
                  <Video size={30} className="text-violet-400 animate-bounce-slow" />
                </div>
              </div>
            </div>
          </div>

          {/* Redesigned Input Card */}
          <DashCard className="relative overflow-hidden border border-slate-200/70 shadow-xl !p-6 hover:shadow-2xl hover:border-violet-200/50">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="text-violet-600" size={18} />
                  What topic should we explain?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Describe your video script guidelines or choose a preset topic</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleGenerate()}
                  placeholder="e.g. Benefits of physical therapy for arthritis patients..."
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => void handleGenerate()}
                  disabled={!topic.trim() || isGenerating}
                  className="btn-shine inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-all duration-300 hover:bg-violet-700 hover:shadow-violet-600/40 active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Video
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Presets</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void handleGenerate(s)}
                      disabled={isGenerating}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-violet-300 hover:text-violet-700 disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DashCard>

          {/* Progressive AI Generation Loader */}
          {isGenerating && (
            <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/25">
                  <Loader2 className="animate-spin" size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-slate-800 text-sm">AI Video Generation Active</h4>
                  <p className="text-xs text-slate-500">Synthesizing audio and overlaying script subtitles. Please wait.</p>
                </div>
              </div>
              
              {/* Progressive Steps Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
                {[
                  "Analyzing Topic",
                  "Writing Script",
                  "Synthesizing Voice",
                  "Creating Slides",
                  "Compiling Video"
                ].map((step, idx) => {
                  const done = idx < generationStep;
                  const active = idx === generationStep;
                  return (
                    <div 
                      key={step} 
                      className={cn(
                        "flex items-center gap-2 rounded-xl p-2.5 transition-all duration-300 border",
                        done && "bg-emerald-50 border-emerald-100 text-emerald-800",
                        active && "bg-violet-50 border-violet-100 text-violet-850 shadow-sm shadow-violet-100/40",
                        !done && !active && "bg-slate-50/70 border-transparent text-slate-400"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black",
                        done && "bg-emerald-600 text-white",
                        active && "bg-violet-600 text-white animate-pulse",
                        !done && !active && "bg-slate-200 text-slate-500"
                      )}>
                        {done ? "✓" : idx + 1}
                      </div>
                      <span className="text-[10px] font-bold truncate tracking-tight">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Master-Detail Split Screen */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
            {/* Library sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-6 lg:col-span-4 lg:self-start">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Library</h3>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{library.length} assets generated</p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadLibrary()}
                  disabled={libraryLoading}
                  className="inline-flex items-center justify-center gap-1.5 h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                  aria-label="Refresh library"
                >
                  <RefreshCcw size={13} className={cn(libraryLoading && "animate-spin")} />
                  Refresh
                </button>
              </div>

              {/* Filtering Pills */}
              <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/50">
                {filterPills.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLibraryFilter(f.id)}
                    className={cn(
                      "flex-1 rounded-xl py-1.5 text-[10px] font-extrabold tracking-wide uppercase transition-all duration-200",
                      libraryFilter === f.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {f.label.split(" ")[0]} ({f.count})
                  </button>
                ))}
              </div>

              {/* Scrollable list */}
              <div className={cn(panelClass, "max-h-[min(62vh,580px)] overflow-y-auto p-2.5 space-y-1.5 dash-scrollbar bg-white/50")}>
                {libraryLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="animate-spin text-violet-500" size={24} />
                    <p className="text-xs text-slate-400">Loading library...</p>
                  </div>
                ) : filteredLibrary.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <Film size={28} className="mx-auto text-slate-300" />
                    <p className="text-xs text-slate-400 font-medium">No video files found here.</p>
                  </div>
                ) : (
                  filteredLibrary.map((v) => {
                    const isItemSel = selectedId === v.id;
                    const isItScheduled = v.publish_status === "scheduled";
                    const isItPublished = v.published_youtube || v.publish_status === "published";
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedId(v.id)}
                        className={cn(
                          "w-full flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5",
                          isItemSel
                            ? "border-violet-300 bg-violet-50/70 shadow-md shadow-violet-100/20"
                            : "border-transparent bg-white/40 hover:bg-white"
                        )}
                      >
                        <div
                          className={cn(
                            "relative flex h-14 w-10 shrink-0 items-center justify-center rounded-lg text-[9px] font-black tracking-widest overflow-hidden border",
                            isItScheduled
                              ? "bg-violet-500/10 border-violet-200/50 text-violet-650"
                              : isItPublished
                              ? "bg-emerald-500/10 border-emerald-200/50 text-emerald-650"
                              : "bg-slate-100 border-slate-200/50 text-slate-400"
                          )}
                        >
                          <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-current opacity-70" />
                          {isItScheduled ? <Calendar size={13} /> : isItPublished ? <CheckCircle2 size={13} /> : <Play size={13} />}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="line-clamp-2 text-xs font-bold text-slate-800 leading-normal">{v.topic}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{formatDate(v.created_at)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Video preview / publish section */}
            <div className="space-y-5 lg:col-span-8">
              {!selected ? (
                <div className={cn(panelClass, "flex flex-col items-center py-24 text-center bg-white/40")}>
                  <Video size={48} className="text-slate-300" />
                  <p className="mt-4 text-sm font-bold text-slate-500">Select an asset to view details</p>
                  <p className="text-xs text-slate-400 mt-1">Select from library or generate a new script above</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Visual Smartphone Preview Bezel */}
                  <div className={cn(panelClass, "overflow-hidden p-6 border border-slate-200/80 shadow-xl bg-slate-900/5 flex flex-col items-center gap-6")}>
                    <div className="w-full text-center">
                      <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Shorts / Reels Preview Mockup</p>
                      <h4 className="text-xs text-slate-500 mt-0.5 truncate max-w-lg mx-auto font-medium">{selected.topic}</h4>
                    </div>

                    <div className="relative w-full max-w-[270px] aspect-[9/16] rounded-[38px] border-[7px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden ring-4 ring-slate-950/5">
                      {/* Speaker/Camera Bezel Node */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3.5 w-24 bg-slate-900 rounded-b-xl z-20" />
                      
                      <video
                        key={playbackUrl}
                        src={playbackUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Simulated UI Overlays typical of Shorts/Reels */}
                      <div className="absolute bottom-12 right-2 flex flex-col items-center gap-3.5 z-10 pointer-events-none opacity-80">
                        <div className="flex flex-col items-center">
                          <div className="h-7 w-7 rounded-full bg-slate-950/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                            <ThumbsUp size={12} className="text-white fill-white" />
                          </div>
                          <span className="text-[8px] font-black text-white mt-0.5 shadow-sm">1.5k</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-7 w-7 rounded-full bg-slate-950/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                            <MessageCircle size={12} className="text-white fill-white" />
                          </div>
                          <span className="text-[8px] font-black text-white mt-0.5 shadow-sm">76</span>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-slate-950/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                          <ExternalLink size={12} className="text-white" />
                        </div>
                      </div>
                      
                      {/* Simulated Channel Details overlay at bottom */}
                      <div className="absolute bottom-2 left-2 right-12 z-10 pointer-events-none text-left p-2.5 bg-gradient-to-t from-black/70 to-transparent rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-violet-655 border border-white/20 text-[8px] font-extrabold text-white flex items-center justify-center">Dr</div>
                          <span className="text-[9px] font-black text-white truncate shadow-sm">Your Clinic Channel</span>
                        </div>
                        <p className="text-[8px] text-white/90 truncate mt-1 shadow-sm leading-tight font-medium">{selected.topic}</p>
                      </div>
                    </div>

                    {/* Metadata & download status bar */}
                    <div className="w-full flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-4 text-slate-800">
                      <div className="min-w-0 flex-1 space-y-1 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          {isScheduled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-[10px] font-black text-violet-600 uppercase tracking-wider shadow-sm">
                              <Calendar size={11} />
                              Scheduled
                            </span>
                          ) : isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black text-emerald-600 uppercase tracking-wider shadow-sm">
                              <CheckCircle2 size={11} />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black text-amber-600 uppercase tracking-wider shadow-sm">
                              <Info size={11} />
                              Draft
                            </span>
                          )}
                          {isPublished && selected.youtube_privacy && (
                            <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                              {privacyLabel(selected.youtube_privacy)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(playbackUrl, "_blank")}
                        className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-white border border-slate-200/80 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 shadow-sm"
                      >
                        <Download size={14} />
                        Download mp4
                      </button>
                    </div>
                  </div>

                  {/* Auto-publishing Scheduled details banner */}
                  {isScheduled && (
                    <div className="rounded-3xl border border-violet-200 bg-violet-50/20 p-5 sm:p-6 shadow-md animate-fadeIn">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
                          <Calendar size={22} />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-slate-900 text-sm">Scheduled publication queue</h3>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            This video package is scheduled to auto-publish to <strong className="capitalize text-slate-900">{selected.publish_platform}</strong> on <strong>{formatDate(selected.scheduled_publish_time)}</strong>.
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Polled by background worker thread
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Draft mode: Publish or Schedule configuration forms */}
                  {!isPublished && !isScheduled && (
                    <div className={cn(panelClass, "border border-slate-200/70 shadow-2xl p-6 bg-white/95 animate-fadeIn")}>
                      {/* Tab form toggler */}
                      <div className="flex border-b border-slate-100 pb-3 mb-5">
                        <button
                          type="button"
                          onClick={() => setPublishMode("now")}
                          className={cn(
                            "px-4 py-2 text-xs font-bold transition-all border-b-2 outline-none",
                            publishMode === "now"
                              ? "border-violet-655 text-violet-700"
                              : "border-transparent text-slate-400 hover:text-slate-700"
                          )}
                        >
                          Publish instantly
                        </button>
                        <button
                          type="button"
                          onClick={() => setPublishMode("schedule")}
                          className={cn(
                            "px-4 py-2 text-xs font-bold transition-all border-b-2 outline-none",
                            publishMode === "schedule"
                              ? "border-violet-655 text-violet-700"
                              : "border-transparent text-slate-400 hover:text-slate-700"
                          )}
                        >
                          Schedule for future
                        </button>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white font-extrabold shadow-md",
                            publishMode === "now" ? "bg-red-605 shadow-red-650/20" : "bg-violet-600 shadow-violet-600/20"
                          )}>
                            {publishMode === "now" ? <Upload size={18} /> : <Calendar size={18} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 leading-none">
                              {publishMode === "now" ? "Upload directly to YouTube" : "Schedule Auto-Publish"}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                              {publishMode === "now" ? "Immediate production upload" : "Social media scheduler task"}
                            </p>
                          </div>
                        </div>

                        {/* Title input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video Title</label>
                          <input
                            type="text"
                            value={ytTitle}
                            onChange={(e) => setYtTitle(e.target.value)}
                            placeholder="Enter video title"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 placeholder:text-slate-400 font-medium"
                          />
                        </div>

                        {/* Description input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                          <textarea
                            value={ytDesc}
                            onChange={(e) => setYtDesc(e.target.value)}
                            placeholder="Provide details or call to action..."
                            rows={3}
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 placeholder:text-slate-400 font-medium"
                          />
                        </div>

                        {/* Sched only selectors */}
                        {publishMode === "schedule" && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Visual Platform Selectors */}
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform</label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSchedPlatform("youtube")}
                                  className={cn(
                                    "flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all border",
                                    schedPlatform === "youtube"
                                      ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                  )}
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                                  YouTube
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSchedPlatform("instagram")}
                                  className={cn(
                                    "flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all border",
                                    schedPlatform === "instagram"
                                      ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 shadow-sm"
                                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                  )}
                                >
                                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-fuchsia-500" />
                                  Instagram Reel
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date &amp; Time</label>
                              <input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 font-medium"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                          {(publishMode === "now" || schedPlatform === "youtube") && (
                            <select
                              value={privacy}
                              onChange={(e) => setPrivacy(e.target.value as any)}
                              className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none sm:w-40 focus:border-violet-500 font-bold text-slate-700"
                            >
                              <option value="unlisted">Unlisted</option>
                              <option value="public">Public</option>
                              <option value="private">Private</option>
                            </select>
                          )}

                          {publishMode === "now" ? (
                            <button
                              type="button"
                              onClick={() => void handleYouTubePublish()}
                              disabled={publishLoading || !ytTitle.trim()}
                              className="btn-shine inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/35 active:scale-95 disabled:opacity-50"
                            >
                              {publishLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Upload size={16} />
                              )}
                              Publish YouTube Live
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void handleSchedulePublish()}
                              disabled={publishLoading || !ytTitle.trim() || !scheduledTime}
                              className="btn-shine inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-700 hover:shadow-violet-600/35 active:scale-95 disabled:opacity-50"
                            >
                              {publishLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Calendar size={16} />
                              )}
                              Confirm &amp; Schedule
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Published analytics area */}
                  {isPublished && (
                    <>
                      <div className={cn(panelClass, "p-6 bg-white/95 border-slate-200/70 shadow-md")}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1 space-y-1.5 text-left">
                            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                              Production Status
                            </span>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                              {selected.youtube_title || selected.topic}
                            </h3>
                          </div>
                          {selected.youtube_url && (
                            <a
                              href={selected.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex shrink-0 items-center justify-center gap-1.5 h-10 rounded-2xl bg-red-600 px-5 text-xs font-bold text-white transition-all shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-red-600/35 active:scale-95 hover:scale-102"
                            >
                              Watch Video
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <p className="mt-4 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium text-left">
                          This asset is published. Check daily stats updates and custom AI recommendations below to improve next runs.
                        </p>
                      </div>

                      {/* Performance card */}
                      <div className={cn(panelClass, "p-6 bg-white/95 border-slate-200/70 shadow-md")}>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-violet-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Performance Insights</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => void loadInsights(selected.id)}
                            disabled={insightsLoading}
                            className="inline-flex items-center gap-2 h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                          >
                            <RefreshCcw size={12} className={cn(insightsLoading && "animate-spin")} />
                            Refresh Stats
                          </button>
                        </div>

                        {insightsLoading && !insights && (
                          <div className="flex flex-col items-center gap-2 py-10">
                            <Loader2 size={24} className="animate-spin text-violet-600" />
                            <p className="text-xs text-slate-500">Querying platform stats…</p>
                          </div>
                        )}

                        {insights && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: "Views", value: insights.statistics.views, icon: Eye },
                                { label: "Likes", value: insights.statistics.likes, icon: ThumbsUp },
                                {
                                  label: "Comments",
                                  value: insights.statistics.comments_count,
                                  icon: MessageCircle,
                                },
                              ].map((s) => (
                                <div
                                  key={s.label}
                                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center space-y-1"
                                >
                                  <s.icon size={16} className="mx-auto text-violet-500" />
                                  <p className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                                    {s.value.toLocaleString()}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                                </div>
                              ))}
                            </div>

                            {insights.comments.length > 0 && (
                              <div className="space-y-2 text-left">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                  Recent Comments
                                </p>
                                <ul className="max-h-36 space-y-2 overflow-y-auto dash-scrollbar">
                                  {insights.comments.map((c, i) => (
                                    <li
                                      key={i}
                                      className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3 text-xs leading-relaxed"
                                    >
                                      <span className="font-bold text-slate-800">{c.author}</span>
                                      <p className="mt-0.5 text-slate-650">{c.text}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/50 via-white to-slate-50/30 p-5 space-y-3 text-left">
                              <p className="flex items-center gap-2 font-bold text-violet-900 text-sm">
                                <Lightbulb size={16} className="text-violet-600 animate-pulse" />
                                AI Video Recommendations
                              </p>
                              <div className="space-y-2 text-xs leading-relaxed text-slate-650 font-medium">
                                {insights.recommendations.title_improvements && (
                                  <p>
                                    <strong className="text-slate-800">Title: </strong>
                                    {insights.recommendations.title_improvements}
                                  </p>
                                )}
                                {insights.recommendations.description_improvements && (
                                  <p>
                                    <strong className="text-slate-800">Description: </strong>
                                    {insights.recommendations.description_improvements}
                                  </p>
                                )}
                                {insights.recommendations.content_changes?.length > 0 && (
                                  <ul className="list-disc space-y-1 pl-4">
                                    {insights.recommendations.content_changes.map((line, i) => (
                                      <li key={i}>{line}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              {insights.recommendations.suggested_hashtags?.length > 0 && (
                                <div className="pt-2">
                                  <p className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                                    <Hash size={11} />
                                    Suggested Hashtags
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {insights.recommendations.suggested_hashtags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-md bg-white border border-slate-100 px-2 py-0.5 text-[10px] font-bold text-violet-750 shadow-sm"
                                      >
                                        {tag.startsWith("#") ? tag : `#${tag}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Analytics view */
        <div className="space-y-6 animate-fadeIn">
          {analyticsLoading && !analyticsData ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
          ) : !analyticsData ? (
            <div className={cn(panelClass, "flex flex-col items-center py-20 text-center bg-white/40")}>
              <BarChart3 size={40} className="text-slate-300" />
              <p className="mt-4 font-bold text-slate-700">Could not load dashboard statistics.</p>
              <button
                type="button"
                onClick={() => void loadAnalytics()}
                className="mt-4 inline-flex items-center gap-2 h-9 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-700 transition active:scale-95"
              >
                <RefreshCcw size={13} />
                Reload
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <DashCard className="flex flex-col justify-between border border-slate-200/60 shadow-lg p-5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Views</p>
                    <p className="text-3xl font-black font-mono text-slate-800">
                      {analyticsData.summary.total_views.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center h-5 rounded-md bg-emerald-50 px-2 text-[10px] font-black text-emerald-700 border border-emerald-100">
                      +{analyticsData.summary.views_growth_pct}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">last 30 days</span>
                  </div>
                </DashCard>

                <DashCard className="flex flex-col justify-between border border-slate-200/60 shadow-lg p-5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Watch Time</p>
                    <p className="text-3xl font-black font-mono text-slate-800">
                      {analyticsData.summary.total_watch_time_hours} hrs
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center h-5 rounded-md bg-emerald-50 px-2 text-[10px] font-black text-emerald-700 border border-emerald-100">
                      +{analyticsData.summary.watch_time_growth_pct}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">last 30 days</span>
                  </div>
                </DashCard>

                <DashCard className="flex flex-col justify-between border border-slate-200/60 shadow-lg p-5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Subscribers</p>
                    <p className="text-3xl font-black font-mono text-slate-800">
                      {analyticsData.summary.subscribers.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center h-5 rounded-md bg-emerald-50 px-2 text-[10px] font-black text-emerald-700 border border-emerald-100">
                      +{analyticsData.summary.subscribers_growth_pct}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      +{analyticsData.summary.subscribers_growth} net
                    </span>
                  </div>
                </DashCard>
              </div>

              {/* Chart Card */}
              <DashCard className="border border-slate-200/60 shadow-lg p-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <TrendingUp className="text-violet-600" size={18} />
                      Performance Trend
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400">Daily channel stats metrics history</p>
                  </div>
                  {/* Chart metric slider */}
                  <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setChartMetric("views")}
                      className={cn(
                        "rounded-lg px-3 py-1 text-[10px] font-bold transition-all",
                        chartMetric === "views" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Views Trend
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMetric("subscribers")}
                      className={cn(
                        "rounded-lg px-3 py-1 text-[10px] font-bold transition-all",
                        chartMetric === "subscribers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Subscribers
                    </button>
                  </div>
                </div>

                {renderSvgChart(analyticsData.views_trend)}
              </DashCard>

              {/* Comment lists */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Patient Comments &amp; Feedback Sentiment</h3>
                <div className="grid grid-cols-1 gap-3">
                  {analyticsData.comments.map((comment: any) => {
                    let sentimentColor = "bg-slate-50 text-slate-600 border-slate-200";
                    let Icon = Meh;
                    if (comment.sentiment === "positive") {
                      sentimentColor = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
                      Icon = Smile;
                    } else if (comment.sentiment === "negative") {
                      sentimentColor = "bg-rose-50 text-rose-700 border-rose-200/60";
                      Icon = Frown;
                    }
                    return (
                      <div
                        key={comment.id}
                        className={cn(
                          panelClass,
                          "flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center bg-white/80 border border-slate-200/40"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{comment.author}</span>
                            <span className="text-[10px] font-bold text-slate-400">{comment.created_relative}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                            {comment.text}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 self-start rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest sm:self-center",
                            sentimentColor
                          )}
                        >
                          <Icon size={12} />
                          {comment.sentiment}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
