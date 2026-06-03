import {
  bookingApi,
  reviewApi,
  reviewIntegrationsApi,
  videoApi,
  youtubeApi,
  type ClinicAppointment,
  type GeneratedVideoEntry,
  type ReviewIntegrationsSummary,
  type ReviewItemV1,
} from "@/lib/api";

export type DashboardActivity = {
  iconKey: "star" | "video" | "calendar" | "message";
  dot: string;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  sortTs: number;
  section?: string;
};

export type DashboardWeekBar = {
  label: string;
  value: number;
  date: string;
};

export type DashboardStats = {
  consultationsTotal: number;
  consultationsThisMonth: number;
  consultationsToday: number;
  videosTotal: number;
  videosPublished: number;
  reviewsReplied: number;
  reviewsTotal: number;
  averageRating: number | null;
  pendingReplies: number;
  videoDrafts: number;
};

export type DashboardAttention = {
  id: string;
  title: string;
  description: string;
  urgency: "high" | "medium" | "low";
  section: string;
  count?: number;
};

export type DashboardAppointmentPreview = {
  appointment_id: number;
  date: string;
  time_slot: string;
  patient_name: string;
  isToday: boolean;
};

export type DashboardData = {
  stats: DashboardStats;
  weekBars: DashboardWeekBar[];
  weekTotal: number;
  activities: DashboardActivity[];
  todayAppointments: DashboardAppointmentPreview[];
  upcomingAppointments: DashboardAppointmentPreview[];
  attentionItems: DashboardAttention[];
  systemsLive: { calendar: boolean; youtube: boolean; reviews: boolean };
  summaryLine: string;
  summarySub: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function parseDateStr(s: string) {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function formatRelativeTime(isoOrDate?: string | null): string {
  if (!isoOrDate) return "";
  const t = new Date(isoOrDate).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(t));
}

function last7Days(): { date: string; label: string }[] {
  const out: { date: string; label: string }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({
      date: toDateStr(d),
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d),
    });
  }
  return out;
}

function countByDate(appointments: ClinicAppointment[]) {
  const map: Record<string, number> = {};
  for (const a of appointments) {
    if (!a.date) continue;
    map[a.date] = (map[a.date] || 0) + 1;
  }
  return map;
}

