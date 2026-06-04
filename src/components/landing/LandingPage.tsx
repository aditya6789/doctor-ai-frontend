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
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pain Points", href: "#pain-points" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const features = [
  {
    icon: Bot,
    title: "AI Patient Chat",
    desc: "24/7 assistant for FAQs, triage, and booking nudges — fluent in Hindi, Hinglish, and English.",
    accent: "teal",
  },
  {
    icon: Video,
    title: "Video Studio",
    desc: "Turn clinical topics into short educational videos with AI script, voice, and caption generation.",
    accent: "violet",
  },
  {
    icon: Star,
    title: "Review Autopilot",
    desc: "Sync Google and Meta reviews, analyze sentiment, and draft polite AI replies in 1 click.",
    accent: "amber",
  },
  {
    icon: CalendarCheck2,
    title: "Smart Booking",
    desc: "Auto-fill slots with intelligent SMS/WhatsApp reminders, waitlists, and instant confirmations.",
    accent: "sky",
  },
  {
    icon: BarChart3,
    title: "Practice Analytics",
    desc: "Monitor consultation volumes, patient rating trends, and sentiment metrics in real-time.",
    accent: "emerald",
  },
  {
    icon: MessageSquareText,
    title: "WhatsApp Hub",
    desc: "A unified inbox for automated patient communications, broadcast follow-ups, and alerts.",
    accent: "green",
  },
];

const steps = [
  { num: "01", title: "Connect Channels", desc: "Link WhatsApp API, Google Business Profile, and Meta Pages in under 5 minutes.", icon: Layers },
  { num: "02", title: "Enable AI Workflows", desc: "Activate triage assistant, automated review replies, and clinic booking calendars.", icon: Cpu },
  { num: "03", title: "Grow on Autopilot", desc: "Run your clinical administration 24/7 while your team focuses entirely on patient care.", icon: TrendingUp },
];

