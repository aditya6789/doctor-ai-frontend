"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CirclePlay,
  Clock,
  Cpu,
  Globe,
  Heart,
  Inbox,
  Layers,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  MessageSquareText,
  Phone,
  Quote,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Video,
  X,
  Zap,
  Lock,
  Database,
  ArrowUpRight,
  Smartphone,
  Eye,
  ThumbsUp,
  Share2,
  Volume2,
} from "lucide-react";
import { BrandLogo, CONTACT_EMAIL } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { useLanguage, type Language } from "@/lib/LanguageContext";

const navLinks = [
  { labelKey: "landing.nav.features", defaultLabel: "Features", href: "#features" },
  { labelKey: "landing.nav.painpoints", defaultLabel: "Pain Points", href: "#pain-points" },
  { labelKey: "landing.nav.showcase", defaultLabel: "Showcase", href: "#showcase" },
  { labelKey: "landing.nav.pricing", defaultLabel: "Pricing", href: "#pricing" },
  { labelKey: "landing.nav.faq", defaultLabel: "FAQ", href: "#faq" },
];

const features = [
  {
    icon: Bot,
    titleKey: "landing.features.feat1.title",
    descKey: "landing.features.feat1.desc",
    defaultTitle: "AI Patient Chat",
    defaultDesc: "24/7 assistant for FAQs, triage, and booking nudges — fluent in Hindi, Hinglish, and English.",
    accent: "teal",
  },
  {
    icon: Video,
    titleKey: "landing.features.feat2.title",
    descKey: "landing.features.feat2.desc",
    defaultTitle: "Video Studio",
    defaultDesc: "Turn clinical topics into short educational videos with AI script, voice, and caption generation.",
    accent: "violet",
  },
  {
    icon: Star,
    titleKey: "landing.features.feat3.title",
    descKey: "landing.features.feat3.desc",
    defaultTitle: "Review Autopilot",
    defaultDesc: "Sync Google and Meta reviews, analyze sentiment, and draft polite AI replies in 1 click.",
    accent: "amber",
  },
  {
    icon: CalendarCheck2,
    titleKey: "landing.features.feat4.title",
    descKey: "landing.features.feat4.desc",
    defaultTitle: "Smart Booking",
    defaultDesc: "Auto-fill slots with intelligent SMS/WhatsApp reminders, waitlists, and instant confirmations.",
    accent: "sky",
  },
  {
    icon: BarChart3,
    titleKey: "landing.features.feat5.title",
    descKey: "landing.features.feat5.desc",
    defaultTitle: "Practice Analytics",
    defaultDesc: "Monitor consultation volumes, patient rating trends, and sentiment metrics in real-time.",
    accent: "emerald",
  },
  {
    icon: MessageSquareText,
    titleKey: "landing.features.feat6.title",
    descKey: "landing.features.feat6.desc",
    defaultTitle: "WhatsApp Hub",
    defaultDesc: "A unified inbox for automated patient communications, broadcast follow-ups, and alerts.",
    accent: "green",
  },
];

const steps = [
  { num: "01", titleKey: "landing.steps.step1.title", descKey: "landing.steps.step1.desc", defaultTitle: "Connect Channels", defaultDesc: "Link WhatsApp API, Google Business Profile, and Meta Pages in under 5 minutes.", icon: Layers },
  { num: "02", titleKey: "landing.steps.step2.title", descKey: "landing.steps.step2.desc", defaultTitle: "Enable AI Workflows", defaultDesc: "Activate triage assistant, automated review replies, and clinic booking calendars.", icon: Cpu },
  { num: "03", titleKey: "landing.steps.step3.title", descKey: "landing.steps.step3.desc", defaultTitle: "Grow on Autopilot", defaultDesc: "Run your clinical administration 24/7 while your team focuses entirely on patient care.", icon: TrendingUp },
];

const plans = [
  {
    nameKey: "landing.pricing.plan1.name",
    defaultName: "Starter",
    priceKey: "landing.pricing.plan1.price",
    defaultPrice: "₹2,499",
    descKey: "landing.pricing.plan1.desc",
    defaultDesc: "Solo practitioners and small clinics.",
    featureKeys: [
      "landing.pricing.plan1.feat1",
      "landing.pricing.plan1.feat2",
      "landing.pricing.plan1.feat3",
      "landing.pricing.plan1.feat4",
      "landing.pricing.plan1.feat5",
    ],
    defaultFeatures: ["1 location", "AI Patient Chat (500 chats/mo)", "Google Maps Integration", "Basic Reviews Autopilot", "Smart Scheduling Interface"],
    ctaKey: "landing.pricing.plan1.cta",
    defaultCta: "Start Free Trial",
    featured: false,
  },
  {
    nameKey: "landing.pricing.plan2.name",
    defaultName: "Growth",
    priceKey: "landing.pricing.plan2.price",
    defaultPrice: "₹5,999",
    descKey: "landing.pricing.plan2.desc",
    defaultDesc: "Growing practices wanting full automated workflows.",
    featureKeys: [
      "landing.pricing.plan2.feat1",
      "landing.pricing.plan2.feat2",
      "landing.pricing.plan2.feat3",
      "landing.pricing.plan2.feat4",
      "landing.pricing.plan2.feat5",
      "landing.pricing.plan2.feat6",
    ],
    defaultFeatures: [
      "Up to 5 locations",
      "Unlimited AI Patient Chat",
      "WhatsApp Business API Integration",
      "AI Video Studio (20 reels/mo)",
      "Advanced Review Analytics & Auto-Replies",
      "Priority WhatsApp & Call Support",
    ],
    ctaKey: "landing.pricing.plan2.cta",
    defaultCta: "Start Free Trial",
    featured: true,
  },
  {
    nameKey: "landing.pricing.plan3.name",
    defaultName: "Enterprise",
    priceKey: "landing.pricing.plan3.price",
    defaultPrice: "Custom Pricing",
    descKey: "landing.pricing.plan3.desc",
    defaultDesc: "Hospital chains and multi-city clinics.",
    featureKeys: [
      "landing.pricing.plan3.feat1",
      "landing.pricing.plan3.feat2",
      "landing.pricing.plan3.feat3",
      "landing.pricing.plan3.feat4",
      "landing.pricing.plan3.feat5",
    ],
    defaultFeatures: [
      "Unlimited locations & sub-accounts",
      "Custom-trained AI models on clinical protocol",
      "SSO, SAML & EHR integrations",
      "Dedicated account success manager",
      "HIPAA Business Associate Agreement (BAA)",
    ],
    ctaKey: "landing.pricing.plan3.cta",
    defaultCta: "Contact Sales",
    featured: false,
  },
];

