"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const accentStyles = {
  teal: {
    glow: "from-teal-400/25 via-cyan-400/10 to-transparent",
    icon: "text-teal-600",
    ring: "ring-teal-500/20",
    badge: "bg-teal-500/10 text-teal-700 border-teal-200/60",
  },
  violet: {
    glow: "from-violet-400/25 via-purple-400/10 to-transparent",
    icon: "text-violet-600",
    ring: "ring-violet-500/20",
    badge: "bg-violet-500/10 text-violet-700 border-violet-200/60",
  },
  amber: {
    glow: "from-amber-400/25 via-orange-400/10 to-transparent",
    icon: "text-amber-600",
    ring: "ring-amber-500/20",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200/60",
  },
  slate: {
    glow: "from-slate-400/15 via-slate-300/5 to-transparent",
    icon: "text-slate-600",
    ring: "ring-slate-500/15",
    badge: "bg-slate-500/10 text-slate-600 border-slate-200/60",
  },
} as const;

export function DashPageHeader({
  title,
  description,
  badge,
  icon: Icon,
  accent = "teal",
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  accent?: keyof typeof accentStyles;
  children?: ReactNode;
}) {
  const a = accentStyles[accent];

  return (
    <div className="dash-page-header dash-glass dash-animate-in relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br opacity-100", a.glow)} />
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {Icon && (
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg ring-1",
                a.icon,
                a.ring
              )}
            >
              <Icon size={24} strokeWidth={2} />
            </div>
          )}
          <div className="min-w-0">
            {badge && (
              <span
                className={cn(
                  "mb-2.5 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                  a.badge
                )}
              >
                {badge}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            {description && (
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">{description}</p>
            )}
          </div>
        </div>
        {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function DashCard({
  className,
  children,
  padding = "default",
  hover = true,
}: {
  className?: string;
  children: ReactNode;
  padding?: "none" | "sm" | "default" | "lg";
  hover?: boolean;
}) {
  const pad = {
    none: "",
    sm: "p-4",
    default: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };
  return (
    <div
      className={cn(
        "dash-card dash-glass rounded-3xl",
        hover && "hover:-translate-y-0.5",
        pad[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function DashStatCard({
  label,
  value,
  suffix,
  change,
  icon: Icon,
  gradient,
  barWidth = "70%",
  className,
}: {
  label: string;
  value: string;
  suffix?: string;
  change?: string;
  icon: LucideIcon;
  gradient: string;
  barWidth?: string;
  className?: string;
}) {
  return (
    <DashCard className={cn("group", className)}>
      <div className="mb-5 flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg transition-transform duration-300 group-hover:scale-105",
            gradient
          )}
        >
          <Icon size={22} className="text-white" strokeWidth={2.25} />
        </div>
        {change && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
            {change}
          </span>
        )}
      </div>
      <p className="dash-stat-value text-[2rem] font-bold leading-none text-slate-900">
        {value}
        {suffix && <span className="ml-0.5 text-lg font-semibold text-slate-400">{suffix}</span>}
      </p>
      <p className="mt-1.5 text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100/80">
        <div
          className={cn("h-full rounded-full bg-linear-to-r transition-all duration-500", gradient)}
          style={{ width: barWidth }}
        />
      </div>
    </DashCard>
  );
}

export function DashAlert({
  variant,
  children,
  className,
}: {
  variant: "success" | "error" | "info";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dash-animate-in rounded-2xl border px-4 py-3.5 text-sm font-medium backdrop-blur-sm",
        variant === "error" && "border-red-200/80 bg-red-50/90 text-red-700",
        variant === "success" && "border-emerald-200/80 bg-emerald-50/90 text-emerald-800",
        variant === "info" && "border-sky-200/80 bg-sky-50/90 text-sky-800",
        className
      )}
    >
      {children}
    </div>
  );
}
