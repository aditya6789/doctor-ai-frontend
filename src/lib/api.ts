import axios, { AxiosError, Method } from "axios";

/** Public API origin (no trailing slash). Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.clinicsuite.cloud";

  // process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";


const API_BASE = API_BASE_URL.replace(/\/+$/, "");
const TOKEN_KEY = "access_token";
const LEGACY_TOKEN_KEY = "token";
const USER_KEY = "user";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function setAuthSession(token: string, user?: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ detail?: string }>) => {
    if (err?.response?.status === 401) {
      clearAuthSession();
      if (typeof window !== "undefined") window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

export async function apiCall(endpoint: string, method: Method = "GET", body: unknown = null) {
  try {
    const response = await api.request({
      url: endpoint,
      method,
      data: body ?? undefined,
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ detail?: string | unknown[] | Record<string, unknown> }>;
    const raw = err.response?.data?.detail;
    let detailMsg: string | undefined;
    if (typeof raw === "string") detailMsg = raw;
    else if (Array.isArray(raw)) {
      detailMsg = raw
        .map((item) => {
          if (typeof item === "object" && item !== null && "msg" in item) {
            return String((item as { msg?: string }).msg ?? "");
          }
          return typeof item === "string" ? item : JSON.stringify(item);
        })
        .filter(Boolean)
        .join("; ");
    } else if (typeof raw === "object" && raw !== null) {
      const o = raw as { message?: string; error?: string };
      detailMsg = o.message || o.error || JSON.stringify(raw);
    }
    throw new Error(detailMsg || err.message || "Request failed");
  }
}

export type PreferredLanguage = "hi" | "en" | "hinglish";

export interface ChatOutgoingMessage {
  role: "user" | "assistant";
  content: string;
}

export interface EstimatePdfLine {
  label: string;
  amount_display: string;
  amount_inr: number | null;
}

export interface EstimatePdfRequest {
  title: string;
  patient_label?: string;
  footer_notes?: string;
  lines: EstimatePdfLine[];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

export type ChatbotPosition = "left" | "right";

/** GET /chatbot/customization — includes read-only resolved display names for PDF + LLM. */
export interface ChatbotCustomizationResponse {
  bot_name?: string | null;
  welcome_message?: string | null;
  primary_color?: string | null;
  icon_url?: string | null;
  launcher_text?: string | null;
  position?: ChatbotPosition | null;
  clinic_name?: string | null;
  doctor_name?: string | null;
  clinic_address?: string | null;
  clinic_phone?: string | null;
  clinic_display_name?: string | null;
  doctor_display_name?: string | null;
  website_url?: string | null;
  knowledge_additional?: string | null;
  clinical_focus?: string | null;
  scope_strict?: boolean | null;
  off_topic_keywords?: string | null;
  scrape_extra_urls?: string[] | null;
  last_scrape_at?: string | null;
  last_scrape_error?: string | null;
  scraped_content_preview_chars?: number | null;
  /** Legacy alias some builds may still return */
  welcome_text?: string | null;
  secondary_color?: string | null;
}

/** PUT /chatbot/customization — send any subset; strings are trimmed client-side before save. */
export type ChatbotCustomizationUpdate = Partial<{
  bot_name: string;
  welcome_message: string;
  primary_color: string;
  icon_url: string;
  launcher_text: string;
  position: ChatbotPosition;
  clinic_name: string;
  doctor_name: string;
  clinic_address: string;
  clinic_phone: string;
  website_url: string;
  knowledge_additional: string;
  clinical_focus: string;
  scope_strict: boolean;
  off_topic_keywords: string;
  scrape_extra_urls: string[];
}>;

export interface ChatbotCustomizationPutResponse {
  status: string;
  customization: ChatbotCustomizationResponse;
}

export interface ScrapeKnowledgeRequest {
  url?: string;
  extra_urls?: string[];
}

export interface ScrapePageResult {
  url: string;
  ok: boolean;
  final_url?: string;
  chars?: number;
}

export interface EmbedWidgetKeyListItem {
  id: number;
  label: string;
  key_prefix: string;
  is_active: boolean;
  created_at?: string;
  last_used_at?: string;
  revoked_at?: string;
}


export interface ScrapeKnowledgeResponse {
  status: string;
  final_url?: string;
  extracted_chars?: number;
  website_url?: string;
  pages?: ScrapePageResult[];
}