const testimonials = [
  {
    quoteKey: "landing.testimonials.test1.quote",
    defaultQuote: "Patient response workload dropped by 60%. Our staff now focuses on real patient care and clinical support.",
    nameKey: "landing.testimonials.test1.name",
    defaultName: "Dr. Mehak Arora",
    roleKey: "landing.testimonials.test1.role",
    defaultRole: "CityCare Clinic · Mumbai",
    initials: "MA",
  },
  {
    quoteKey: "landing.testimonials.test2.quote",
    defaultQuote: "Review autopilot raised our Google Maps rating from 3.8 to 4.8 in just six weeks. Appointments have doubled.",
    nameKey: "landing.testimonials.test2.name",
    defaultName: "Dr. Ritesh Jain",
    roleKey: "landing.testimonials.test2.role",
    defaultRole: "WellSpring Health · Delhi",
    initials: "RJ",
  },
  {
    quoteKey: "landing.testimonials.test3.quote",
    defaultQuote: "We launched the AI chatbot in one day, and automated WhatsApp confirmations started filling slots right away.",
    nameKey: "landing.testimonials.test3.name",
    defaultName: "Dr. Aviral Singh",
    roleKey: "landing.testimonials.test3.role",
    defaultRole: "PrimeSkin · Bangalore",
    initials: "AS",
  },
];

const featureAccent: Record<
  string,
  { iconBg: string; iconText: string; hoverBorder: string; glow: string }
> = {
  teal: {
    iconBg: "bg-teal-500/15 border-teal-500/25",
    iconText: "text-teal-400",
    hoverBorder: "hover:border-teal-500/35",
    glow: "group-hover:shadow-teal-500/10",
  },
  violet: {
    iconBg: "bg-violet-500/15 border-violet-500/25",
    iconText: "text-violet-400",
    hoverBorder: "hover:border-violet-500/35",
    glow: "group-hover:shadow-violet-500/10",
  },
  amber: {
    iconBg: "bg-amber-500/15 border-amber-500/25",
    iconText: "text-amber-400",
    hoverBorder: "hover:border-amber-500/35",
    glow: "group-hover:shadow-amber-500/10",
  },
  sky: {
    iconBg: "bg-sky-500/15 border-sky-500/25",
    iconText: "text-sky-400",
    hoverBorder: "hover:border-sky-500/35",
    glow: "group-hover:shadow-sky-500/10",
  },
  emerald: {
    iconBg: "bg-emerald-500/15 border-emerald-500/25",
    iconText: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/35",
    glow: "group-hover:shadow-emerald-500/10",
  },
  green: {
    iconBg: "bg-green-500/15 border-green-500/25",
    iconText: "text-green-400",
    hoverBorder: "hover:border-green-500/35",
    glow: "group-hover:shadow-green-500/10",
  },
};

const faqs = [
  {
    qKey: "landing.faq.q1",
    defaultQ: "How long does it take to set up ClinicSuite?",
    aKey: "landing.faq.a1",
    defaultA: "Most clinics go live in under 5 minutes. No coding or developer support is required.",
  },
  {
    qKey: "landing.faq.q2",
    defaultQ: "Will ClinicSuite integrate with our existing booking system?",
    aKey: "landing.faq.a2",
    defaultA: "Yes. ClinicSuite connects to standard CRM and EHR tools through APIs and webhooks.",
  },
  {
    qKey: "landing.faq.q3",
    defaultQ: "Which languages does the AI chatbot support?",
    aKey: "landing.faq.a3",
    defaultA: "Hindi, English, Hinglish, and 10+ regional Indian languages (Bengali, Tamil, Telugu, and more), with automatic language detection.",
  },
  {
    qKey: "landing.faq.q4",
    defaultQ: "Is our patient data secure?",
    aKey: "landing.faq.a4",
    defaultA: "Yes. ClinicSuite follows HIPAA-aligned security practices. Your data is encrypted in transit and at rest with 256-bit encryption on AWS India servers.",
  },
  {
    qKey: "landing.faq.q5",
    defaultQ: "Do I need a credit card for the free trial?",
    aKey: "landing.faq.a5",
    defaultA: "No. The 14-day trial is completely free — no credit card required.",
  },
];

const brands = ["CityCare Multispecialty", "Nexa Dental Care", "OrthoOne Clinic", "WellSpring Health", "PrimeSkin Clinic", "ZenCare Pediatrics", "HealthFirst Diagnostics"];

function useNavScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);
  return scrolled;
}

function useCountUp(to: number, started: boolean, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let frame: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, started, duration]);
  return val;
}

function SectionBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 via-cyan-50/80 to-teal-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 shadow-sm backdrop-blur-md",
        className
      )}
    >
      {children}
    </span>
  );
}

