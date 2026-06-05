"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AtSign,
  BookOpen,
  Briefcase,
  Copy,
  Film,
  Hash,
  Image,
  Layers,
  Loader2,
  MessageSquare,
  Play,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { DashAlert } from "@/components/layout/DashboardPrimitives";
import {
  contentEngineApi,
  type ContentPackPayload,
  type ContentPackSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const panel = "dash-glass rounded-3xl border border-slate-200/50 shadow-sm";

const suggestions = [
  { key: "content.suggestion.hairfall", defaultVal: "Hair fall treatment" },
  { key: "content.suggestion.diabetes", defaultVal: "Diabetes diet tips" },
  { key: "content.suggestion.backpain", defaultVal: "Back pain exercises" },
  { key: "content.suggestion.hearthealth", defaultVal: "Heart health checkup" },
  { key: "content.suggestion.skinallergy", defaultVal: "Skin allergy care" },
];

const languages = [
  { id: "hinglish", label: "Hinglish" },
  { id: "hindi", label: "Hindi" },
  { id: "english", label: "English" },
  { id: "german", label: "German" },
] as const;

type TabId =
  | "reel"
  | "shorts"
  | "blog"
  | "instagram"
  | "youtube"
  | "facebook"
  | "hashtags"
  | "carousel"
  | "thumbnails"
  | "twitter"
  | "linkedin";

const tabs: { id: TabId; label: string; icon: typeof Play }[] = [
  { id: "reel", label: "Reel script", icon: Play },
  { id: "shorts", label: "Shorts", icon: Film },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "instagram", label: "Instagram", icon: MessageSquare },
  { id: "youtube", label: "YouTube", icon: Play },
  { id: "facebook", label: "Facebook", icon: MessageSquare },
  { id: "hashtags", label: "Hashtags", icon: Hash },
  { id: "carousel", label: "Carousel", icon: Layers },
  { id: "thumbnails", label: "Thumbnails", icon: Image },
  { id: "twitter", label: "Twitter", icon: AtSign },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase },
];

function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const { t } = useLanguage();
  if (!text.trim()) return null;
  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
        <button
          type="button"
          onClick={() => copyText(text)}
          className="inline-flex items-center gap-1 rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100/80 transition-all active:scale-95 shadow-sm"
        >
          <Copy size={11} />
          {t("content.copyButton", "Copy Content")}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium select-text">{text}</p>
    </div>
  );
}

function PackSkeleton() {
  return (
    <div className="space-y-3 animate-pulse p-6">
      <div className="h-4 w-1/3 rounded bg-slate-200" />
      <div className="h-24 rounded-xl bg-slate-200/80" />
      <div className="h-24 rounded-xl bg-slate-200/80" />
    </div>
  );
}

