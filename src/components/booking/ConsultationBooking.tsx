"use client";

import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  RefreshCcw,
  Sparkles,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { DashAlert } from "@/components/layout/DashboardPrimitives";
import { bookingApi, type ClinicAppointment } from "@/lib/api";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const panel = "dash-glass rounded-3xl border border-slate-200/50 shadow-sm";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthKey(year: number, month: number) {
  return `${year}-${pad(month + 1)}`;
}

function parseDateStr(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(s: string) {
  return parseDateStr(s).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortWeekday(s: string) {
  return parseDateStr(s).toLocaleDateString(undefined, { weekday: "short" });
}

function getCalendarCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;
  const cells: { date: string | null; day: number }[] = [];
  for (let i = 0; i < startPad; i++) cells.push({ date: null, day: 0 });
  for (let d = 1; d <= lastDay; d++) {
    cells.push({ date: toDateStr(new Date(year, month, d)), day: d });
  }
  return cells;
}

function timeParts(slot?: string) {
  const raw = slot?.slice(0, 5) || "00:00";
  const [h, m] = raw.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return { raw, hour12, ampm, m: pad(m) };
}

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-blue-500 to-sky-600",
  "from-emerald-500 to-green-600",
];

function PatientAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const idx = (name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length;
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-sm font-bold text-white shadow-md",
        AVATAR_GRADIENTS[idx]
      )}
    >
      {initials || <User size={18} />}
    </div>
  );
}

function ScheduleRow({
  app,
  timeLabel,
  ampm,
  cancelling,
  onCancel,
}: {
  app: ClinicAppointment;
  timeLabel: string;
  ampm: string;
  cancelling: boolean;
  onCancel: () => void;
}) {
  return (
    <li className="group flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:border-teal-200/80 hover:shadow-md">
      <div className="flex w-[4.25rem] shrink-0 flex-col items-center justify-center border-r border-slate-100 bg-teal-50/80 px-2 py-4 sm:w-[4.75rem]">
        <span className="text-sm font-bold tabular-nums leading-none text-teal-800">{timeLabel}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase text-teal-600/80">{ampm}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <PatientAvatar name={app.patient_name || "Patient"} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-slate-900">
            {app.patient_name || "Patient"}
          </p>
          <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} className="text-slate-400" />
              {app.time_slot}
            </span>
            {app.patient_email && (
              <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-slate-500">
                <Mail size={12} className="shrink-0 text-slate-400" />
                <span className="truncate">{app.patient_email}</span>
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          aria-label="Cancel appointment"
        >
          {cancelling ? (
            <Loader2 size={18} className="animate-spin text-rose-500" />
          ) : (
            <XCircle size={18} />
          )}
        </button>
      </div>
    </li>
  );
}

function StatPill({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ElementType;
  accent: "teal" | "violet" | "slate";
}) {
  const accentMap = {
    teal: {
      glow: "from-teal-500/15 to-cyan-500/5",
      border: "border-teal-200/50",
      icon: "text-teal-600",
    },
    violet: {
      glow: "from-violet-500/15 to-purple-500/5",
      border: "border-violet-200/50",
      icon: "text-violet-600",
    },
    slate: {
      glow: "from-slate-500/10 to-slate-400/5",
      border: "border-slate-200/60",
      icon: "text-slate-600",
    },
  }[accent];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white/90 px-4 py-3.5 backdrop-blur-sm",
        accentMap.border
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br", accentMap.glow)} />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-white/60",
            accentMap.icon
          )}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</p>
          <p className="text-2xl font-bold tabular-nums leading-none text-slate-900">{value}</p>
          <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{sub}</p>
        </div>
      </div>
    </div>
  );
}