function InteractiveHeroMockup() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"stats" | "logs">("stats");
  const [ticks, setTicks] = useState<Array<{ id: number; textKey: string; defaultText: string; timeKey: string; defaultTime: string; type: string }>>([
    { id: 1, textKey: "landing.hero.mock.event1", defaultText: "AI replied to Dr. Arora's Google Review", timeKey: "landing.hero.mock.justNow", defaultTime: "Just now", type: "review" },
    { id: 2, textKey: "landing.hero.mock.event2", defaultText: "WhatsApp booking confirmed: Ortho slot", timeKey: "landing.hero.mock.2mAgo", defaultTime: "2m ago", type: "booking" },
    { id: 3, textKey: "landing.hero.mock.event3", defaultText: "Video Reel generated: 'Preventing Joint Pain'", timeKey: "landing.hero.mock.6mAgo", defaultTime: "6m ago", type: "video" },
  ]);

  // Add mock events over time
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        { textKey: "landing.hero.mock.chatEvent", defaultText: "AI automated patient triage query (Hinglish)", type: "chat" },
        { textKey: "landing.hero.mock.reviewEvent", defaultText: "New 5★ Google Map review synced", type: "review" },
        { textKey: "landing.hero.mock.bookingEvent", defaultText: "WhatsApp confirmation sent to patient Rohan", type: "booking" },
        { textKey: "landing.hero.mock.videoEvent", defaultText: "AI Video Studio script compiled successfully", type: "video" },
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setTicks((prev) => [
        { id: Date.now(), textKey: randomMsg.textKey, defaultText: randomMsg.defaultText, timeKey: "landing.hero.mock.justNow", defaultTime: "Just now", type: randomMsg.type },
        ...prev.slice(0, 4),
      ]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 ring-1 ring-slate-100">
      {/* Chrome Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-teal-500" />
          <span className="ml-3 rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
            app.clinicsuite.cloud/dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t("landing.hero.automated", "Autopilot Active")}</span>
        </div>
      </div>

      <div className="flex min-h-[360px] flex-col md:flex-row">
        <aside className="w-full shrink-0 border-r border-slate-200 bg-slate-50/80 p-4 md:w-44">
          <div className="space-y-1">
            {[
              { label: t("landing.hero.mock.overview", "Overview"), icon: Layers, active: true },
              { label: t("landing.hero.mock.patientChat", "Patient Chat"), icon: Bot, count: "5" },
              { label: t("landing.hero.mock.videoStudio", "Video Studio"), icon: Video },
              { label: t("landing.hero.mock.reviewsFeed", "Reviews Feed"), icon: Star },
              { label: t("landing.hero.mock.consultations", "Consultations"), icon: CalendarCheck2 },
              { label: t("landing.hero.mock.analytics", "Analytics"), icon: BarChart3 },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition",
                  item.active
                    ? "border border-teal-200 bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <item.icon size={13} className={item.active ? "text-teal-600" : "text-slate-400"} />
                <span className="flex-1">{item.label}</span>
                {item.count && (
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[9px] font-black text-teal-700">
                    {item.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 bg-white p-4">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setActiveTab("stats")}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-bold transition",
                  activeTab === "stats" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {t("landing.hero.liveMetrics", "Live Metrics")}
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-bold transition",
                  activeTab === "logs" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {t("landing.hero.liveTicker", "Live Ticker")}
              </button>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{t("landing.hero.syncRealtime", "Sync: Realtime 1s")}</span>
          </div>

          {activeTab === "stats" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t("landing.hero.mock.consultsLabel", "Consults"), val: "1,482", trend: "+14%", color: "text-teal-600" },
                  { label: t("landing.hero.mock.aiRepliesLabel", "AI Replies"), val: "842", trend: "+41%", color: "text-violet-600" },
                  { label: t("landing.hero.mock.googleRatingLabel", "Google Rating"), val: "4.8★", trend: "+0.4", color: "text-amber-600" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
                    <p className={cn("mt-1 text-base font-black leading-tight", s.color)}>{s.val}</p>
                    <span className="text-[9px] font-bold text-emerald-600">{s.trend}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t("landing.hero.weeklyGrowth", "Weekly Patient Growth")}</p>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700">{t("landing.hero.automated", "Automated")}</span>
                </div>
                <div className="relative h-20 w-full pt-2">
                  <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="gradient-wave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path
                      d="M 0,80 Q 20,40 40,65 T 80,25 T 100,5 L 100,100 L 0,100 Z"
                      fill="url(#gradient-wave)"
                      className="transition-all duration-1000"
                    />
                    {/* Stroke */}
                    <path
                      d="M 0,80 Q 20,40 40,65 T 80,25 T 100,5"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Dots */}
                    <circle cx="0" cy="80" r="2.5" fill="#14b8a6" />
                    <circle cx="40" cy="65" r="2.5" fill="#14b8a6" />
                    <circle cx="80" cy="25" r="2.5" fill="#14b8a6" />
                    <circle cx="100" cy="5" r="3" fill="#2dd4bf" className="animate-ping" />
                  </svg>
                  <div className="absolute top-1 right-2 rounded border border-slate-200 bg-white px-1 py-0.5 text-[8px] font-black text-slate-600 shadow-sm">
                    {t("landing.hero.week4Patients", "Week 4: +280 Patients")}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{t("landing.hero.liveAutopilotEvents", "Live Autopilot Events")}</p>
              <AnimatePresence initial={false}>
                {ticks.map((tItem, idx) => (
                  <motion.div
                    key={tItem.id}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, height: 0, overflow: "hidden", margin: 0, padding: 0 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[10px] shadow-sm",
                      idx === 0
                        ? "border-teal-200 bg-teal-50 text-teal-900"
                        : "border-slate-200 bg-white text-slate-600"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        tItem.type === "review"
                          ? "bg-amber-400 animate-pulse"
                          : tItem.type === "booking"
                          ? "bg-teal-400"
                          : tItem.type === "video"
                          ? "bg-violet-400"
                          : "bg-emerald-400"
                      )}
                    />
                    <span className="flex-1 font-medium">{t(tItem.textKey, tItem.defaultText)}</span>
                    <span className="font-bold text-slate-500">{t(tItem.timeKey, tItem.defaultTime)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const scrolled = useNavScroll();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMenuMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // ROI Estimator States
  const [clinicType, setClinicType] = useState<"single" | "multi" | "chain">("multi");

  // Feature Showcase States
  const [activeShowcase, setActiveShowcase] = useState<number>(0);

  // Count up numbers
  const clinics = useCountUp(1840, statsStarted);
  const replies = useCountUp(92, statsStarted);
  const sat = useCountUp(98, statsStarted);
  const hours = useCountUp(18, statsStarted);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
      return;
    }
    setCheckingSession(false);
  }, [router]);

  useEffect(() => {
    if (checkingSession) return;
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStatsStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [checkingSession]);

  if (checkingSession) return null;

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  // ROI calculations mapping
  const roiCalculations = {
    single: {
      hours: t("landing.roi.single.hours", "12 hours/wk"),
      consults: t("landing.roi.single.consults", "+15 new consults/mo"),
      reviews: t("landing.roi.single.reviews", "+35 reviews/mo"),
      savings: t("landing.roi.single.savings", "₹15,000/mo"),
    },
    multi: {
      hours: t("landing.roi.multi.hours", "28 hours/wk"),
      consults: t("landing.roi.multi.consults", "+48 new consults/mo"),
      reviews: t("landing.roi.multi.reviews", "+90 reviews/mo"),
      savings: t("landing.roi.multi.savings", "₹48,000/mo"),
    },
    chain: {
      hours: t("landing.roi.chain.hours", "75+ hours/wk"),
      consults: t("landing.roi.chain.consults", "+160+ new consults/mo"),
      reviews: t("landing.roi.chain.reviews", "+280 reviews/mo"),
      savings: t("landing.roi.chain.savings", "₹1,35,000/mo"),
    },
  };

  // Feature Showcase previews details
  const showcaseTabs = [
    {
      title: t("landing.showcase.tab1.title", "AI Patient Chatbot"),
      badge: t("landing.showcase.tab1.badge", "WhatsApp & Web"),
      tagline: t("landing.showcase.tab1.tagline", "Engage and triage patients automatically 24/7."),
      bullets: [
        t("landing.showcase.tab1.bullet1", "Instantly answers clinical FAQs and consultation timings."),
        t("landing.showcase.tab1.bullet2", "Detects patient intent in Hindi, English, and Hinglish."),
        t("landing.showcase.tab1.bullet3", "Captures details and schedules slot bookings automatically."),
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-[10px] font-black text-white">WA</div>
            <div>
              <p className="text-xs font-bold leading-none">{t("landing.showcase.tab1.mock.title", "CityCare AI Triage")}</p>
              <span className="text-[9px] font-bold text-teal-400">{t("landing.showcase.tab1.mock.status", "Online · Verification Active")}</span>
            </div>
          </div>
          <div className="space-y-3.5">
            <div className="max-w-[85%] rounded-2xl bg-slate-900 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-slate-500 mb-0.5">{t("landing.showcase.tab1.mock.patientLabel", "Patient")} · 10:14 AM</p>
              <p className="text-xs text-slate-200">{t("landing.showcase.tab1.mock.patientMsg1", "Hi, kya Dr. Arora skin allergy ke liye available hain aaj? Mujhe severe itching ho rahi hai.")}</p>
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl bg-teal-950 border border-teal-500/25 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-teal-400 mb-0.5">{t("landing.showcase.tab1.mock.assistantLabel", "ClinicSuite Assistant")} · 10:14 AM</p>
              <p className="text-xs text-teal-100">{t("landing.showcase.tab1.mock.assistantMsg1", "Namaste! Yes, Dr. Arora (Dermatologist) available hain. Unka clinic consultation fee ₹500 hai. Humare paas aaj do vacant slots hain:")}</p>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded bg-teal-800/80 border border-teal-400/30 px-2 py-1 text-[9px] font-bold text-white">{t("landing.showcase.tab1.mock.slot1", "4:30 PM today")}</span>
                <span className="rounded bg-teal-800/80 border border-teal-400/30 px-2 py-1 text-[9px] font-bold text-white">{t("landing.showcase.tab1.mock.slot2", "6:00 PM today")}</span>
              </div>
            </div>
            <div className="max-w-[85%] rounded-2xl bg-slate-900 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-slate-500 mb-0.5">{t("landing.showcase.tab1.mock.patientLabel", "Patient")} · 10:15 AM</p>
              <p className="text-xs text-slate-200">{t("landing.showcase.tab1.mock.patientMsg2", "4:30 PM standard patient slot book kar dijiye checkup ke liye.")}</p>
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl bg-teal-950 border border-teal-500/25 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-teal-400 mb-0.5">{t("landing.showcase.tab1.mock.assistantLabel", "ClinicSuite Assistant")} · 10:15 AM</p>
              <p className="text-xs text-teal-100">{t("landing.showcase.tab1.mock.assistantMsg2", "Great! 4:30 PM slot select ho gaya hai. Aapki appointment confirm karne ke liye please is link pe click karein ya reply confirm karein.")}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("landing.showcase.tab2.title", "AI Video Studio"),
      badge: t("landing.showcase.tab2.badge", "YouTube & Instagram"),
      tagline: t("landing.showcase.tab2.tagline", "Generate short medical educational videos in 1 click."),
      bullets: [
        t("landing.showcase.tab2.bullet1", "Write simple topics, AI drafts clinical scripts in Hinglish."),
        t("landing.showcase.tab2.bullet2", "Voice generator compiles professional narrations."),
        t("landing.showcase.tab2.bullet3", "Auto-generate visual captions matching speech pacing."),
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Control Panel */}
            <div className="space-y-2 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{t("landing.showcase.tab2.mock.builder", "AI Script Builder")}</p>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">{t("landing.showcase.tab2.mock.topic", "Topic")}</p>
                <p className="text-xs font-bold text-white mt-0.5">{t("landing.showcase.tab2.mock.topicValue", "3 Tips to Manage Hypertension")}</p>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">{t("landing.showcase.tab2.mock.draftedAudio", "Drafted Audio Script")}</p>
                <p className="text-[11px] leading-relaxed text-slate-300 mt-1">
                  {t("landing.showcase.tab2.mock.scriptValue", "\"Doston, hyper tension control karna koi muskil kaam nahi. Sabse pehle, daily minimum 30 minutes walk start kijiye. Dusra, salt intake decrease kijiye...\"")}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-teal-500/20 px-2 py-0.5 text-[9px] font-black text-teal-300">
                <Volume2 size={10} /> {t("landing.showcase.tab2.mock.voice", "Hinglish Voice: Dr. Male 1")}
              </span>
            </div>
            {/* Visual Shorts Bezel */}
            <div className="relative mx-auto h-[220px] w-[130px] rounded-xl border-4 border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between p-2 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
              <div className="relative flex justify-between items-center z-20">
                <span className="text-[8px] font-bold text-teal-400">{t("landing.showcase.tab2.mock.studio", "ClinicSuite Studio")}</span>
                <span className="text-[8px] text-white/50">9:16</span>
              </div>
              {/* Fake Video Backdrop Graphics */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 opacity-80 py-4">
                <div className="h-10 w-10 rounded-full border border-teal-500/35 bg-teal-500/10 flex items-center justify-center animate-pulse">
                  <Heart size={20} className="text-teal-400" />
                </div>
                <div className="h-1.5 w-16 bg-slate-800 rounded" />
                <div className="h-1.5 w-10 bg-slate-800 rounded" />
              </div>
              {/* Dynamic Captions overlay */}
              <div className="relative text-center z-20 pb-2">
                <p className="bg-teal-50 text-slate-950 text-[10px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded inline-block shadow-lg">
                  {t("landing.showcase.tab2.mock.caption", "SALT INTAKE DECREASE")}
                </p>
                <p className="text-[8px] font-bold text-slate-200 mt-1">{t("landing.showcase.tab2.mock.videoTitle", "Control Hypertension")}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("landing.showcase.tab3.title", "Google Review Autopilot"),
      badge: t("landing.showcase.tab3.badge", "SEO Rating Booster"),
      tagline: t("landing.showcase.tab3.tagline", "Autopilot patient responses and reviews growth."),
      bullets: [
        t("landing.showcase.tab3.bullet1", "Syncs Google Business Profile and Facebook Reviews live."),
        t("landing.showcase.tab3.bullet2", "Generates HIPAA-compliant drafted replies with zero medical hazard."),
        t("landing.showcase.tab3.bullet3", "Reduces average reply time from 4 days to under 60 seconds."),
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner text-left">
          <div className="mb-3 flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{t("landing.showcase.tab3.mock.title", "Google Business Reviews")}</span>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">{t("landing.showcase.tab3.mock.mode", "Automated Mode")}</span>
          </div>
          <div className="rounded-xl bg-slate-900 border border-slate-800/80 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-teal-500/20 text-[10px] font-black flex items-center justify-center text-teal-300">VK</div>
                <div>
                  <h4 className="text-xs font-bold leading-none">{t("landing.showcase.tab3.mock.reviewer", "Vinay Kapoor")}</h4>
                  <span className="text-[9px] text-slate-500">{t("landing.showcase.tab3.mock.reviewTime", "Google Reviewer · 3h ago")}</span>
                </div>
              </div>
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              {t("landing.showcase.tab3.mock.reviewText", "\"Great doctor! Consultation details were precise and waiting hours was very low. The digital check-in on WhatsApp saved us so much time.\"")}
            </p>
            <div className="mt-2 rounded-lg bg-teal-950/60 border border-teal-500/20 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">{t("landing.showcase.tab3.mock.replyTitle", "ClinicSuite Auto-Reply")}</span>
                <span className="text-[8px] bg-teal-500 text-slate-950 font-extrabold px-1.5 rounded">{t("landing.showcase.tab3.mock.replyStatus", "Published")}</span>
              </div>
              <p className="text-[10px] text-teal-200">
                {t("landing.showcase.tab3.mock.replyText", "\"Hello Vinay, thank you for sharing your feedback! We are thrilled to know our digital WhatsApp bookings check-in helped save your time. We look forward to supporting your healthcare requirements.\"")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("landing.showcase.tab4.title", "WhatsApp Booking Hub"),
      badge: t("landing.showcase.tab4.badge", "Confirmations & Reminders"),
      tagline: t("landing.showcase.tab4.tagline", "Keep patient slots booked and reduce drop-offs by 85%."),
      bullets: [
        t("landing.showcase.tab4.bullet1", "Sends proactive calendar booking reminders automatically."),
        t("landing.showcase.tab4.bullet2", "Allows patients to reschedule easily inside conversational chat."),
        t("landing.showcase.tab4.bullet3", "Smart waitlist engine refills cancelled timings instantly."),
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner text-left">
          <div className="mb-3 flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{t("landing.showcase.tab4.mock.title", "WhatsApp Notification Hub")}</span>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">{t("landing.showcase.tab4.mock.mode", "Automation Live")}</span>
          </div>
          <div className="space-y-3">
            {/* Event 1 */}
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 p-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">{t("landing.showcase.tab4.mock.event1Title", "Appointment Reminder Triggered")}</p>
                <p className="text-[10px] text-slate-400">{t("landing.showcase.tab4.mock.event1Text", "Sent to patient Priya Sharma for 3:00 PM Dermatologist consult.")}</p>
              </div>
            </div>
            {/* Event 2 */}
            <div className="flex items-start gap-2.5 rounded-lg bg-teal-950/40 border border-teal-500/25 p-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-teal-300">{t("landing.showcase.tab4.mock.event2Title", "Appointment Confirmed by Patient")}</p>
                <p className="text-[10px] text-teal-200">{t("landing.showcase.tab4.mock.event2Text", "Priya Sharma replied: \"CONFIRM\" via WhatsApp. Calendar updated.")}</p>
              </div>
            </div>
            {/* Event 3 */}
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 p-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">{t("landing.showcase.tab4.mock.event3Title", "Waitlist Alert Dispatched")}</p>
                <p className="text-[10px] text-slate-400">{t("landing.showcase.tab4.mock.event3Text", "Slot at 5:30 PM was cancelled. 3 waitlisted patients alerted on WhatsApp.")}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <main className="landing-page min-h-screen overflow-x-clip text-slate-600 selection:bg-teal-500/20 selection:text-teal-900">
      {/* Header & Nav */}
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-500 sm:px-6 sm:py-4",
            scrolled
              ? "landing-glass border-slate-200/90 shadow-lg shadow-slate-200/60"
              : "border-transparent bg-transparent"
          )}
        >
          <BrandLogo variant="full" href="/" size="2xl" priority />

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-sm font-semibold text-slate-600 shadow-sm md:flex">
            {navLinks.map((l) => (
              <a
                key={l.labelKey}
                href={l.href}
                className="nav-link rounded-full px-3.5 py-2 transition hover:bg-slate-100 hover:text-teal-700"
              >
                {t(l.labelKey, l.defaultLabel)}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none hover:border-teal-300 hover:text-teal-600 shadow-sm"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="hi">🇮🇳 HI</option>
                <option value="de">🇩🇪 DE</option>
              </select>
            </div>

            <a href="/auth" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              {t("landing.nav.signin", "Sign in")}
            </a>
            <a
              href="/auth"
              className="landing-btn-primary btn-shine ring-pulse rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:brightness-110"
            >
              {t("landing.nav.starttrial", "Start free trial")}
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {/* Language Selector Dropdown for Mobile */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none hover:border-teal-300 hover:text-teal-600 shadow-sm"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="hi">🇮🇳 HI</option>
                <option value="de">🇩🇪 DE</option>
              </select>
            </div>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — portaled so overflow-x-hidden on main does not break fixed positioning */}
      {menuMounted &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                className="fixed inset-0 z-[9999] md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                  aria-label="Close menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMenuOpen(false)}
                />

                <motion.div
                  className="absolute inset-x-0 top-0 flex max-h-[100dvh] min-h-[100dvh] flex-col bg-white shadow-2xl"
                  initial={reduceMotion ? false : { y: "-100%" }}
                  animate={{ y: 0 }}
                  exit={reduceMotion ? undefined : { y: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
                    <BrandLogo variant="full" href="/" size="lg" />
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
                      aria-label="Close menu"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
                    {navLinks.map((l) => (
                      <a
                        key={l.labelKey}
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl border border-transparent px-4 py-3.5 text-base font-semibold text-slate-800 transition hover:border-slate-200 hover:bg-slate-50 hover:text-teal-700 active:bg-teal-50"
                      >
                        {t(l.labelKey, l.defaultLabel)}
                      </a>
                    ))}
                  </nav>

                  <div className="space-y-3 border-t border-slate-200 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                    {/* Mobile Language Selector */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                      <span className="text-xs font-bold text-slate-500">Language / भाषा / Sprache</span>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="cursor-pointer bg-transparent text-xs font-bold text-slate-700 outline-none hover:text-teal-600"
                      >
                        <option value="en">🇬🇧 English</option>
                        <option value="hi">🇮🇳 हिंदी</option>
                        <option value="de">🇩🇪 Deutsch</option>
                      </select>
                    </div>

                    <a
                      href="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      {t("landing.nav.signin", "Sign in")}
                    </a>
                    <a
                      href="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="landing-btn-primary btn-shine block rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-teal-600/20"
                    >
                      {t("landing.nav.starttrial", "Start free trial")}
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:pb-20 lg:pt-16">
        <div className="hero-orb pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-gradient-to-br from-teal-400/20 via-cyan-300/10 to-transparent blur-3xl" />
        <div className="hero-orb-delay pointer-events-none absolute top-32 right-0 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl animate-blob-delay" />

        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <motion.div
              className="text-left lg:col-span-6"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionBadge>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                </span>
                <Sparkles size={12} className="text-teal-600" />
                {t("landing.hero.badge", "Next-gen clinic automation")}
              </SectionBadge>

              <h1 className="landing-section-title mt-6 text-[clamp(2.5rem,5vw,4rem)] font-extrabold">
                {t("landing.hero.titlePart1", "Run your practice on")}{" "}
                <span className="gradient-text-animated">{t("landing.hero.titleHighlight", "intelligent autopilot")}</span>
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                {t("landing.hero.subtitle", "Automate patient triage, follow-ups, Google reviews, booking confirmations, and health content — built for modern Indian clinics.")}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/auth"
                  className="landing-btn-primary btn-shine group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-teal-600/20 transition hover:brightness-110"
                >
                  {t("landing.hero.ctaStart", "Start free trial — 14 days")}
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#showcase"
                  className="landing-glass inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-slate-800 transition hover:border-teal-300"
                >
                  <CirclePlay size={16} className="text-teal-600" />
                  {t("landing.hero.ctaTour", "Watch product tour")}
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-2.5">
                {[
                  { icon: Shield, labelKey: "landing.hero.chipHipaa", defaultLabel: "HIPAA aligned" },
                  { icon: CheckCircle2, labelKey: "landing.hero.chipNoCard", defaultLabel: "No card required" },
                  { icon: Zap, labelKey: "landing.hero.chipTime", defaultLabel: "Live in 5 minutes" },
                ].map(({ icon: Icon, labelKey, defaultLabel }) => (
                  <span key={labelKey} className="landing-chip">
                    <Icon size={13} className="text-teal-600" />
                    {t(labelKey, defaultLabel)}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative lg:col-span-6"
              initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-500/20 via-transparent to-violet-500/10 blur-2xl" />
              <InteractiveHeroMockup />

              <div className="landing-glass animate-float absolute -bottom-4 -left-2 z-10 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15">
                  <TrendingUp size={18} className="text-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("landing.hero.googleRating", "Google rating")}</p>
                  <p className="text-sm font-extrabold text-slate-900">3.8 → 4.8★</p>
                </div>
              </div>

              <div className="landing-glass animate-float-slow absolute -right-2 -top-4 z-10 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15">
                  <Bot size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("landing.hero.aiTriage", "AI triage")}</p>
                  <p className="text-sm font-extrabold text-slate-900">Hinglish · 24/7</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Trust logo band */}
      <section className="border-y border-slate-200/80 bg-white/50 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-5 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            {t("landing.trust.text", "Trusted by 2,400+ clinics across India")}
          </p>
          <div className="marquee-wrap">
            <div className="marquee-track items-center gap-14 pr-14">
              {[...brands, ...brands].map((b, i) => (
                <span
                  key={`${b}-${i}`}
                  className="whitespace-nowrap text-sm font-semibold text-slate-500 transition-colors duration-300 hover:text-teal-600"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section ref={statsRef} className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {[
            { display: `${clinics.toLocaleString()}+`, labelKey: "landing.stats.clinics", defaultLabel: "Automated clinics", icon: Users, color: "text-teal-600", ring: "from-teal-500/50" },
            { display: `${(replies / 10).toFixed(0)}M+`, labelKey: "landing.stats.queries", defaultLabel: "AI queries resolved", icon: Bot, color: "text-cyan-600", ring: "from-cyan-500/50" },
            { display: `${sat}%`, labelKey: "landing.stats.sat", defaultLabel: "Patient satisfaction", icon: Star, color: "text-amber-600", ring: "from-amber-500/50" },
            { display: `${hours}h/wk`, labelKey: "landing.stats.hours", defaultLabel: "Hours saved per doctor", icon: Clock, color: "text-violet-600", ring: "from-violet-500/50" },
          ].map((s) => (
            <div
              key={s.labelKey}
              className="card-spotlight landing-glass group relative flex flex-col items-center overflow-hidden rounded-2xl px-4 py-9 text-center"
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r via-transparent to-transparent opacity-80",
                  s.ring
                )}
              />
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition group-hover:scale-105">
                <s.icon size={20} className={s.color} />
              </div>
              <p className={cn("text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl", s.color)}>{s.display}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t(s.labelKey, s.defaultLabel)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points Section */}
      <section id="pain-points" className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <SectionBadge>{t("landing.pain.badge", "Friction vs freedom")}</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl md:text-[2.75rem]">
              {t("landing.pain.title", "Why traditional clinic workflows struggle")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              {t("landing.pain.subtitle", "Manual booking, slow review replies, and no content pipeline cap how fast your practice can grow.")}
            </p>
          </div>

          <div className="relative grid gap-6 md:grid-cols-2 md:gap-8">
            <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
              <span className="landing-glass rounded-full border border-slate-200 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-slate-600 shadow-md">
                {t("landing.pain.vs", "vs")}
              </span>
            </div>

            <div className="landing-glass rounded-3xl border border-rose-200/80 bg-rose-50/30 p-7 sm:p-8">
              <div className="mb-5 inline-flex rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400">
                <X size={22} />
              </div>
              <h3 className="text-xl font-bold">{t("landing.pain.traditionalTitle", "Traditional operations")}</h3>
              <p className="mt-2 mb-6 border-b border-rose-200 pb-4 text-sm text-slate-600">
                {t("landing.pain.traditionalSub", "Scheduling friction and missed reviews add up every week.")}
              </p>
              
              <ul className="space-y-4">
                {[
                  { titleKey: "landing.pain.traditionalItem1Title", defaultTitle: "Missed Opportunities", textKey: "landing.pain.traditionalItem1Text", defaultText: "Staff misses 35% of patient calls and queries during evening hours." },
                  { titleKey: "landing.pain.traditionalItem2Title", defaultTitle: "Review Decline", textKey: "landing.pain.traditionalItem2Text", defaultText: "Happy patients leave without rating, while negative reviews dominate Google Maps SEO." },
                  { titleKey: "landing.pain.traditionalItem3Title", defaultTitle: "No-Show Costs", textKey: "landing.pain.traditionalItem3Text", defaultText: "15% of bookings are forgotten. No follow-up reminders means vacant hours." },
                  { titleKey: "landing.pain.traditionalItem4Title", defaultTitle: "Zero Video SEO", textKey: "landing.pain.traditionalItem4Text", defaultText: "Doctors have no time to record scripts, edit clinical health videos, or post Reels." },
                ].map((item) => (
                  <li key={item.titleKey} className="flex gap-3 text-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-700">{t(item.titleKey, item.defaultTitle)}</h4>
                      <p className="mt-0.5 text-xs text-slate-600">{t(item.textKey, item.defaultText)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="landing-glass-strong rounded-3xl p-7 shadow-2xl shadow-teal-500/10 sm:p-8">
              <div className="mb-5 inline-flex rounded-2xl border border-teal-500/25 bg-teal-500/15 p-3 text-teal-400">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-xl font-bold">{t("landing.pain.autopilotTitle", "ClinicSuite autopilot")}</h3>
              <p className="mt-2 mb-6 border-b border-teal-200 pb-4 text-sm text-slate-600">
                {t("landing.pain.autopilotSub", "Fully automated patient comms, reviews, and content — on one dashboard.")}
              </p>

              <ul className="space-y-4">
                {[
                  { titleKey: "landing.pain.autopilotItem1Title", defaultTitle: "24/7 AI Triage Responses", textKey: "landing.pain.autopilotItem1Text", defaultText: "AI instant chat handles 80%+ of basic patient queries in Hindi/English." },
                  { titleKey: "landing.pain.autopilotItem2Title", defaultTitle: "Automated Feedback Loops", textKey: "landing.pain.autopilotItem2Text", defaultText: "Review links are sent automatically via WhatsApp after consults." },
                  { titleKey: "landing.pain.autopilotItem3Title", defaultTitle: "Zero-Waste Calendar Engine", textKey: "landing.pain.autopilotItem3Text", defaultText: "Automated confirmation links, follow-up notifications, and waitlists." },
                  { titleKey: "landing.pain.autopilotItem4Title", defaultTitle: "AI-Powered Video Studio", textKey: "landing.pain.autopilotItem4Text", defaultText: "Create educational reels, subtitles, and voices in under 2 minutes." },
                ].map((item) => (
                  <li key={item.titleKey} className="flex gap-3 text-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-2 shrink-0 animate-ping" />
                    <div>
                      <h4 className="text-xs font-bold text-teal-700">{t(item.titleKey, item.defaultTitle)}</h4>
                      <p className="mt-0.5 text-xs text-slate-600">{t(item.textKey, item.defaultText)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase Section */}
      <section id="showcase" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionBadge>{t("landing.showcase.badge", "Feature showcase")}</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              {t("landing.showcase.title", "One platform. Full automation.")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-600 sm:text-base">
              {t("landing.showcase.subtitle", "Explore each module — real workflows your front desk and marketing team run daily.")}
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-4">
              {showcaseTabs.map((item, idx) => {
                const isActive = activeShowcase === idx;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveShowcase(idx)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all duration-300",
                      isActive
                        ? "landing-glass-strong border-teal-500/30 shadow-lg shadow-teal-500/5"
                        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", isActive ? "text-teal-600" : "text-slate-500")}>
                        {item.badge}
                      </span>
                      {isActive && <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />}
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.tagline}</p>
                  </button>
                );
              })}
            </div>

            <div className="landing-glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:col-span-8">
              <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />

              <div className="grid items-center gap-8 md:grid-cols-12">
                <div className="md:col-span-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeShowcase}
                      initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                      transition={{ duration: 0.35 }}
                    >
                      {showcaseTabs[activeShowcase].mockup}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="space-y-4 text-left md:col-span-5">
                  <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-700">
                    {showcaseTabs[activeShowcase].title}
                  </span>
                  <h4 className="text-lg font-extrabold leading-snug">
                    {showcaseTabs[activeShowcase].tagline}
                  </h4>
                  <ul className="space-y-3">
                    {showcaseTabs[activeShowcase].bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal-600" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <SectionBadge>{t("landing.roi.badge", "ROI calculator")}</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              {t("landing.roi.title", "Calculate your practice benefits")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
              {t("landing.roi.subtitle", "Select your organization structure to estimate the resources and rating growth ClinicSuite delivers.")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-12 items-center">
            {/* Setup selection */}
            <div className="md:col-span-5 text-left space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t("landing.roi.labelSize", "Clinic Size / Network")}</p>
              
              <div className="space-y-2">
                {[
                  { id: "single", labelKey: "landing.roi.optSingleLabel", defaultLabel: "Single Clinic / Specialist", subKey: "landing.roi.optSingleSub", defaultSub: "1-2 doctors, solo practice" },
                  { id: "multi", labelKey: "landing.roi.optMultiLabel", defaultLabel: "Multi-Specialty / Center", subKey: "landing.roi.optMultiSub", defaultSub: "3-10 doctors, group practice" },
                  { id: "chain", labelKey: "landing.roi.optChainLabel", defaultLabel: "Hospital Network / Group", subKey: "landing.roi.optChainSub", defaultSub: "10+ branches, regional clinic chain" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setClinicType(item.id as any)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all duration-200",
                      clinicType === item.id
                        ? "landing-glass-strong border-teal-500/35"
                        : "border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50/40"
                    )}
                  >
                    <p className="text-xs font-bold leading-tight text-slate-900">{t(item.labelKey, item.defaultLabel)}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{t(item.subKey, item.defaultSub)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated output */}
            <div className="landing-glass-strong relative overflow-hidden rounded-3xl p-6 text-center shadow-2xl md:col-span-7">
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { labelKey: "landing.roi.resTimeLabel", defaultLabel: "Admin Time Saved", val: roiCalculations[clinicType].hours, color: "text-teal-600" },
                  { labelKey: "landing.roi.resBookLabel", defaultLabel: "Additional Bookings", val: roiCalculations[clinicType].consults, color: "text-cyan-600" },
                  { labelKey: "landing.roi.resReviewLabel", defaultLabel: "Reviews Sync Boost", val: roiCalculations[clinicType].reviews, color: "text-amber-600" },
                  { labelKey: "landing.roi.resSavingsLabel", defaultLabel: "Est. Savings / Year", val: roiCalculations[clinicType].savings, color: "text-violet-600" },
                ].map((res) => (
                  <div key={res.labelKey} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{t(res.labelKey, res.defaultLabel)}</p>
                    <p className={cn("mt-1 text-base font-black leading-tight sm:text-lg", res.color)}>{res.val}</p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                {t("landing.roi.disclaimer", "*Estimates based on anonymized metadata from 2,400+ clinical integrations.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms & Modules Grid (6 Core Features) */}
      <section id="features" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionBadge>{t("landing.features.badge", "Platform features")}</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              {t("landing.features.title", "One central command center")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
              {t("landing.features.subtitle", "Same modular layout experience as Video Studio and Review Inbox — unified for your entire practice staff.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const accent = featureAccent[f.accent] ?? featureAccent.teal;
              return (
                <motion.article
                  key={f.titleKey}
                  className={cn(
                    "card-spotlight landing-glass group relative overflow-hidden rounded-2xl p-6 text-left transition duration-300",
                    accent.hoverBorder,
                    accent.glow,
                    "hover:shadow-xl"
                  )}
                  variants={fadeUp}
                  initial={reduceMotion ? false : "hidden"}
                  whileInView={reduceMotion ? undefined : "visible"}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className={cn(
                      "feature-icon-hover mb-5 inline-flex rounded-2xl border p-3.5",
                      accent.iconBg,
                      accent.iconText
                    )}
                  >
                    <f.icon size={20} />
                  </div>
                  <h3 className="text-base font-bold transition group-hover:text-teal-700">{t(f.titleKey, f.defaultTitle)}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{t(f.descKey, f.defaultDesc)}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="relative px-4 py-20 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.06),transparent_50%)]" />
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <SectionBadge>{t("landing.security.badge", "Enterprise security")}</SectionBadge>
            <h2 className="landing-section-title text-2xl font-extrabold sm:text-3xl">
              {t("landing.security.title", "Clinic & patient data security")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs text-slate-600">
              {t("landing.security.subtitle", "Built on industry-standard encryption protocols aligned with healthcare security requirements.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, titleKey: "landing.security.card1.title", defaultTitle: "HIPAA Aligned", descKey: "landing.security.card1.desc", defaultDesc: "Data stored, encrypted and managed following patient security regulations." },
              { icon: Lock, titleKey: "landing.security.card2.title", defaultTitle: "256-bit Encryption", descKey: "landing.security.card2.desc", defaultDesc: "State-of-the-art encryption protocols for data in transit and at rest." },
              { icon: Database, titleKey: "landing.security.card3.title", defaultTitle: "India Residency", descKey: "landing.security.card3.desc", defaultDesc: "Patient data securely hosted inside local AWS Mumbai availability zones." },
              { icon: CheckCircle2, titleKey: "landing.security.card4.title", defaultTitle: "Role-Based Access", descKey: "landing.security.card4.desc", defaultDesc: "Custom access credentials ensuring patients records are hidden from non-clinical staff." },
            ].map((s) => (
              <div key={s.titleKey} className="landing-glass card-spotlight space-y-2.5 rounded-2xl p-5 text-left">
                <div className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-600">
                  <s.icon size={16} />
                </div>
                <h3 className="text-xs font-bold">{t(s.titleKey, s.defaultTitle)}</h3>
                <p className="text-[11px] leading-relaxed text-slate-600">{t(s.descKey, s.defaultDesc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="landing-glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
            
            <div className="mb-12 text-center">
              <SectionBadge>{t("landing.steps.badge", "Simple Setup")}</SectionBadge>
              <h2 className="text-3xl font-black">{t("landing.steps.title", "Live in three simple steps")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{t("landing.steps.subtitle", "No software engineer required. Setup is fully automated.")}</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 text-left">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition duration-300 hover:border-teal-300"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-3xl font-black text-teal-200">{s.num}</span>
                    <s.icon size={16} className="text-teal-600" />
                  </div>
                  <h3 className="text-sm font-extrabold">{t(s.titleKey, s.defaultTitle)}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{t(s.descKey, s.defaultDesc)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <a
                href="/auth"
                className="landing-btn-primary btn-shine inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-500"
              >
                {t("landing.steps.cta", "Get Started Free")} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionBadge>{t("landing.pricing.badge", "Simple pricing")}</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              {t("landing.pricing.title", "Transparent subscription plans")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t("landing.pricing.subtitle", "Try any plan free for 14 days. Cancel anytime, no card required.")}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {plans.map((plan) => (
              <article
                key={plan.nameKey}
                className={cn(
                  "card-spotlight relative flex flex-col rounded-3xl border p-7 text-left transition duration-300 hover:-translate-y-1",
                  plan.featured
                    ? "glow-featured landing-glass-strong border-teal-400/50 shadow-2xl shadow-teal-500/15"
                    : "landing-glass border-slate-200/90"
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 text-[9px] font-black text-slate-950 uppercase tracking-widest shadow-md">
                    {t("landing.pricing.popular", "Most popular")}
                  </span>
                )}
                <p className={cn("text-xs font-black uppercase tracking-wider", plan.featured ? "text-teal-400" : "text-teal-500")}>
                  {t(plan.nameKey, plan.defaultName)}
                </p>
                <p className="mt-3 text-4xl font-black">
                  {t(plan.priceKey, plan.defaultPrice)}
                  {plan.defaultPrice !== "Custom Pricing" && (
                    <span className="text-xs font-bold text-slate-500">{t("landing.pricing.perMonth", "/mo")}</span>
                  )}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{t(plan.descKey, plan.defaultDesc)}</p>
                
                <ul className="my-8 flex-1 space-y-3">
                  {plan.featureKeys.map((fKey, fIdx) => (
                    <li key={fKey} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 size={13} className={cn("mt-0.5 shrink-0", plan.featured ? "text-teal-600" : "text-teal-500")} />
                      <span className="leading-normal text-slate-700">{t(fKey, plan.defaultFeatures[fIdx])}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/auth"
                  className={cn(
                    "block rounded-2xl py-3.5 text-center text-xs font-bold transition duration-200",
                    plan.featured
                      ? "bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-500/10"
                      : "border border-slate-200 bg-white text-slate-900 hover:border-teal-200 hover:bg-teal-50"
                  )}
                >
                  {t(plan.ctaKey, plan.defaultCta)}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <SectionBadge>{t("landing.testimonials.badge", "Testimonials")}</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              {t("landing.testimonials.title", "Real clinics. Real results.")}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((test) => (
              <article
                key={test.nameKey}
                className="card-spotlight landing-glass flex flex-col rounded-2xl p-6 text-left transition hover:border-teal-500/20"
              >
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <Quote size={22} className="mb-3 text-teal-500/25" />
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{t(test.quoteKey, test.defaultQuote)}&rdquo;</p>

                <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-xs font-black text-white shadow-md shadow-teal-500/20">
                    {test.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t(test.nameKey, test.defaultName)}</p>
                    <p className="text-xs text-slate-500">{t(test.roleKey, test.defaultRole)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <SectionBadge>{t("landing.faq.badge", "FAQ")}</SectionBadge>
            <h2 className="text-3xl font-black">{t("landing.faq.title", "Common Questions")}</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.qKey}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition duration-300",
                    isOpen ? "landing-glass-strong border-teal-400/40" : "landing-glass border-slate-200/90"
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left text-sm font-bold text-slate-900"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span>{t(item.qKey, item.defaultQ)}</span>
                    <ChevronDown
                      size={16}
                      className={cn("shrink-0 text-teal-600 transition-transform duration-300", isOpen && "rotate-180")}
                    />
                  </button>
                  <div className={cn("faq-body", isOpen && "open")}>
                    <div>
                      <p className="border-t border-slate-200 px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600">
                        {t(item.aKey, item.defaultA)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="landing-glass-strong mt-10 rounded-2xl border border-teal-200/60 px-6 py-8 text-center sm:px-10">
            <h3 className="text-lg font-bold text-slate-900">{t("landing.faq.contact", "Contact us")}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {t("landing.faq.contactSub", "Have questions? Reach out anytime — we're happy to help.")}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
            >
              <Mail size={16} className="text-teal-600" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="landing-glass-strong relative overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.12),transparent_55%)]" />
            <div className="landing-divider absolute inset-x-8 top-0 sm:inset-x-14" />
            <SectionBadge className="relative mb-6">{t("landing.cta.badge", "Get started today")}</SectionBadge>
            <h2 className="landing-section-title relative text-3xl font-extrabold sm:text-4xl md:text-5xl">
              {t("landing.cta.title", "Ready to automate your clinic?")}
            </h2>
            <p className="relative mx-auto mt-5 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              {t("landing.cta.subtitle", "Join thousands of practices saving admin hours every week. Go live in under five minutes — no developer required.")}
            </p>
            <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/auth"
                className="landing-btn-primary btn-shine inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-9 py-4 text-sm font-bold text-white shadow-xl shadow-teal-600/20 transition hover:brightness-110"
              >
                {t("landing.cta.ctaStart", "Start free trial")} <ArrowRight size={16} />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="landing-glass inline-flex items-center gap-2 rounded-2xl px-9 py-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300"
              >
                {t("landing.cta.ctaContact", "Contact us")} <ArrowUpRight size={16} className="text-teal-600" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-slate-200 bg-white/80 px-4 py-14 backdrop-blur-sm sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4 text-left">
          <div className="sm:col-span-2 space-y-3.5">
            <BrandLogo variant="full" href="/" size="xl" />
            <p className="max-w-xs text-xs leading-relaxed text-slate-500">
              {t("landing.footer.desc", "AI-powered practice growth, patient communication, ratings autopilot, and reels marketing studio for modern Indian clinics.")}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{t("landing.footer.product", "Product")}</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-500">
              {[
                { labelKey: "landing.nav.features", defaultLabel: "Features" },
                { labelKey: "landing.nav.pricing", defaultLabel: "Pricing" },
                { labelKey: "landing.footer.caseStudies", defaultLabel: "Case Studies" }
              ].map((link) => (
                <li key={link.labelKey}>
                  <a href="#" className="hover:text-teal-400 transition">
                    {t(link.labelKey, link.defaultLabel)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{t("landing.footer.contact", "Contact")}</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-500">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2 transition hover:text-teal-600"
                >
                  <Mail size={13} className="text-teal-600" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={13} className="text-teal-600" />
                {t("landing.footer.mumbai", "Mumbai, India")}
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-[11px] text-slate-600">
          <p>{t("landing.footer.copyright", "© 2026 ClinicSuite. All rights reserved.")}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-teal-400 transition">
              {t("landing.footer.privacy", "Privacy Policy")}
            </a>
            <a href="#" className="hover:text-teal-400 transition">
              {t("landing.footer.terms", "Terms of Service")}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