function renderTabContent(tab: TabId, pack: ContentPackPayload) {
  const reel = pack.reel_script as Record<string, unknown> | undefined;
  const shorts = pack.shorts_script as Record<string, unknown> | undefined;
  const blog = pack.blog as Record<string, unknown> | undefined;
  const carousel = pack.carousel as { slides?: { title?: string; body?: string }[] } | undefined;

  switch (tab) {
    case "reel":
      return (
        <div className="space-y-3">
          <CopyBlock label="Hook" text={str(reel?.hook)} />
          {(Array.isArray(reel?.segments) ? reel.segments : []).map((seg, i) => (
            <CopyBlock key={i} label={`Segment ${i + 1}`} text={str(seg)} />
          ))}
          <CopyBlock label="CTA" text={str(reel?.cta)} />
        </div>
      );
    case "shorts":
      return (
        <div className="space-y-3">
          <CopyBlock label="Hook" text={str(shorts?.hook)} />
          <CopyBlock label="Body" text={str(shorts?.body)} />
          <CopyBlock label="CTA" text={str(shorts?.cta)} />
        </div>
      );
    case "blog": {
      const sections = Array.isArray(blog?.sections) ? blog.sections : [];
      return (
        <div className="space-y-3">
          <CopyBlock label="Title" text={str(blog?.title)} />
          <CopyBlock label="Meta description" text={str(blog?.meta_description)} />
          {sections.map((sec, i) => {
            const s = sec as Record<string, unknown>;
            return (
              <CopyBlock
                key={i}
                label={str(s.heading) || `Section ${i + 1}`}
                text={str(s.body)}
              />
            );
          })}
        </div>
      );
    }
    case "instagram":
      return <CopyBlock label="Caption" text={str(pack.instagram_caption)} />;
    case "youtube":
      return <CopyBlock label="Description" text={str(pack.youtube_description)} />;
    case "facebook":
      return <CopyBlock label="Post" text={str(pack.facebook_post)} />;
    case "hashtags": {
      const tags = Array.isArray(pack.hashtags) ? pack.hashtags.map(str).filter(Boolean) : [];
      return (
        <CopyBlock
          label="Hashtags"
          text={tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}
        />
      );
    }
    case "carousel": {
      const slides = carousel?.slides ?? [];
      return (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <CopyBlock
              key={i}
              label={slide.title || `Slide ${i + 1}`}
              text={[slide.title, slide.body].filter(Boolean).join("\n\n")}
            />
          ))}
        </div>
      );
    }
    case "thumbnails": {
      const ideas = Array.isArray(pack.thumbnail_ideas) ? pack.thumbnail_ideas.map(str) : [];
      return (
        <ul className="space-y-2">
          {ideas.map((idea, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800"
            >
              {idea}
            </li>
          ))}
        </ul>
      );
    }
    case "twitter": {
      const tweets = Array.isArray(pack.twitter_thread) ? pack.twitter_thread.map(str) : [];
      return (
        <div className="space-y-3">
          {tweets.map((t, i) => (
            <CopyBlock key={i} label={`Tweet ${i + 1}`} text={t} />
          ))}
        </div>
      );
    }
    case "linkedin":
      return <CopyBlock label="LinkedIn post" text={str(pack.linkedin_post)} />;
    default:
      return null;
  }
}

interface ContentEngineProps {
  onOpenVideoStudio?: (topic: string) => void;
}