const plans = [
  {
    name: "Starter",
    price: "₹2,499",
    desc: "Solo practitioners and small clinics.",
    features: ["1 location", "AI Patient Chat (500 chats/mo)", "Google Maps Integration", "Basic Reviews Autopilot", "Smart Scheduling Interface"],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Growth",
    price: "₹5,999",
    desc: "Growing practices wanting full automated workflows.",
    features: [
      "Up to 5 locations",
      "Unlimited AI Patient Chat",
      "WhatsApp Business API Integration",
      "AI Video Studio (20 reels/mo)",
      "Advanced Review Analytics & Auto-Replies",
      "Priority WhatsApp & Call Support",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom Pricing",
    desc: "Hospital chains and multi-city clinics.",
    features: [
      "Unlimited locations & sub-accounts",
      "Custom-trained AI models on clinical protocol",
      "SSO, SAML & EHR integrations",
      "Dedicated account success manager",
      "HIPAA Business Associate Agreement (BAA)",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const testimonials = [
  {
    quote: "Patient response workload 60% kam ho gaya. Staff ab actual patient care aur clinical support pe focus karta hai.",
    name: "Dr. Mehak Arora",
    role: "CityCare Clinic · Mumbai",
    initials: "MA",
  },
  {
    quote: "Review autopilot ne hamari Google Maps rating ko 3.8 se 4.8 kar diya sirf 6 weeks mein. Appointments double ho gaye hain.",
    name: "Dr. Ritesh Jain",
    role: "WellSpring Health · Delhi",
    initials: "RJ",
  },
  {
    quote: "Ek hi din mein AI chatbot launch ho gaya, aur automated WhatsApp confirmation se slots easily fill hone lage.",
    name: "Dr. Aviral Singh",
    role: "PrimeSkin · Bangalore",
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
  { q: "ClinicSuite ko setup karne mein kitna time lagta hai?", a: "Almost check-in setups 5 minutes se kam mein live ho jaate hain. Aapko kisi technical coding or developer support ki zaroorat nahi hai." },
  { q: "Kya hamara purana clinical booking system integration support karega?", a: "Haan. ClinicSuite APIs aur hooks ke zariye standard CRM aur EHR softwares se automatically connect ho jaata hai." },
  { q: "AI chatbot kaunsi languages ko support karta hai?", a: "Hindi, English, Hinglish aur 10+ regional Indian languages (Bengali, Tamil, Telugu, etc.) support karta hai automatically text language detect karke." },
  { q: "Kya hamara patient data secure hai?", a: "Absolutes. ClinicSuite, HIPAA compliance requirements follow karta hai. Aapka data fully encrypted rehta hai state-of-the-art 256-bit encryption standard ke sath AWS India servers mein." },
  { q: "Kya free trial ke liye credit card card detail ki zaroorat hoti hai?", a: "Nahi. 14-day full platform access free trial bilkul free hai without filling credit card card details." },
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
  const [activeTab, setActiveTab] = useState<"stats" | "logs">("stats");
  const [ticks, setTicks] = useState<Array<{ id: number; text: string; time: string; type: string }>>([
    { id: 1, text: "AI replied to Dr. Arora's Google Review", time: "Just now", type: "review" },
    { id: 2, text: "WhatsApp booking confirmed: Ortho slot", time: "2m ago", type: "booking" },
    { id: 3, text: "Video Reel generated: 'Preventing Joint Pain'", time: "6m ago", type: "video" },
  ]);

  // Add mock events over time
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        { text: "AI automated patient triage query (Hinglish)", type: "chat" },
        { text: "New 5★ Google Map review synced", type: "review" },
        { text: "WhatsApp confirmation sent to patient Rohan", type: "booking" },
        { text: "AI Video Studio script compiled successfully", type: "video" },
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setTicks((prev) => [
        { id: Date.now(), text: randomMsg.text, time: "Just now", type: randomMsg.type },
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
            app.clinicsuite.in/dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Autopilot Active</span>
        </div>
      </div>

      <div className="flex min-h-[360px] flex-col md:flex-row">
        <aside className="w-full shrink-0 border-r border-slate-200 bg-slate-50/80 p-4 md:w-44">
          <div className="space-y-1">
            {[
              { label: "Overview", icon: Layers, active: true },
              { label: "Patient Chat", icon: Bot, count: "5" },
              { label: "Video Studio", icon: Video },
              { label: "Reviews Feed", icon: Star },
              { label: "Consultations", icon: CalendarCheck2 },
              { label: "Analytics", icon: BarChart3 },
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
                Live Metrics
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-bold transition",
                  activeTab === "logs" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Live Ticker
              </button>
            </div>
            <span className="text-[10px] font-bold text-slate-500">Sync: Realtime 1s</span>
          </div>

          {activeTab === "stats" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Consults", val: "1,482", trend: "+14%", color: "text-teal-600" },
                  { label: "AI Replies", val: "842", trend: "+41%", color: "text-violet-600" },
                  { label: "Google Rating", val: "4.8★", trend: "+0.4", color: "text-amber-600" },
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Weekly Patient Growth</p>
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700">Automated</span>
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
                    Week 4: +280 Patients
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Live Autopilot Events</p>
              <AnimatePresence initial={false}>
                {ticks.map((t, idx) => (
                  <motion.div
                    key={t.id}
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
                        t.type === "review"
                          ? "bg-amber-400 animate-pulse"
                          : t.type === "booking"
                          ? "bg-teal-400"
                          : t.type === "video"
                          ? "bg-violet-400"
                          : "bg-emerald-400"
                      )}
                    />
                    <span className="flex-1 font-medium">{t.text}</span>
                    <span className="font-bold text-slate-500">{t.time}</span>
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
    single: { hours: "12 hours/wk", consults: "+15 new consults/mo", reviews: "+35 reviews/mo", savings: "₹15,000/mo" },
    multi: { hours: "28 hours/wk", consults: "+48 new consults/mo", reviews: "+90 reviews/mo", savings: "₹48,000/mo" },
    chain: { hours: "75+ hours/wk", consults: "+160+ new consults/mo", reviews: "+280 reviews/mo", savings: "₹1,35,000/mo" },
  };

  // Feature Showcase previews details
  const showcaseTabs = [
    {
      title: "AI Patient Chatbot",
      badge: "WhatsApp & Web",
      tagline: "Engage and triage patients automatically 24/7.",
      bullets: [
        "Instantly answers clinical FAQs and consultation timings.",
        "Detects patient intent in Hindi, English, and Hinglish.",
        "Captures details and schedules slot bookings automatically.",
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-[10px] font-black text-white">WA</div>
            <div>
              <p className="text-xs font-bold leading-none">CityCare AI Triage</p>
              <span className="text-[9px] font-bold text-teal-400">Online · Verification Active</span>
            </div>
          </div>
          <div className="space-y-3.5">
            <div className="max-w-[85%] rounded-2xl bg-slate-900 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-slate-500 mb-0.5">Patient · 10:14 AM</p>
              <p className="text-xs text-slate-200">Hi, kya Dr. Arora skin allergy ke liye available hain aaj? Mujhe severe itching ho rahi hai.</p>
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl bg-teal-950 border border-teal-500/25 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-teal-400 mb-0.5">ClinicSuite Assistant · 10:14 AM</p>
              <p className="text-xs text-teal-100">Namaste! Yes, Dr. Arora (Dermatologist) available hain. Unka clinic consultation fee ₹500 hai. Humare paas aaj do vacant slots hain:</p>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded bg-teal-800/80 border border-teal-400/30 px-2 py-1 text-[9px] font-bold text-white">4:30 PM today</span>
                <span className="rounded bg-teal-800/80 border border-teal-400/30 px-2 py-1 text-[9px] font-bold text-white">6:00 PM today</span>
              </div>
            </div>
            <div className="max-w-[85%] rounded-2xl bg-slate-900 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-slate-500 mb-0.5">Patient · 10:15 AM</p>
              <p className="text-xs text-slate-200">4:30 PM standard patient slot book kar dijiye checkup ke liye.</p>
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl bg-teal-950 border border-teal-500/25 px-3 py-2 text-left">
              <p className="text-[10px] font-bold text-teal-400 mb-0.5">ClinicSuite Assistant · 10:15 AM</p>
              <p className="text-xs text-teal-100">Great! 4:30 PM slot select ho gaya hai. Aapki appointment confirm karne ke liye please is link pe click karein ya reply confirm karein.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "AI Video Studio",
      badge: "YouTube & Instagram",
      tagline: "Generate short medical educational videos in 1 click.",
      bullets: [
        "Write simple topics, AI drafts clinical scripts in Hinglish.",
        "Voice generator compiles professional narrations.",
        "Auto-generate visual captions matching speech pacing.",
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Control Panel */}
            <div className="space-y-2 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">AI Script Builder</p>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">Topic</p>
                <p className="text-xs font-bold text-white mt-0.5">3 Tips to Manage Hypertension</p>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Drafted Audio Script</p>
                <p className="text-[11px] leading-relaxed text-slate-300 mt-1">
                  "Doston, hyper tension control karna koi muskil kaam nahi. Sabse pehle, daily minimum 30 minutes walk start kijiye. Dusra, salt intake decrease kijiye..."
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-teal-500/20 px-2 py-0.5 text-[9px] font-black text-teal-300">
                <Volume2 size={10} /> Hinglish Voice: Dr. Male 1
              </span>
            </div>
            {/* Visual Shorts Bezel */}
            <div className="relative mx-auto h-[220px] w-[130px] rounded-xl border-4 border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between p-2 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
              <div className="relative flex justify-between items-center z-20">
                <span className="text-[8px] font-bold text-teal-400">ClinicSuite Studio</span>
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
                <p className="bg-teal-500 text-slate-950 text-[10px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded inline-block shadow-lg">
                  SALT INTAKE DECREASE
                </p>
                <p className="text-[8px] font-bold text-slate-200 mt-1">Control Hypertension</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Google Review Autopilot",
      badge: "SEO Rating Booster",
      tagline: "Autopilot patient responses and reviews growth.",
      bullets: [
        "Syncs Google Business Profile and Facebook Reviews live.",
        "Generates HIPAA-compliant drafted replies with zero medical hazard.",
        "Reduces average reply time from 4 days to under 60 seconds.",
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner text-left">
          <div className="mb-3 flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Google Business Reviews</span>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">Automated Mode</span>
          </div>
          <div className="rounded-xl bg-slate-900 border border-slate-800/80 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-teal-500/20 text-[10px] font-black flex items-center justify-center text-teal-300">VK</div>
                <div>
                  <h4 className="text-xs font-bold leading-none">Vinay Kapoor</h4>
                  <span className="text-[9px] text-slate-500">Google Reviewer · 3h ago</span>
                </div>
              </div>
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              "Great doctor! Consultation details were precise and waiting hours was very low. The digital check-in on WhatsApp saved us so much time."
            </p>
            <div className="mt-2 rounded-lg bg-teal-950/60 border border-teal-500/20 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">ClinicSuite Auto-Reply</span>
                <span className="text-[8px] bg-teal-500 text-slate-950 font-extrabold px-1.5 rounded">Published</span>
              </div>
              <p className="text-[10px] text-teal-200">
                "Hello Vinay, thank you for sharing your feedback! We are thrilled to know our digital WhatsApp bookings check-in helped save your time. We look forward to supporting your healthcare requirements."
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "WhatsApp Booking Hub",
      badge: "Confirmations & Reminders",
      tagline: "Keep patient slots booked and reduce drop-offs by 85%.",
      bullets: [
        "Sends proactive calendar booking reminders automatically.",
        "Allows patients to reschedule easily inside conversational chat.",
        "Smart waitlist engine refills cancelled timings instantly.",
      ],
      mockup: (
        <div className="rounded-2xl border border-slate-800 bg-[#050914] p-4 text-slate-100 shadow-inner text-left">
          <div className="mb-3 flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">WhatsApp Notification Hub</span>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">Automation Live</span>
          </div>
          <div className="space-y-3">
            {/* Event 1 */}
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 p-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">Appointment Reminder Triggered</p>
                <p className="text-[10px] text-slate-400">Sent to patient Priya Sharma for 3:00 PM Dermatologist consult.</p>
              </div>
            </div>
            {/* Event 2 */}
            <div className="flex items-start gap-2.5 rounded-lg bg-teal-950/40 border border-teal-500/25 p-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-teal-300">Appointment Confirmed by Patient</p>
                <p className="text-[10px] text-teal-200">Priya Sharma replied: "CONFIRM" via WhatsApp. Calendar updated.</p>
              </div>
            </div>
            {/* Event 3 */}
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 p-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">Waitlist Alert Dispatched</p>
                <p className="text-[10px] text-slate-400">Slot at 5:30 PM was cancelled. 3 waitlisted patients alerted on WhatsApp.</p>
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
            "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all duration-500 sm:px-6",
            scrolled
              ? "landing-glass border-slate-200/90 shadow-lg shadow-slate-200/60"
              : "border-transparent bg-transparent"
          )}
        >
          <BrandLogo variant="full" href="/" size="xl" priority />

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-sm font-semibold text-slate-600 shadow-sm md:flex">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="nav-link rounded-full px-3.5 py-2 transition hover:bg-slate-100 hover:text-teal-700"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a href="/auth" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
              Sign in
            </a>
            <a
              href="/auth"
              className="landing-btn-primary btn-shine ring-pulse rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:brightness-110"
            >
              Start free trial
            </a>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
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
                    <BrandLogo variant="full" href="/" size="md" />
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
                        key={l.label}
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-xl border border-transparent px-4 py-3.5 text-base font-semibold text-slate-800 transition hover:border-slate-200 hover:bg-slate-50 hover:text-teal-700 active:bg-teal-50"
                      >
                        {l.label}
                      </a>
                    ))}
                  </nav>

                  <div className="space-y-3 border-t border-slate-200 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                    <a
                      href="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      Sign in
                    </a>
                    <a
                      href="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="landing-btn-primary btn-shine block rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-teal-600/20"
                    >
                      Start free trial
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
                Next-gen clinic automation
              </SectionBadge>

              <h1 className="landing-section-title mt-6 text-[clamp(2.5rem,5vw,4rem)] font-extrabold">
                Run your practice on{" "}
                <span className="gradient-text-animated">intelligent autopilot</span>
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                Automate patient triage, follow-ups, Google reviews, booking confirmations, and health content — built for modern Indian clinics.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/auth"
                  className="landing-btn-primary btn-shine group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-teal-600/20 transition hover:brightness-110"
                >
                  Start free trial — 14 days
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#showcase"
                  className="landing-glass inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-slate-800 transition hover:border-teal-300"
                >
                  <CirclePlay size={16} className="text-teal-600" />
                  Watch product tour
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-2.5">
                {[
                  { icon: Shield, label: "HIPAA aligned" },
                  { icon: CheckCircle2, label: "No card required" },
                  { icon: Zap, label: "Live in 5 minutes" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="landing-chip">
                    <Icon size={13} className="text-teal-600" />
                    {label}
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Google rating</p>
                  <p className="text-sm font-extrabold text-slate-900">3.8 → 4.8★</p>
                </div>
              </div>

              <div className="landing-glass animate-float-slow absolute -right-2 -top-4 z-10 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15">
                  <Bot size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI triage</p>
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
            Trusted by 2,400+ clinics across India
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
            { display: `${clinics.toLocaleString()}+`, label: "Automated clinics", icon: Users, color: "text-teal-600", ring: "from-teal-500/50" },
            { display: `${(replies / 10).toFixed(0)}M+`, label: "AI queries resolved", icon: Bot, color: "text-cyan-600", ring: "from-cyan-500/50" },
            { display: `${sat}%`, label: "Patient satisfaction", icon: Star, color: "text-amber-600", ring: "from-amber-500/50" },
            { display: `${hours}h/wk`, label: "Hours saved per doctor", icon: Clock, color: "text-violet-600", ring: "from-violet-500/50" },
          ].map((s) => (
            <div
              key={s.label}
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
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points Section */}
      <section id="pain-points" className="relative px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <SectionBadge>Friction vs freedom</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl md:text-[2.75rem]">
              Why traditional clinic workflows struggle
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              Manual booking, slow review replies, and no content pipeline cap how fast your practice can grow.
            </p>
          </div>

          <div className="relative grid gap-6 md:grid-cols-2 md:gap-8">
            <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
              <span className="landing-glass rounded-full border border-slate-200 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-slate-600 shadow-md">
                vs
              </span>
            </div>

            <div className="landing-glass rounded-3xl border border-rose-200/80 bg-rose-50/30 p-7 sm:p-8">
              <div className="mb-5 inline-flex rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400">
                <X size={22} />
              </div>
              <h3 className="text-xl font-bold">Traditional operations</h3>
              <p className="mt-2 mb-6 border-b border-rose-200 pb-4 text-sm text-slate-600">
                Scheduling friction and missed reviews add up every week.
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: "Missed Opportunities", text: "Staff misses 35% of patient calls and queries during evening hours." },
                  { title: "Review Decline", text: "Happy patients leave without rating, while negative reviews dominate Google Maps SEO." },
                  { title: "No-Show Costs", text: "15% of bookings are forgotten. No follow-up reminders means vacant hours." },
                  { title: "Zero Video SEO", text: "Doctors have no time to record scripts, edit clinical health videos, or post Reels." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3 text-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-700">{item.title}</h4>
                      <p className="mt-0.5 text-xs text-slate-600">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="landing-glass-strong rounded-3xl p-7 shadow-2xl shadow-teal-500/10 sm:p-8">
              <div className="mb-5 inline-flex rounded-2xl border border-teal-500/25 bg-teal-500/15 p-3 text-teal-400">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-xl font-bold">ClinicSuite autopilot</h3>
              <p className="mt-2 mb-6 border-b border-teal-200 pb-4 text-sm text-slate-600">
                Fully automated patient comms, reviews, and content — on one dashboard.
              </p>

              <ul className="space-y-4">
                {[
                  { title: "24/7 AI Triage Responses", text: "AI instant chat handles 80%+ of basic patient queries in Hindi/English." },
                  { title: "Automated Feedback Loops", text: "Review links are sent automatically via WhatsApp after consults." },
                  { title: "Zero-Waste Calendar Engine", text: "Automated confirmation links, follow-up notifications, and waitlists." },
                  { title: "AI-Powered Video Studio", text: "Create educational reels, subtitles, and voices in under 2 minutes." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3 text-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-2 shrink-0 animate-ping" />
                    <div>
                      <h4 className="text-xs font-bold text-teal-700">{item.title}</h4>
                      <p className="mt-0.5 text-xs text-slate-600">{item.text}</p>
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
            <SectionBadge>Feature showcase</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              One platform. Full automation.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-600 sm:text-base">
              Explore each module — real workflows your front desk and marketing team run daily.
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
            <SectionBadge>ROI calculator</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              Calculate your practice benefits
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
              Select your organization structure to estimate the resources and rating growth ClinicSuite delivers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-12 items-center">
            {/* Setup selection */}
            <div className="md:col-span-5 text-left space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Clinic Size / Network</p>
              
              <div className="space-y-2">
                {[
                  { id: "single", label: "Single Clinic / Specialist", sub: "1-2 doctors, solo practice" },
                  { id: "multi", label: "Multi-Specialty / Center", sub: "3-10 doctors, group practice" },
                  { id: "chain", label: "Hospital Network / Group", sub: "10+ branches, regional clinic chain" },
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
                    <p className="text-xs font-bold leading-tight text-slate-900">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{item.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated output */}
            <div className="landing-glass-strong relative overflow-hidden rounded-3xl p-6 text-center shadow-2xl md:col-span-7">
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Admin Time Saved", val: roiCalculations[clinicType].hours, color: "text-teal-600" },
                  { label: "Additional Bookings", val: roiCalculations[clinicType].consults, color: "text-cyan-600" },
                  { label: "Reviews Sync Boost", val: roiCalculations[clinicType].reviews, color: "text-amber-600" },
                  { label: "Est. Savings / Year", val: roiCalculations[clinicType].savings, color: "text-violet-600" },
                ].map((res) => (
                  <div key={res.label} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">{res.label}</p>
                    <p className={cn("mt-1 text-base font-black leading-tight sm:text-lg", res.color)}>{res.val}</p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                *Estimates based on anonymized metadata from 2,400+ clinical integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms & Modules Grid (6 Core Features) */}
      <section id="features" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionBadge>Platform features</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              One central command center
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
              Same modular layout experience as Video Studio and Review Inbox — unified for your entire practice staff.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const accent = featureAccent[f.accent] ?? featureAccent.teal;
              return (
                <motion.article
                  key={f.title}
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
                  <h3 className="text-base font-bold transition group-hover:text-teal-700">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{f.desc}</p>
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
            <SectionBadge>Enterprise security</SectionBadge>
            <h2 className="landing-section-title text-2xl font-extrabold sm:text-3xl">
              Clinic & patient data security
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs text-slate-600">
              Built on industry-standard encryption protocols aligned with healthcare security requirements.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "HIPAA Aligned", desc: "Data stored, encrypted and managed following patient security regulations." },
              { icon: Lock, title: "256-bit Encryption", desc: "State-of-the-art encryption protocols for data in transit and at rest." },
              { icon: Database, title: "India Residency", desc: "Patient data securely hosted inside local AWS Mumbai availability zones." },
              { icon: CheckCircle2, title: "Role-Based Access", desc: "Custom access credentials ensuring patients records are hidden from non-clinical staff." },
            ].map((s) => (
              <div key={s.title} className="landing-glass card-spotlight space-y-2.5 rounded-2xl p-5 text-left">
                <div className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-600">
                  <s.icon size={16} />
                </div>
                <h3 className="text-xs font-bold">{s.title}</h3>
                <p className="text-[11px] leading-relaxed text-slate-600">{s.desc}</p>
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
              <SectionBadge>Simple Setup</SectionBadge>
              <h2 className="text-3xl font-black">Live in three simple steps</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">No software engineer required. Setup is fully automated.</p>
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
                  <h3 className="text-sm font-extrabold">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <a
                href="/auth"
                className="landing-btn-primary btn-shine inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-500"
              >
                Get Started Free <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionBadge>Simple pricing</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              Transparent subscription plans
            </h2>
            <p className="mt-2 text-sm text-slate-600">Try any plan free for 14 days. Cancel anytime, no card required.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={cn(
                  "card-spotlight relative flex flex-col rounded-3xl border p-7 text-left transition duration-300 hover:-translate-y-1",
                  plan.featured
                    ? "glow-featured landing-glass-strong border-teal-400/50 shadow-2xl shadow-teal-500/15"
                    : "landing-glass border-slate-200/90"
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 text-[9px] font-black text-slate-950 uppercase tracking-widest shadow-md">
                    Most popular
                  </span>
                )}
                <p className={cn("text-xs font-black uppercase tracking-wider", plan.featured ? "text-teal-400" : "text-teal-500")}>
                  {plan.name}
                </p>
                <p className="mt-3 text-4xl font-black">
                  {plan.price}
                  {plan.price !== "Custom Pricing" && (
                    <span className="text-xs font-bold text-slate-500">/mo</span>
                  )}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{plan.desc}</p>
                
                <ul className="my-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 size={13} className={cn("mt-0.5 shrink-0", plan.featured ? "text-teal-600" : "text-teal-500")} />
                      <span className="leading-normal text-slate-700">{f}</span>
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
                  {plan.cta}
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
            <SectionBadge>Testimonials</SectionBadge>
            <h2 className="landing-section-title text-3xl font-extrabold sm:text-4xl">
              Real clinics. Real results.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <article
                key={t.name}
                className="card-spotlight landing-glass flex flex-col rounded-2xl p-6 text-left transition hover:border-teal-500/20"
              >
                <div className="mb-4 flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <Quote size={22} className="mb-3 text-teal-500/25" />
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>

                <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-xs font-black text-white shadow-md shadow-teal-500/20">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
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
            <SectionBadge>FAQ</SectionBadge>
            <h2 className="text-3xl font-black">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
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
                    <span>{item.q}</span>
                    <ChevronDown
                      size={16}
                      className={cn("shrink-0 text-teal-600 transition-transform duration-300", isOpen && "rotate-180")}
                    />
                  </button>
                  <div className={cn("faq-body", isOpen && "open")}>
                    <div>
                      <p className="border-t border-slate-200 px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="landing-glass-strong relative overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(20,184,166,0.12),transparent_55%)]" />
            <div className="landing-divider absolute inset-x-8 top-0 sm:inset-x-14" />
            <SectionBadge className="relative mb-6">Get started today</SectionBadge>
            <h2 className="landing-section-title relative text-3xl font-extrabold sm:text-4xl md:text-5xl">
              Ready to automate your clinic?
            </h2>
            <p className="relative mx-auto mt-5 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              Join thousands of practices saving admin hours every week. Go live in under five minutes — no developer required.
            </p>
            <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/auth"
                className="landing-btn-primary btn-shine inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-9 py-4 text-sm font-bold text-white shadow-xl shadow-teal-600/20 transition hover:brightness-110"
              >
                Start free trial <ArrowRight size={16} />
              </a>
              <a
                href="mailto:hello@clinicsuite.in"
                className="landing-glass inline-flex items-center gap-2 rounded-2xl px-9 py-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300"
              >
                Talk to sales <ArrowUpRight size={16} className="text-teal-600" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-slate-200 bg-white/80 px-4 py-14 backdrop-blur-sm sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4 text-left">
          <div className="sm:col-span-2 space-y-3.5">
            <BrandLogo variant="full" href="/" size="lg" />
            <p className="max-w-xs text-xs leading-relaxed text-slate-500">
              AI-powered practice growth, patient communication, ratings autopilot, and reels marketing studio for modern Indian clinics.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Product</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-500">
              {["Features", "Pricing", "Case Studies"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-teal-400 transition">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-teal-600" />
                hello@clinicsuite.in
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={13} className="text-teal-600" />
                Mumbai, India
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-[11px] text-slate-600">
          <p>© 2026 ClinicSuite. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-teal-400 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-teal-400 transition">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
