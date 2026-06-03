"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardOverview } from "@/components/dashboard/Overview";
import { HealthChat } from "@/components/chat/HealthChat";
import { ContentEngine } from "@/components/content/ContentEngine";
import { VideoGenerator } from "@/components/video/VideoGenerator";
import { PatientReviews } from "@/components/reviews/PatientReviews";
import { ConsultationBooking } from "@/components/booking/ConsultationBooking";
import { IntegrationsSettings } from "@/components/integrations/IntegrationsSettings";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { PrescriptionDashboard } from "@/components/prescriptions/PrescriptionDashboard";
import { clearAuthSession } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, Command, Menu, Search, X } from "lucide-react";

interface UserProfile {
  name?: string;
  email?: string;
}

const sectionMeta: Record<
  string,
  { title: string; sub: string; breadcrumb: string }
> = {
  dash: {
    title: "Dashboard",
    sub: "Your clinic performance at a glance",
    breadcrumb: "Overview",
  },
  profile: {
    title: "Profile",
    sub: "Clinic details, knowledge base & branding",
    breadcrumb: "Profile",
  },
  chat: {
    title: "AI Health Chat",
    sub: "Intelligent patient conversations",
    breadcrumb: "Health Chat",
  },
  content: {
    title: "Content Engine",
    sub: "One topic → reels, blog, captions, hashtags & more",
    breadcrumb: "Content Engine",
  },
  video: {
    title: "Video Studio",
    sub: "Generate, publish & schedule clinic videos",
    breadcrumb: "Video Studio",
  },
  "yt-analytics": {
    title: "YouTube Analytics",
    sub: "Views, watch time, subscribers & comment sentiment",
    breadcrumb: "YouTube Analytics",
  },
  reviews: {
    title: "Reviews",
    sub: "",
    breadcrumb: "Reviews",
  },
  booking: {
    title: "Consultations",
    sub: "",
    breadcrumb: "Consultations",
  },
  prescriptions: {
    title: "Prescriptions",
    sub: "Manage and dispatch patient prescriptions",
    breadcrumb: "Prescriptions",
  },
  integrations: {
    title: "Integrations",
    sub: "",
    breadcrumb: "Integrations",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("dash");
  const [user, setUser] = useState<UserProfile>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoSeedTopic, setVideoSeedTopic] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/auth");
  };

  const handleNavigate = (s: string) => {
    setActiveSection(s);
    setSidebarOpen(false);
  };

  const current = sectionMeta[activeSection] ?? sectionMeta.dash;
  const isChat = activeSection === "chat";
  const isDash = activeSection === "dash";

  const renderSection = () => {
    switch (activeSection) {
      case "dash":
        return <DashboardOverview user={user} onNavigate={handleNavigate} />;
      case "profile":
        return <ProfileSettings user={user} />;
      case "chat":
        return <HealthChat />;
      case "content":
        return (
          <ContentEngine
            onOpenVideoStudio={(t) => {
              setVideoSeedTopic(t);
              handleNavigate("video");
            }}
          />
        );
      case "video":
        return <VideoGenerator seedTopic={videoSeedTopic} onSeedApplied={() => setVideoSeedTopic(null)} />;
      case "yt-analytics":
        return <VideoGenerator initialTab="analytics" />;
      case "reviews":
        return <PatientReviews onNavigate={handleNavigate} />;
      case "booking":
        return <ConsultationBooking />;
      case "prescriptions":
        return <PrescriptionDashboard />;
      case "integrations":
        return <IntegrationsSettings />;
      default:
        return <DashboardOverview user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="dashboard-shell flex h-screen overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleNavigate}
          onLogout={handleLogout}
          user={user}
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 animate-[dash-enter_0.35s_ease-out]">
            <Sidebar
              activeSection={activeSection}
              onSectionChange={handleNavigate}
              onLogout={handleLogout}
              user={user}
            />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-xl border border-white/10 bg-slate-800/90 p-2.5 text-white shadow-lg backdrop-blur-sm"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-main flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="dash-glass relative z-20 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              {!isDash && (
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Workspace / {current.breadcrumb}
                </p>
              )}
              <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {current.title}
              </h2>
              {!isChat && current.sub ? (
                <p className="hidden truncate text-sm text-slate-500 sm:block">{current.sub}</p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/60 py-2 pl-3 pr-2 shadow-sm md:flex">
              <Search size={15} className="shrink-0 text-slate-400" />
              <input
                placeholder="Search workspace…"
                className="w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-44"
              />
              <kbd className="hidden items-center gap-0.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-400 lg:inline-flex">
                <Command size={10} />K
              </kbd>
            </div>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-500 shadow-sm transition hover:border-teal-300/50 hover:text-teal-600"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-linear-to-br from-teal-400 to-cyan-400 ring-2 ring-white" />
            </button>
            <button
              type="button"
              className="hidden items-center gap-2 rounded-2xl border border-slate-200/70 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:shadow-md sm:flex"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0d9488&color=fff&bold=true`}
                alt=""
                className="h-8 w-8 rounded-xl"
              />
              <span className="max-w-[7rem] truncate text-sm font-semibold text-slate-700">
                {user?.name?.split(" ")[0] || "Account"}
              </span>
            </button>
          </div>
        </header>

        <main
          className={cn(
            "dash-scrollbar flex-1 overflow-y-auto",
            isChat ? "p-3 sm:p-4" : "px-4 py-6 sm:px-6 sm:py-8"
          )}
        >
          <div
            key={activeSection}
            className={cn(
              "dash-animate-in mx-auto",
              !isChat && "max-w-7xl",
              isChat && "h-full max-w-none"
            )}
          >
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
