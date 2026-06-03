"use client";

import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  BarChart3,
  MessageSquare,
  PenLine,
  PlugZap,
  Sparkles,
  Star,
  UserCircle,
  Video,
  FileText,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  user?: { name?: string; email?: string };
}

const navGroups = [
  {
    label: "Overview",
    items: [{ id: "dash", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Clinic",
    items: [
      { id: "profile", label: "Profile", icon: UserCircle },
      { id: "booking", label: "Consultations", icon: CalendarDays },
      { id: "reviews", label: "Reviews", icon: Star },
      { id: "prescriptions", label: "Prescriptions", icon: FileText },
    ],
  },
  {
    label: "AI Studio",
    items: [
      { id: "content", label: "Content Engine", icon: PenLine },
      { id: "video", label: "Video Studio", icon: Video },
      { id: "yt-analytics", label: "YouTube Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Connect",
    items: [{ id: "integrations", label: "Integrations", icon: PlugZap }],
  },
];

export const Sidebar = ({ activeSection, onSectionChange, onLogout, user }: SidebarProps) => {
  return (
    <aside className="dash-sidebar-glow relative flex h-screen w-[18rem] shrink-0 flex-col bg-[#0c1222] text-slate-300">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -right-10 bottom-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative border-b border-white/[0.06] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-teal-400 via-cyan-400 to-emerald-500 shadow-lg shadow-teal-500/30">
            <Heart size={18} fill="white" className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-white">
              Doctor<span className="bg-linear-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">AI</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Sparkles size={9} className="text-teal-400/90" />
              Clinic OS
            </p>
          </div>
        </div>
      </div>

      <nav className="dash-scrollbar relative flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSectionChange(id)}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all duration-300",
                      active
                        ? "dash-nav-active text-white"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                        active
                          ? "bg-teal-500/25 text-teal-200 shadow-inner"
                          : "bg-white/[0.04] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300"
                      )}
                    >
                      <Icon size={17} strokeWidth={active ? 2.25 : 2} />
                    </span>
                    <span className="flex-1 truncate">{label}</span>
                    {active && (
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-teal-300/80 transition group-hover:translate-x-0.5"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative space-y-2 border-t border-white/[0.06] p-3">
        <div className="dash-gradient-border overflow-hidden rounded-2xl bg-white/[0.03] p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0d9488&color=fff&bold=true&size=80`}
                alt=""
                className="h-11 w-11 rounded-xl ring-2 ring-teal-500/40"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c1222] bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Doctor"}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email || "Signed in"}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-teal-500/10 px-3 py-2">
            <span className="text-[11px] font-semibold text-teal-200/90">Pro workspace</span>
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