/** GET /public/chatbot/config — embed widget (no auth; x-widget-key header). */
export interface PublicChatbotConfig {
  bot_name?: string;
  welcome_message?: string;
  primary_color?: string;
  icon_url?: string;
  launcher_text?: string;
  position?: ChatbotPosition;
  clinic_name?: string;
  clinical_focus?: string;
  has_knowledge_base?: boolean;
  scope_strict?: boolean;
  off_topic_keywords_configured?: boolean;
  scrape_extra_url_count?: number;
  embed_booking_owner_configured?: boolean;
  embed_booking_owner_user_id?: string;
  estimate_pdf_signature_configured?: boolean;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const body = new URLSearchParams();
    body.append("username", credentials.email);
    body.append("password", credentials.password);

    try {
      const response = await api.post("/auth/login", body.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ detail?: string }>;
      throw new Error(err.response?.data?.detail || "Invalid email or password");
    }
  },
  register: (data: unknown) => apiCall("/auth/register", "POST", data),
  me: () => apiCall("/auth/me"),
  /**
   * Google OAuth start URL. Always pass current frontend origin as `return_url`
   * so the API can redirect back to `/auth/callback` on the correct host (local vs Vercel).
   */
  getGoogleLoginUrl: () => {
    const path = "/auth/login/google";
    if (typeof window === "undefined") return `${API_BASE}${path}`;
    const returnUrl = encodeURIComponent(window.location.origin);
    return `${API_BASE}${path}?return_url=${returnUrl}`;
  },
  getFacebookLoginUrl: () => `${API_BASE}/auth/login/facebook`,
};

export const chatApi = {
  send: (params: {
    messages: ChatOutgoingMessage[];
    session_id?: string;
    preferred_language?: PreferredLanguage;
  }) => {
    const body: Record<string, unknown> = { messages: params.messages };
    if (params.session_id) body.session_id = params.session_id;
    if (params.preferred_language) body.preferred_language = params.preferred_language;
    return apiCall("/chat", "POST", body);
  },
  stt: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "voice.wav");
    const response = await api.post("/stt", formData);
    return response.data;
  },
};

export interface GeneratedVideoEntry {
  id: string;
  topic: string;
  file_path: string;
  playback_path: string;
  youtube_video_id?: string | null;
  youtube_url?: string | null;
  youtube_title?: string | null;
  youtube_description?: string | null;
  youtube_tags?: string[];
  youtube_privacy?: string | null;
  published_youtube: boolean;
  scheduled_publish_time?: string | null;
  publish_status?: string | null;
  publish_platform?: string | null;
  publish_error?: string | null;
  created_at?: string | null;
}

export interface VideoGenerateResponse {
  video: string;
  generated_video_id: string;
  library_entry: GeneratedVideoEntry;
}

export interface YoutubeVideoInsights {
  youtube_video_id: string;
  youtube_url?: string | null;
  statistics: { views: number; likes: number; comments_count: number };
  comments: { author: string; text: string; like_count: number }[];
  youtube_snippet?: {
    title?: string;
    description?: string;
    published_at?: string;
    tags?: string[];
  };
  recommendations: {
    suggested_hashtags: string[];
    title_improvements: string;
    description_improvements: string;
    content_changes: string[];
    posting_tips: string[];
    ai_available?: boolean;
  };
}

export function videoPlaybackUrl(playbackPath: string) {
  const normalized = playbackPath.replace(/\\/g, "/");
  const path = normalized.startsWith("output/") ? normalized : `output/${normalized.split("/").pop()}`;
  return `${API_BASE_URL}/${path}`;
}

export const videoApi = {
  list: () => apiCall("/videos", "GET") as Promise<{ videos: GeneratedVideoEntry[] }>,
  get: (id: string) => apiCall(`/videos/${id}`, "GET") as Promise<{ video: GeneratedVideoEntry }>,
  generate: (topic: string) =>
    apiCall("/generate-video", "POST", { topic }) as Promise<VideoGenerateResponse>,
  getYoutubeInsights: (id: string) =>
    apiCall(`/videos/${id}/youtube-insights`, "GET") as Promise<YoutubeVideoInsights>,
  publishToYouTube: (data: {
    video_path?: string;
    generated_video_id?: string;
    title: string;
    description?: string;
    tags?: string[];
    privacy_status?: "private" | "public" | "unlisted";
  }) => apiCall("/publish/youtube", "POST", data),
  publishToInstagram: (data: {
    video_url: string;
    caption?: string;
    share_to_feed?: boolean;
  }) => apiCall("/publish/instagram", "POST", data),
  scheduleVideo: (
    id: string,
    data: {
      scheduled_time: string;
      platform: string;
      title: string;
      description?: string;
      privacy_status?: string;
    }
  ) => apiCall(`/videos/${id}/schedule`, "POST", data),
  getAnalytics: () => apiCall("/videos/analytics", "GET"),
};