export const ConsultationBooking = () => {
  const today = useMemo(() => new Date(), []);
  const todayStr = toDateStr(today);
  const todayStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingApi.getClinicAppointments({ month: monthKey(year, month) });
      setAppointments(res.appointments ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load schedule.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMonth(viewYear, viewMonth);
  }, [viewYear, viewMonth, loadMonth]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  const byDate = useMemo(() => {
    const map: Record<string, ClinicAppointment[]> = {};
    for (const a of appointments) {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((x, y) => x.time_slot.localeCompare(y.time_slot));
    }
    return map;
  }, [appointments]);

  const countByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [date, list] of Object.entries(byDate)) counts[date] = list.length;
    return counts;
  }, [byDate]);

  const selectedList = byDate[selectedDate] ?? [];
  const todayCount = countByDate[todayStr] ?? 0;
  const monthTotal = appointments.length;
  const calendarCells = useMemo(() => getCalendarCells(viewYear, viewMonth), [viewYear, viewMonth]);

  const upcomingDates = useMemo(
    () =>
      Object.entries(byDate)
        .filter(([d]) => parseDateStr(d) >= todayStart)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 12),
    [byDate, todayStart]
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  const handleCancel = async (appointmentId: number) => {
    setCancellingId(appointmentId);
    setError(null);
    try {
      await bookingApi.cancelClinicAppointment(appointmentId);
      setMessage("Consultation cancelled.");
      await loadMonth(viewYear, viewMonth);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not cancel.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="consult-shell dash-animate-in w-full space-y-6">
      {(message || error) && (
        <DashAlert variant={error ? "error" : "success"}>{error || message}</DashAlert>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-teal-600 uppercase">Clinic</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Consultations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {MONTHS[viewMonth]} {viewYear} · {monthTotal} booking{monthTotal === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToday}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
          >
            <Sparkles size={16} className="text-teal-500" />
            Jump to today
          </button>
          <button
            type="button"
            onClick={() => void loadMonth(viewYear, viewMonth)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
            Sync
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatPill
          label="Today"
          value={String(todayCount)}
          sub={formatShortWeekday(todayStr)}
          accent="teal"
          icon={CalendarDays}
        />
        <StatPill
          label="Selected day"
          value={String(selectedList.length)}
          sub={selectedDate === todayStr ? "Today" : formatShortWeekday(selectedDate)}
          accent="violet"
          icon={Clock}
        />
        <StatPill
          label="This month"
          value={String(monthTotal)}
          sub={`${MONTHS[viewMonth]} ${viewYear}`}
          accent="slate"
          icon={Stethoscope}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-7">
        {/* Calendar */}
        <div className={cn(panel, "overflow-hidden xl:col-span-5")}>
          <div className="border-b border-slate-100 bg-linear-to-r from-slate-50/90 to-teal-50/40 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Calendar
                </p>
                <h3 className="text-lg font-bold text-slate-900">
                  {MONTHS[viewMonth]}{" "}
                  <span className="font-semibold text-slate-400">{viewYear}</span>
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-white/80 p-1 ring-1 ring-slate-200/70">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-2 grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] font-bold tracking-wider text-slate-400 uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell.date) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const count = countByDate[cell.date] ?? 0;
                const isSelected = cell.date === selectedDate;
                const isToday = cell.date === todayStr;
                const isPast = parseDateStr(cell.date) < todayStart;
                const busy = count > 0;

                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => setSelectedDate(cell.date!)}
                    className={cn(
                      "consult-calendar-day relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-bold",
                      isSelected && "consult-calendar-day--selected bg-linear-to-br from-teal-500 to-cyan-500 text-white",
                      !isSelected && isToday && "bg-teal-50 text-teal-800 ring-2 ring-teal-400/50",
                      !isSelected &&
                        busy &&
                        !isToday &&
                        "bg-violet-50/90 text-slate-800 ring-1 ring-violet-200/70 hover:ring-violet-300",
                      !isSelected &&
                        !busy &&
                        !isToday &&
                        (isPast
                          ? "text-slate-300 hover:bg-slate-50"
                          : "text-slate-700 hover:bg-slate-50")
                    )}
                  >
                    <span className="leading-none">{cell.day}</span>
                    {busy && (
                      <span
                        className={cn(
                          "mt-1 flex gap-0.5",
                          isSelected && "opacity-90"
                        )}
                      >
                        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-1 w-1 rounded-full",
                              isSelected ? "bg-white/90" : "bg-violet-500"
                            )}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-linear-to-br from-teal-500 to-cyan-500" />
                Selected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-200 ring-2 ring-teal-400/40" />
                Today
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                Has bookings
              </span>
            </div>
          </div>
        </div>

        {/* Day schedule + upcoming */}
        <div className="space-y-5 xl:col-span-7">
          {/* Day schedule */}
          <div className={cn(panel, "overflow-hidden")}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-wider text-teal-600 uppercase">
                  Day schedule
                </p>
                <h3 className="mt-0.5 truncate text-lg font-bold text-slate-900 sm:text-xl">
                  {formatDisplayDate(selectedDate)}
                </h3>
              </div>
              {!loading && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-bold tabular-nums",
                    selectedList.length > 0
                      ? "bg-teal-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {selectedList.length} booked
                </span>
              )}
            </div>

            <div className="p-4 sm:p-5">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-14">
                  <Loader2 size={28} className="animate-spin text-teal-600" />
                  <p className="text-sm text-slate-500">Loading schedule…</p>
                </div>
              ) : selectedList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
                  <CalendarDays size={32} className="mx-auto text-slate-300" />
                  <p className="mt-4 font-semibold text-slate-800">No appointments</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Bookings from Health Chat will appear here.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {selectedList.map((app) => {
                    const tp = timeParts(app.time_slot);
                    return (
                      <ScheduleRow
                        key={app.appointment_id}
                        app={app}
                        timeLabel={`${tp.hour12}:${tp.m}`}
                        ampm={tp.ampm}
                        cancelling={cancellingId === app.appointment_id}
                        onCancel={() => void handleCancel(app.appointment_id)}
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Upcoming */}
          {!loading && upcomingDates.length > 0 && (
            <div className={cn(panel, "p-5 sm:p-6")}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-violet-600 uppercase">
                    Upcoming
                  </p>
                  <h3 className="text-base font-bold text-slate-900">
                    Next days with appointments
                  </h3>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                  {upcomingDates.length} day{upcomingDates.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 dash-scrollbar">
                {upcomingDates.map(([date, list]) => {
                  const d = parseDateStr(date);
                  const isActive = date === selectedDate;
                  const isToday = date === todayStr;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "consult-upcoming-chip shrink-0 rounded-2xl border p-4 text-left min-w-[108px]",
                        isActive
                          ? "border-teal-400 bg-linear-to-b from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25"
                          : "border-slate-200/80 bg-white hover:border-teal-200"
                      )}
                    >
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          isActive ? "text-teal-100" : "text-slate-400"
                        )}
                      >
                        {formatShortWeekday(date)}
                        {isToday ? " · Today" : ""}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-2xl font-bold tabular-nums leading-none",
                          isActive ? "text-white" : "text-slate-900"
                        )}
                      >
                        {d.getDate()}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          isActive ? "text-teal-200" : "text-slate-400"
                        )}
                      >
                        {MONTHS[d.getMonth()]?.slice(0, 3)}
                      </p>
                      <div
                        className={cn(
                          "mt-3 inline-flex rounded-lg px-2 py-1 text-[10px] font-bold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-violet-50 text-violet-700"
                        )}
                      >
                        {list.length} booking{list.length === 1 ? "" : "s"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && monthTotal === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/50 px-6 py-8 text-center">
              <p className="font-semibold text-slate-700">No consultations this month yet</p>
              <p className="mt-1 text-sm text-slate-500">
                New bookings from Health Chat will show on the calendar automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