function averageRating(reviews: ReviewItemV1[]): number | null {
  const rated = reviews.filter((r) => typeof r.rating === "number" && r.rating > 0);
  if (!rated.length) return null;
  const sum = rated.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

async function fetchReviewsForSummary(
  summary: ReviewIntegrationsSummary
): Promise<ReviewItemV1[]> {
  const items: ReviewItemV1[] = [];
  if (summary.google_business?.configured) {
    try {
      const res = await reviewApi.getGoogle({ page_size: 50 });
      items.push(...(res.data || []));
    } catch {
      /* not configured or provider error */
    }
  }
  if (summary.meta_facebook?.configured) {
    try {
      const res = await reviewApi.getMeta({ page_size: 50 });
      items.push(...(res.data || []));
    } catch {
      /* ignore */
    }
  }
  return items;
}

function buildActivities(
  reviews: ReviewItemV1[],
  videos: GeneratedVideoEntry[],
  appointments: ClinicAppointment[]
): DashboardActivity[] {
  const items: DashboardActivity[] = [];

  for (const r of reviews.slice(0, 8)) {
    const author =
      typeof r.author === "object" && r.author?.display_name
        ? r.author.display_name
        : typeof r.author === "string"
          ? r.author
          : "Patient";
    const ts = r.create_time ? new Date(r.create_time).getTime() : 0;
    const hasReply = Boolean(r.reply?.content?.trim());
    items.push({
      iconKey: "star",
      dot: "bg-amber-400",
      iconBg: "bg-amber-500/12 text-amber-600",
      title: hasReply ? "Review replied" : "New review",
      desc: `${author} · ${r.rating ? `${r.rating}★` : ""} ${(r.content || "").slice(0, 60)}`.trim(),
      time: formatRelativeTime(r.create_time),
      sortTs: ts || Date.now(),
      section: "reviews",
    });
  }

  for (const v of videos.slice(0, 6)) {
    const ts = v.created_at ? new Date(v.created_at).getTime() : 0;
    items.push({
      iconKey: "video",
      dot: "bg-violet-400",
      iconBg: "bg-violet-500/12 text-violet-600",
      title: v.published_youtube ? "Published on YouTube" : "Video generated",
      desc: (v.topic || v.youtube_title || "Untitled").slice(0, 72),
      time: formatRelativeTime(v.created_at),
      sortTs: ts || Date.now(),
      section: "video",
    });
  }

  const todayStr = toDateStr(new Date());
  const upcoming = appointments
    .filter((a) => a.date && a.date >= todayStr)
    .sort((a, b) => {
      const da = `${a.date} ${a.time_slot}`;
      const db = `${b.date} ${b.time_slot}`;
      return da.localeCompare(db);
    });

  for (const a of upcoming.slice(0, 6)) {
    const ts = parseDateStr(a.date).getTime();
    items.push({
      iconKey: "calendar",
      dot: "bg-emerald-400",
      iconBg: "bg-emerald-500/12 text-emerald-600",
      title: a.date === todayStr ? "Appointment today" : "Upcoming booking",
      desc: `${a.patient_name || "Patient"} · ${a.time_slot || ""} · ${a.date}`,
      time: a.date === todayStr ? "today" : formatRelativeTime(a.date),
      sortTs: ts,
      section: "booking",
    });
  }

  return items.sort((a, b) => b.sortTs - a.sortTs).slice(0, 6);
}

function toAppointmentPreview(
  a: ClinicAppointment,
  todayStr: string
): DashboardAppointmentPreview {
  return {
    appointment_id: a.appointment_id,
    date: a.date,
    time_slot: a.time_slot || "",
    patient_name: a.patient_name || "Patient",
    isToday: a.date === todayStr,
  };
}

function buildAttentionItems(
  stats: DashboardStats,
  systemsLive: { calendar: boolean; youtube: boolean; reviews: boolean }
): DashboardAttention[] {
  const items: DashboardAttention[] = [];

  if (stats.pendingReplies > 0) {
    items.push({
      id: "reviews-pending",
      title: "Reviews need a reply",
      description: `${stats.pendingReplies} patient review${stats.pendingReplies === 1 ? "" : "s"} waiting for your response`,
      urgency: "high",
      section: "reviews",
      count: stats.pendingReplies,
    });
  }

  if (stats.videoDrafts > 0) {
    items.push({
      id: "video-drafts",
      title: "Videos ready to publish",
      description: `${stats.videoDrafts} draft${stats.videoDrafts === 1 ? "" : "s"} in your library — publish to YouTube when ready`,
      urgency: "medium",
      section: "video",
      count: stats.videoDrafts,
    });
  }

  if (stats.consultationsToday > 0) {
    items.push({
      id: "today-appts",
      title: "Patients coming in today",
      description: `${stats.consultationsToday} confirmed appointment${stats.consultationsToday === 1 ? "" : "s"} on your calendar`,
      urgency: "medium",
      section: "booking",
      count: stats.consultationsToday,
    });
  }

  if (!systemsLive.calendar) {
    items.push({
      id: "connect-calendar",
      title: "Connect Google Calendar",
      description: "Sync embed and chat bookings with your clinic calendar",
      urgency: "low",
      section: "integrations",
    });
  }

  if (!systemsLive.reviews) {
    items.push({
      id: "connect-reviews",
      title: "Connect review sources",
      description: "Link Google Business or Facebook to import and reply to reviews",
      urgency: "low",
      section: "integrations",
    });
  }

  if (!systemsLive.youtube && stats.videosTotal > 0) {
    items.push({
      id: "connect-youtube",
      title: "Connect YouTube",
      description: "Publish videos and track views from Video Studio",
      urgency: "low",
      section: "integrations",
    });
  }

  return items.slice(0, 5);
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const todayStr = toDateStr(now);
  const thisMonth = monthKey(now);

  const [
    allApptsRes,
    monthApptsRes,
    todayApptsRes,
    videosRes,
    integrations,
    calendarStatus,
    youtubeStatus,
  ] = await Promise.all([
    bookingApi.getClinicAppointments().catch(() => ({ appointments: [] as ClinicAppointment[] })),
    bookingApi
      .getClinicAppointments({ month: thisMonth })
      .catch(() => ({ appointments: [] as ClinicAppointment[] })),
    bookingApi
      .getClinicAppointments({ date: todayStr })
      .catch(() => ({ appointments: [] as ClinicAppointment[] })),
    videoApi.list().catch(() => ({ videos: [] as GeneratedVideoEntry[] })),
    reviewIntegrationsApi.getIntegrations().catch(() => null),
    bookingApi.getCalendarStatus().catch(() => ({ connected: false })),
    youtubeApi.getStatus().catch(() => ({ connected: false })),
  ]);

  const allAppts = allApptsRes.appointments || [];
  const monthAppts = monthApptsRes.appointments || [];
  const todayAppts = todayApptsRes.appointments || [];
  const videos = videosRes.videos || [];

  let reviews: ReviewItemV1[] = [];
  if (integrations) {
    reviews = await fetchReviewsForSummary(integrations);
    reviews.sort((a, b) => {
      const ta = a.create_time ? new Date(a.create_time).getTime() : 0;
      const tb = b.create_time ? new Date(b.create_time).getTime() : 0;
      return tb - ta;
    });
  }

  videos.sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  const reviewsReplied = reviews.filter((r) => Boolean(r.reply?.content?.trim())).length;
  const pendingReplies = reviews.length - reviewsReplied;
  const avgRating = averageRating(reviews);
  const videoDrafts = videos.filter((v) => !v.published_youtube).length;
  const videosPublished = videos.filter((v) => v.published_youtube).length;

  const days = last7Days();
  const apptCounts = countByDate(allAppts);
  const weekBars: DashboardWeekBar[] = days.map((d) => ({
    label: d.label,
    date: d.date,
    value: apptCounts[d.date] ?? 0,
  }));
  const weekTotal = weekBars.reduce((s, b) => s + b.value, 0);

  const stats: DashboardStats = {
    consultationsTotal: allAppts.length,
    consultationsThisMonth: monthAppts.length,
    consultationsToday: todayAppts.length,
    videosTotal: videos.length,
    videosPublished,
    reviewsReplied,
    reviewsTotal: reviews.length,
    averageRating: avgRating,
    pendingReplies,
    videoDrafts,
  };

  const activities = buildActivities(reviews, videos, allAppts);

  const todayAppointments = todayAppts
    .map((a) => toAppointmentPreview(a, todayStr))
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot));

  const upcomingAppointments = allAppts
    .filter((a) => a.date && a.date >= todayStr)
    .sort((a, b) => `${a.date} ${a.time_slot}`.localeCompare(`${b.date} ${b.time_slot}`))
    .slice(0, 5)
    .map((a) => toAppointmentPreview(a, todayStr));

  const calendarOn = Boolean(
    (calendarStatus as { connected?: boolean })?.connected
  );
  const youtubeOn = Boolean((youtubeStatus as { connected?: boolean })?.connected);
  const reviewsOn = Boolean(
    integrations?.google_business?.configured || integrations?.meta_facebook?.configured
  );

  const systemsLive = { calendar: calendarOn, youtube: youtubeOn, reviews: reviewsOn };
  const attentionItems = buildAttentionItems(stats, systemsLive);

  const summaryParts: string[] = [];
  if (todayAppts.length > 0) {
    summaryParts.push(
      `${todayAppts.length} appointment${todayAppts.length === 1 ? "" : "s"} today`
    );
  }
  if (pendingReplies > 0) {
    summaryParts.push(`${pendingReplies} review${pendingReplies === 1 ? "" : "s"} awaiting reply`);
  }
  if (videoDrafts > 0) {
    summaryParts.push(`${videoDrafts} video draft${videoDrafts === 1 ? "" : "s"}`);
  }

  const summaryLine =
    summaryParts.length > 0
      ? summaryParts[0].charAt(0).toUpperCase() + summaryParts[0].slice(1)
      : "You're all caught up";

  const summarySub =
    summaryParts.length > 1
      ? summaryParts.slice(1).join(" · ")
      : `${stats.consultationsThisMonth} bookings this month · ${stats.videosTotal} videos in library`;

  return {
    stats,
    weekBars,
    weekTotal,
    activities,
    todayAppointments,
    upcomingAppointments,
    attentionItems,
    systemsLive,
    summaryLine,
    summarySub,
  };
}

export function barWidthForValue(value: number, max: number) {
  if (max <= 0) return value > 0 ? "40%" : "8%";
  return `${Math.max(12, Math.round((value / max) * 100))}%`;
}
