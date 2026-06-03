"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Film,
  HeartPulse,
  Loader2,
  PlugZap,
  RefreshCcw,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  Video,
} from "lucide-react";
import { DashAlert, DashCard, DashStatCard } from "@/components/layout/DashboardPrimitives";
import {
  barWidthForValue,
  fetchDashboardData,
  type DashboardActivity,
  type DashboardAttention,
  type DashboardData,
} from "@/lib/dashboardData";
import { cn } from "@/lib/utils";

const panel = "dash-glass rounded-3xl border border-slate-200/50 shadow-sm";

type DashboardUser = { name?: string };

const activityIcons = {
  star: Star,
  video: Video,
  calendar: CalendarDays,
  message: Sparkles,
} as const;

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

function formatApptDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d);
}

function formatStatValue(n: number | null | undefined, loading: boolean) {
  if (loading) return "—";
  if (n == null) return "—";
  return String(n);
}

function HeroStatPill({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="min-w-[5.5rem] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
      <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-white">
        {loading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-white/20" /> : value}
      </p>
    </div>
  );
}

function ActivityRow({
  activity,
  onNavigate,
}: {
  activity: DashboardActivity;
  onNavigate?: (section: string) => void;
}) {
  const Icon = activityIcons[activity.iconKey];
  return (
    <button
      type="button"
      onClick={() => activity.section && onNavigate?.(activity.section)}
      disabled={!activity.section}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-2xl p-3 text-left transition",
        activity.section ? "hover:bg-slate-50/90" : "cursor-default"
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", activity.iconBg)}>
        <Icon size={17} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{activity.title}</p>
        <p className="line-clamp-2 text-xs text-slate-500">{activity.desc}</p>
      </div>
      <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
        {activity.time || "—"}
      </span>
    </button>
  );
}

function AttentionCard({
  item,
  onNavigate,
}: {
  item: DashboardAttention;
  onNavigate?: (section: string) => void;
}) {
  const urgencyStyles = {
    high: "border-red-200/80 bg-red-50/50 hover:border-red-300",
    medium: "border-amber-200/80 bg-amber-50/40 hover:border-amber-300",
    low: "border-slate-200/80 bg-slate-50/60 hover:border-teal-200",
  };

  return (
    <button
      type="button"
      onClick={() => onNavigate?.(item.section)}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
        urgencyStyles[item.urgency]
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
          item.urgency === "high"
            ? "bg-red-500/15 text-red-700"
            : item.urgency === "medium"
              ? "bg-amber-500/15 text-amber-800"
              : "bg-teal-500/15 text-teal-700"
        )}
      >
        {item.count ?? "!"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">{item.title}</p>
        <p className="text-xs text-slate-600">{item.description}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-slate-400" />
    </button>
  );
}