export const ContentEngine = ({ onOpenVideoStudio }: ContentEngineProps) => {
  const { language: globalLanguage, t } = useLanguage();

  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<(typeof languages)[number]["id"]>("hinglish");
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<ContentPackPayload | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("reel");
  const [history, setHistory] = useState<ContentPackSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalLanguage === "hi") {
      setLanguage("hindi");
    } else if (globalLanguage === "de") {
      setLanguage("german");
    } else if (globalLanguage === "en") {
      setLanguage("english");
    }
  }, [globalLanguage]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await contentEngineApi.listPacks();
      setHistory(res.packs ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const generate = async () => {
    const tVal = topic.trim();
    if (!tVal) return;
    setLoading(true);
    setError(null);
    try {
      const res = await contentEngineApi.generate({ topic: tVal, language, save: true });
      setPack(res.pack);
      setMessage(t("content.packReady", "Content pack ready."));
      await loadHistory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("content.generationFailed", "Generation failed."));
    } finally {
      setLoading(false);
    }
  };

  const openPack = async (id: string) => {
    setError(null);
    try {
      const res = await contentEngineApi.getPack(id);
      setPack(res.pack);
      setTopic(res.topic);
      setLanguage(
        (languages.find((l) => l.id === res.language)?.id ?? "hinglish") as (typeof languages)[number]["id"]
      );
      setMessage(t("content.loadedHistory", "Loaded from history."));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("content.loadFailed", "Could not load pack."));
    }
  };

  const activeLabel = useMemo(() => t("content.tab." + activeTab, tabs.find((t) => t.id === activeTab)?.label ?? ""), [activeTab, t]);

  return (
    <div className="dash-animate-in w-full space-y-6">
      {error && <DashAlert variant="error">{error}</DashAlert>}
      {message && <DashAlert variant="success">{message}</DashAlert>}

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <section className={cn(panel, "p-5 sm:p-6")}>
            <label htmlFor="ce-topic" className="text-sm font-bold text-slate-800">
              {t("content.topicTitle", "Topic guidelines")}
            </label>
            <input
              id="ce-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("content.topicPlaceholder", "e.g. Hair fall treatments, diabetic diet guidelines, etc.")}
              className="mt-2.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-[15px] outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400 font-medium shadow-inner"
              onKeyDown={(e) => e.key === "Enter" && !loading && void generate()}
            />
            <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{t("content.presets", "Suggested presets")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => {
                const localizedPreset = t(s.key, s.defaultVal);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setTopic(localizedPreset)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-bold transition-all border",
                      topic.trim() === localizedPreset
                        ? "bg-teal-50 border-teal-200 text-teal-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-teal-300"
                    )}
                  >
                    {localizedPreset}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex flex-col gap-4 border-t border-slate-200/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex rounded-2xl bg-slate-100 border border-slate-200/50 p-1 shadow-inner">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-bold transition-all",
                      language === lang.id
                        ? "bg-white text-teal-700 shadow-md scale-[1.02]"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {t("language." + lang.id, lang.label)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {onOpenVideoStudio && pack && (
                  <button
                    type="button"
                    onClick={() => onOpenVideoStudio(topic.trim() || str(pack.topic))}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-teal-300 hover:text-teal-700 transition active:scale-95 shadow-sm"
                  >
                    <Film size={16} />
                    {t("video.title", "Video Studio")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={loading || !topic.trim()}
                  onClick={() => void generate()}
                  className="btn-shine inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t("content.generating", "Generating...")}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {t("content.generateButton", "Generate Pack")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          <div className={cn(panel, "overflow-hidden")}>
            <div className="flex flex-col lg:flex-row">
              <nav
                className="shrink-0 border-b border-slate-200/60 lg:w-52 lg:border-b-0 lg:border-r"
                aria-label="Content sections"
              >
                <p className="hidden px-4 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:block">
                  {t("content.outputTitle", "Output")}
                </p>
                <ul className="flex gap-0.5 overflow-x-auto px-2 py-2 lg:flex-col lg:overflow-visible lg:px-2 lg:pb-4">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <li key={id} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition-all hover:scale-[1.02] lg:text-[13.5px]",
                          activeTab === id
                            ? "bg-teal-50 border border-teal-100 text-teal-800 shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 border border-transparent"
                        )}
                      >
                        <Icon size={14} className="shrink-0 opacity-70" />
                        {t("content.tab." + id, label)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="min-w-0 flex-1">
                <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
                  <h3 className="text-sm font-bold text-slate-900">{activeLabel}</h3>
                  {!pack && !loading && (
                    <p className="text-xs text-slate-500">{t("content.enterTopicToSee", "Enter a topic and generate to see content.")}</p>
                  )}
                </div>
                <div className="min-h-[220px] p-4 sm:p-5">
                  {loading ? (
                    <PackSkeleton />
                  ) : pack ? (
                    renderTabContent(activeTab, pack)
                  ) : (
                    <p className="py-12 text-center text-sm text-slate-400">
                      {t("content.noContentYet", "No content yet — generate from a topic above.")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className={cn(panel, "flex max-h-[min(640px,75vh)] flex-col xl:sticky xl:top-4 xl:self-start")}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">{t("content.historyTitle", "Your packs")}</h3>
            <button
              type="button"
              onClick={() => void loadHistory()}
              disabled={historyLoading}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-600"
              aria-label="Refresh history"
            >
              <RefreshCcw size={14} className={cn(historyLoading && "animate-spin")} />
            </button>
          </div>
          <div className="dash-scrollbar flex-1 overflow-y-auto p-2">
            {historyLoading ? (
              <p className="px-2 py-6 text-center text-xs text-slate-400">{t("content.historyLoading", "Loading...")}</p>
            ) : history.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-slate-400">{t("content.noHistory", "Saved packs appear here.")}</p>
            ) : (
              <ul className="space-y-1">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void openPack(item.id)}
                      className="w-full rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-teal-200 hover:bg-white hover:shadow-sm"
                    >
                      <p className="truncate text-sm font-bold text-slate-800">{item.topic}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {item.language}
                        {item.created_at
                          ? ` · ${new Date(item.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}`
                          : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