export type ContentPackPayload = Record<string, unknown>;

export interface ContentPackSummary {
  id: string;
  topic: string;
  language: string;
  created_at?: string | null;
}

export interface ContentPackDetail {
  id: string;
  topic: string;
  language: string;
  created_at?: string | null;
  pack: ContentPackPayload;
}

export const contentEngineApi = {
  generate: (data: { topic: string; language?: string; save?: boolean }) =>
    apiCall("/content-engine/generate", "POST", data) as Promise<{
      pack_id: string | null;
      pack: ContentPackPayload;
    }>,
  listPacks: () =>
    apiCall("/content-engine/packs", "GET") as Promise<{ packs: ContentPackSummary[] }>,
  getPack: (id: string) => apiCall(`/content-engine/packs/${id}`, "GET") as Promise<ContentPackDetail>,
};

/** Per-provider review integration status (Google Business / Meta). */
export interface ReviewProviderStatus {
  connected: boolean;
  configured: boolean;
  email: string | null;
  account_id: string | null;
  location_id: string | null;
  page_id: string | null;
  page_name: string | null;
}

export interface ReviewIntegrationsSummary {
  google_business: ReviewProviderStatus;
  meta_facebook: ReviewProviderStatus;
  legacy_env_google?: boolean;
  legacy_env_meta?: boolean;
  dev_mock_google?: boolean;
}

export interface GoogleBusinessLocation {
  account_id: string;
  location_id: string;
  title?: string;
  resource_name?: string;
}

export interface MetaReviewPage {
  id: string;
  name: string;
}

export interface ReviewAuthorV1 {
  display_name?: string;
  profile_photo_url?: string;
  is_anonymous?: boolean;
}

export interface ReviewItemV1 {
  id: string;
  provider: "google" | "meta";
  provider_review_id: string;
  author: ReviewAuthorV1 | string;
  rating: number;
  content: string;
  reply?: { content: string; update_time?: string } | null;
  create_time?: string;
  update_time?: string | null;
  language?: string | null;
  location_id?: string | null;
}

export interface ReviewsV1Response {
  data: ReviewItemV1[];
  pagination?: {
    page_size?: number;
    next_page_token?: string | null;
    total_count?: number | null;
    has_more?: boolean;
  };
  meta?: {
    provider?: string;
    display_name?: string;
    fetched_at?: string;
    average_rating?: number;
    total_review_count?: number;
    cache_hit?: boolean;
  };
}

export interface LegacyReview {
  id?: string;
  source: string;
  author: string;
  avatar?: string;
  rating: number;
  content: string;
  timestamp: string;
}

function openOAuthPopup(path: string, name: string) {
  const token = getToken();
  const connectUrl = `${API_BASE}${path}?token=${encodeURIComponent(token || "")}`;
  const w = 520;
  const h = 640;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  const popup = window.open(
    connectUrl,
    name,
    `width=${w},height=${h},left=${left},top=${top}`
  );
  if (!popup) throw new Error("Popup blocked. Please allow popups and try again.");
  return popup;
}

export const reviewIntegrationsApi = {
  getIntegrations: () =>
    apiCall("/auth/reviews/integrations", "GET") as Promise<ReviewIntegrationsSummary>,

  getGoogleStatus: () =>
    apiCall("/auth/reviews/google/status", "GET") as Promise<ReviewProviderStatus>,

  getMetaStatus: () =>
    apiCall("/auth/reviews/meta/status", "GET") as Promise<ReviewProviderStatus>,

  connectGooglePopup: () => openOAuthPopup("/auth/reviews/google/connect", "review-google-oauth"),

  connectMetaPopup: () => openOAuthPopup("/auth/reviews/meta/connect", "review-meta-oauth"),

  disconnectGoogle: () => apiCall("/auth/reviews/google/disconnect", "DELETE"),

  disconnectMeta: () => apiCall("/auth/reviews/meta/disconnect", "DELETE"),

  getGoogleLocations: () =>
    apiCall("/auth/reviews/google/locations", "GET") as Promise<{ locations: GoogleBusinessLocation[] }>,

  saveGoogleConfig: (account_id: string, location_id: string) =>
    apiCall("/auth/reviews/google/config", "PUT", { account_id, location_id }) as Promise<ReviewProviderStatus>,

  getMetaPages: async () => {
    const res = await api.get<{ pages: MetaReviewPage[] }>("/auth/reviews/meta/pages", {
      withCredentials: true,
    });
    return res.data;
  },

  saveMetaConfig: (page_id: string, page_name: string) =>
    apiCall("/auth/reviews/meta/config", "PUT", { page_id, page_name }) as Promise<ReviewProviderStatus>,
};