export const DashboardOverview = ({
  user,
  onNavigate,
}: {
  user?: DashboardUser;
  onNavigate?: (section: string) => void;
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDashboardData());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load dashboard.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "Doctor";

  const stats = data?.stats;
  const weekBars = data?.weekBars ?? [];
  const maxWeek = Math.max(1, ...weekBars.map((b) => b.value));

  const statCards = [
    {
      label: "This month",
      value: formatStatValue(stats?.consultationsThisMonth, loading),
      icon: Users,
      gradient: "from-teal-500 to-cyan-500",
      barWidth: barWidthForValue(stats?.consultationsThisMonth ?? 0, Math.max(stats?.consultationsTotal ?? 1, 1)),
      className: "dash-animate-in dash-stagger-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/5",
    },
    {
      label: "Video library",
      value: formatStatValue(stats?.videosTotal, loading),
      icon: Video,
      gradient: "from-violet-500 to-indigo-500",
      barWidth: barWidthForValue(stats?.videosTotal ?? 0, Math.max(stats?.videosTotal ?? 1, 10)),
      className: "dash-animate-in dash-stagger-2 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5",
    },
    {
      label: "Replied",
      value: formatStatValue(stats?.reviewsReplied, loading),
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
      barWidth: barWidthForValue(stats?.reviewsReplied ?? 0, Math.max(stats?.reviewsTotal ?? 1, 1)),
      className: "dash-animate-in dash-stagger-3 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5",
    },
    {
      label: "Avg. rating",
      value: loading ? "—" : stats?.averageRating != null ? String(stats.averageRating) : "—",
      suffix: stats?.averageRating != null ? "/5" : undefined,
      icon: HeartPulse,
      gradient: "from-emerald-500 to-teal-500",
      barWidth: stats?.averageRating
        ? `${Math.max(12, Math.round((stats.averageRating / 5) * 100))}%`
        : "8%",
      className: "dash-animate-in dash-stagger-4 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5",
    },
  ];

  const integrationPills = [
    { label: "Calendar", ok: data?.systemsLive.calendar, section: "integrations" },
    { label: "YouTube", ok: data?.systemsLive.youtube, section: "integrations" },
    { label: "Reviews", ok: data?.systemsLive.reviews, section: "integrations" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {error && (
        <DashAlert variant="error">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-bold text-red-700"
            >
              <RefreshCcw size={14} />
              Retry
            </button>
          </div>
        </DashAlert>
      )}

      {/* Hero */}
      <div className="dash-hero-mesh dash-animate-in relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8 hover:shadow-teal-950/10 transition-all duration-500">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/25 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-lg">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-teal-205 badge-animated uppercase tracking-wider">
                <Sparkles size={12} className="text-teal-300 animate-spin-slow" />
                {greeting} · {formatToday()}
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Welcome back,{" "}
                <span className="bg-linear-to-r from-teal-200 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                  {firstName}
                </span>
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-350 font-medium">
                {loading
                  ? "Loading your clinic overview…"
                  : data?.summaryLine
                    ? `${data.summaryLine}. ${data.summarySub}`
                    : "Your live clinic overview"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.("integrations")}
                className="hidden items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white/90 transition hover:bg-white/20 sm:inline-flex"
              >
                <PlugZap size={14} />
                Integrations
              </button>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="rounded-2xl border border-white/15 bg-white/10 p-3 text-white/90 transition hover:bg-white/20 disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCcw size={18} className={cn(loading && "animate-spin")} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {integrationPills.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onNavigate?.(p.section)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
                  p.ok
                    ? "border border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                    : "border border-white/15 bg-white/5 text-slate-400 hover:bg-white/10"
                )}
              >
                {p.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <HeroStatPill
              label="Today"
              value={String(stats?.consultationsToday ?? 0)}
              loading={loading}
            />
            <HeroStatPill
              label="This month"
              value={String(stats?.consultationsThisMonth ?? 0)}
              loading={loading}
            />
            <HeroStatPill
              label="Pending reviews"
              value={String(stats?.pendingReplies ?? 0)}
              loading={loading}
            />
            <HeroStatPill
              label="Rating"
              value={stats?.averageRating != null ? String(stats.averageRating) : "—"}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Today + Attention */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn(panel, "dash-animate-in p-5 sm:p-6")}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
                <CalendarDays size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Today&apos;s schedule</h3>
                <p className="text-xs text-slate-500">
                  {loading
                    ? "Loading…"
                    : `${data?.todayAppointments.length ?? 0} appointment${(data?.todayAppointments.length ?? 0) === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.("booking")}
              className="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              Calendar
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-teal-600" />
            </div>
          ) : !data?.todayAppointments.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-600">No appointments today</p>
              <p className="mt-1 text-xs text-slate-400">Bookings from your website chat will appear here</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.todayAppointments.map((a) => (
                <li key={a.appointment_id}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("booking")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white/75 px-4 py-3.5 text-left transition-all duration-350 hover:border-teal-350 hover:bg-white hover:-translate-y-0.5 hover:shadow-md shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 shadow-inner">
                      <Clock size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{a.patient_name}</p>
                      <p className="text-xs text-slate-500">{a.time_slot || "Time TBD"}</p>
                    </div>
                    <span className="rounded-lg bg-teal-500/10 px-2 py-1 text-[10px] font-bold text-teal-700">
                      Today
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cn(panel, "dash-animate-in p-5 sm:p-6")}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <AlertCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Needs attention</h3>
              <p className="text-xs text-slate-500">Action items for your clinic</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-amber-600" />
            </div>
          ) : !data?.attentionItems.length ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 px-4 py-6">
              <CheckCircle2 className="shrink-0 text-emerald-600" size={28} />
              <div>
                <p className="text-sm font-bold text-emerald-900">All caught up</p>
                <p className="text-xs text-emerald-700/80">No urgent tasks right now</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.attentionItems.map((item) => (
                <li key={item.id}>
                  <AttentionCard item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <DashStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            suffix={s.suffix}
            icon={s.icon}
            gradient={s.gradient}
            barWidth={s.barWidth}
            className={s.className}
          />
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid gap-4 lg:grid-cols-12">
        <DashCard className="dash-animate-in lg:col-span-7" padding="lg" hover>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bookings this week</h3>
              <p className="text-sm text-slate-500">Last 7 days · confirmed</p>
            </div>
            {!loading && data && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-700">
                <TrendingUp size={14} />
                {data.weekTotal} total
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="flex h-48 items-end gap-2 px-2 border-b border-slate-100 pb-2">
              {weekBars.map((bar) => (
                <div key={bar.date} className="group relative flex flex-1 flex-col items-center gap-2">
                  {/* Vertical Hover column highlight bar overlay */}
                  <div className="absolute bottom-6 left-0 right-0 top-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300 pointer-events-none" />
                  
                  <span className="text-[10px] font-extrabold text-teal-700 opacity-0 transform translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-0.5">
                    {bar.value}
                  </span>
                  <div
                    className="w-full min-h-[7px] rounded-t-2xl bg-linear-to-t from-teal-650 via-teal-500 to-cyan-400 shadow-md shadow-teal-500/15 transition-all duration-350 group-hover:from-teal-500 group-hover:scale-x-105"
                    style={{ height: `${Math.max(12, (bar.value / maxWeek) * 100)}%` }}
                  />
                  <span className="text-[10px] font-extrabold text-slate-400 transition-all group-hover:text-teal-700 group-hover:scale-105">{bar.label}</span>
                </div>
              ))}
            </div>
          )}
        </DashCard>

        <DashCard className="dash-animate-in lg:col-span-5" padding="lg" hover>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent activity</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="animate-spin text-teal-600" />
            </div>
          ) : !data?.activities.length ? (
            <p className="py-10 text-center text-sm text-slate-500">Activity will appear as you get bookings and reviews.</p>
          ) : (
            <div className="max-h-[280px] space-y-0.5 overflow-y-auto dash-scrollbar pr-1">
              {data.activities.map((a, i) => (
                <ActivityRow key={`${a.title}-${i}`} activity={a} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </DashCard>
      </div>

      {/* Upcoming */}
      <div className={cn(panel, "dash-animate-in p-5 sm:p-6")}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Upcoming patients</h3>
              <p className="text-xs text-slate-500">Next confirmed bookings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.("booking")}
            className="text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-violet-600" />
          </div>
        ) : !data?.upcomingAppointments.length ? (
          <p className="text-center text-sm text-slate-500 py-6">No upcoming appointments scheduled.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {data.upcomingAppointments.map((a) => (
              <button
                key={a.appointment_id}
                type="button"
                onClick={() => onNavigate?.("booking")}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-left transition hover:border-teal-200 hover:shadow-md"
              >
                <p className="truncate text-sm font-bold text-slate-900">{a.patient_name}</p>
                <p className="mt-1 text-xs font-semibold text-teal-700">{a.time_slot}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {a.isToday ? "Today" : formatApptDate(a.date)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video drafts strip — only when drafts exist */}
      {!loading && stats && stats.videoDrafts > 0 && (
        <button
          type="button"
          onClick={() => onNavigate?.("video")}
          className="dash-animate-in flex w-full items-center justify-between gap-4 rounded-3xl border border-violet-200/80 bg-linear-to-r from-violet-50 to-indigo-50/80 px-6 py-4 text-left transition hover:border-violet-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
              <Film size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {stats.videoDrafts} video draft{stats.videoDrafts === 1 ? "" : "s"} ready to publish
              </p>
              <p className="text-xs text-slate-600">Open Video Studio to upload to YouTube</p>
            </div>
          </div>
          <ChevronRight className="shrink-0 text-violet-600" size={22} />
        </button>
      )}
    </div>
  );
};