export const reviewApi = {
  /** Legacy merged list (Google + Meta). */
  getLegacy: () => apiCall("/reviews", "GET") as Promise<{ reviews: LegacyReview[] }>,

  getGoogle: (params?: {
    page_size?: number;
    page_token?: string;
    force_refresh?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.page_token) q.set("page_token", params.page_token);
    if (params?.force_refresh) q.set("force_refresh", "true");
    const qs = q.toString();
    return apiCall(`/api/v1/reviews/google${qs ? `?${qs}` : ""}`, "GET") as Promise<ReviewsV1Response>;
  },

  getMeta: (params?: { page_size?: number; page_token?: string; force_refresh?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.page_token) q.set("page_token", params.page_token);
    if (params?.force_refresh) q.set("force_refresh", "true");
    const qs = q.toString();
    return apiCall(`/api/v1/reviews/meta${qs ? `?${qs}` : ""}`, "GET") as Promise<ReviewsV1Response>;
  },

  getProviders: () => apiCall("/api/v1/reviews/providers", "GET"),

  replyGoogle: (reviewId: string, content: string) =>
    apiCall(`/api/v1/reviews/google/${encodeURIComponent(reviewId)}/reply`, "POST", { content }),

  replyMeta: (reviewId: string, content: string) =>
    apiCall(`/api/v1/reviews/meta/${encodeURIComponent(reviewId)}/reply`, "POST", { content }),

  googleAutoReply: (body?: { dry_run?: boolean; max_reviews?: number }) =>
    apiCall("/reviews/google/auto-reply", "POST", body ?? {}),

  invalidateCache: (provider?: "google" | "meta") => {
    const q = provider ? `?provider=${provider}` : "";
    return apiCall(`/api/v1/reviews/cache/invalidate${q}`, "POST");
  },
};

export const bookingApi = {
  getCalendarStatus: () => apiCall("/auth/calendar/google/status"),
  connectGoogleCalendarPopup: () => {
    const token = getToken();
    const connectUrl = `${API_BASE}/auth/calendar/google/connect?token=${encodeURIComponent(token || "")}`;
    const popup = window.open(
      connectUrl,
      "google-calendar-connect",
      "width=520,height=700"
    );
    if (!popup) throw new Error("Popup blocked. Please allow popups and try again.");
    return popup;
  },
  disconnectGoogleCalendar: () => apiCall("/auth/calendar/google/disconnect", "DELETE"),
  getSlots: (date: string) => apiCall(`/booking/slots?date=${date}`),
  book: (data: { date: string; time_slot: string }) => apiCall("/booking/book", "POST", data),
  getMyAppointments: () => apiCall("/booking/my-appointments"),
  getClinicAppointments: (params?: { date?: string; month?: string; include_cancelled?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.date) q.set("date", params.date);
    if (params?.month) q.set("month", params.month);
    if (params?.include_cancelled) q.set("include_cancelled", "true");
    const qs = q.toString();
    return apiCall(`/booking/clinic-appointments${qs ? `?${qs}` : ""}`) as Promise<{
      appointments: ClinicAppointment[];
    }>;
  },
  cancelClinicAppointment: (appointment_id: number) =>
    apiCall("/booking/clinic-cancel", "POST", { appointment_id }),
  cancelBooking: (appointment_id: number) =>
    apiCall("/booking/cancel", "POST", { appointment_id }),
};

export interface ClinicAppointment {
  appointment_id: number;
  date: string;
  time_slot: string;
  patient_name?: string;
  patient_email?: string;
  status?: string;
  user_id?: string;
}

export const youtubeApi = {
  getStatus: () => apiCall("/auth/youtube/status"),
  connectPopup: () => {
    const token = getToken();
    const connectUrl = `${API_BASE}/auth/youtube/connect?token=${encodeURIComponent(token || "")}`;
    const popup = window.open(connectUrl, "youtube-connect", "width=520,height=700");
    if (!popup) throw new Error("Popup blocked. Please allow popups and try again.");
    return popup;
  },
  disconnect: () => apiCall("/auth/youtube/disconnect", "DELETE"),
};

export const chatbotApi = {
  getSignatureStatus: () =>
    apiCall("/chatbot/signature", "GET") as Promise<{ configured: boolean }>,

  uploadSignature: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post<{ status?: string; configured?: boolean }>("/chatbot/signature", fd);
    return res.data;
  },

  getCustomization: () =>
    apiCall("/chatbot/customization", "GET") as Promise<ChatbotCustomizationResponse>,

  putCustomization: async (data: ChatbotCustomizationUpdate) => {
    const res = (await apiCall("/chatbot/customization", "PUT", data)) as
      | ChatbotCustomizationPutResponse
      | ChatbotCustomizationResponse;
    if (res && typeof res === "object" && "customization" in res && res.customization) {
      return res.customization;
    }
    return res as ChatbotCustomizationResponse;
  },

  scrapeKnowledge: (body: ScrapeKnowledgeRequest = {}) =>
    apiCall("/chatbot/knowledge/scrape", "POST", body) as Promise<ScrapeKnowledgeResponse>,

  listEmbedKeys: () =>
    apiCall("/chatbot/embed-keys", "GET") as Promise<{
      keys: EmbedWidgetKeyListItem[];
      active_count: number;
      max_active: number;
    }>,

  createEmbedKey: (label = "Website") =>
    apiCall("/chatbot/embed-keys", "POST", { label }) as Promise<{
      widget_key: string;
      embed_script_example: string;
      message?: string;
    }>,

  revokeEmbedKey: (keyId: number) => apiCall(`/chatbot/embed-keys/${keyId}`, "DELETE"),

  getPublicConfig: (widgetKey: string) =>
    api
      .get<PublicChatbotConfig>("/public/chatbot/config", {
        headers: { "x-widget-key": widgetKey },
      })
      .then((r) => r.data),

  /** Logged-in clinic user: generates PDF (embeds uploaded signature when configured). */
  downloadEstimatePdf: async (body: EstimatePdfRequest, filename = "treatment-estimate.pdf") => {
    const res = await api.post<Blob>("/chatbot/estimate-pdf", body, { responseType: "blob" });
    const blob = res.data;
    if (blob.type?.includes("application/json")) {
      const text = await blob.text();
      let msg = "Could not generate PDF.";
      try {
        const j = JSON.parse(text) as { detail?: string | unknown[] };
        if (typeof j.detail === "string") msg = j.detail;
      } catch {
        /* keep default */
      }
      throw new Error(msg);
    }
    downloadBlob(blob, filename);
  },
};

export interface PrescriptionRequestItem {
  id: string;
  patient_name: string;
  patient_email: string;
  symptoms: string;
  status: "pending" | "sent";
  prescription_text?: string | null;
  created_at?: string | null;
}

export const prescriptionApi = {
  requestPrescriptionPublic: (
    widgetKey: string,
    data: { patient_name: string; patient_email: string; symptoms: string }
  ) => {
    return api.post<{ status: string; request_id: string }>(
      "/public/prescription/request",
      data,
      { headers: { "x-widget-key": widgetKey } }
    ).then((r) => r.data);
  },

  requestPrescription: (data: { patient_name: string; patient_email: string; symptoms: string }) =>
    apiCall("/booking/prescription-request", "POST", data) as Promise<{ status: string; request_id: string }>,

  getPrescriptionRequests: () =>
    apiCall("/prescription/requests", "GET") as Promise<{
      requests: PrescriptionRequestItem[];
    }>,

  sendPrescription: (id: string, prescriptionText: string) =>
    apiCall(`/prescription/requests/${id}/send`, "POST", {
      prescription_text: prescriptionText,
    }) as Promise<{ status: string; email_sent: boolean }>,

  createAndSendPrescription: (data: {
    patient_name: string;
    patient_email: string;
    symptoms: string;
    prescription_text: string;
  }) =>
    apiCall("/prescription/create-and-send", "POST", data) as Promise<{
      status: string;
      email_sent: boolean;
    }>,
};
