"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { authApi, setAuthSession } from "@/lib/api";
import { useRouter } from "next/navigation";

/* ── brand features shown on left panel ── */
const features = [
  "Secure end-to-end encrypted health data",
  "Connect with 45+ certified specialists",
  "AI-powered health insights & reports",
  "One-click appointment booking",
];

export default function AuthPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
      return;
    }
    setCheckingSession(false);
  }, [router]);

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [key]: e.target.value }));
    setError("");
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm font-semibold text-slate-500">Checking session...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await authApi.login({ email: formData.email, password: formData.password });
        setAuthSession(data.access_token);
        const profile = await authApi.me();
        setAuthSession(data.access_token, profile);
        router.push("/dashboard");
      } else {
        await authApi.register(formData);
        setSuccess("Account created! Please sign in.");
        setFormData({ name: "", email: "", password: "" });
        setTimeout(() => { setIsLogin(true); setSuccess(""); }, 1800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((v) => !v);
    setError("");
    setSuccess("");
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="flex min-h-screen bg-background">

      {/* ══════════════════════════════════════════
          LEFT PANEL — branding
      ══════════════════════════════════════════ */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-teal-800 p-10 text-white lg:flex lg:w-[46%]">
        {/* blobs */}
        <div className="animate-blob pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-600/30 blur-3xl" />
        <div className="animate-blob-slow pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

        {/* logo */}
        <a href="/" className="relative z-10 flex items-center gap-2 w-max">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Heart size={18} fill="white" className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Medi<span className="text-teal-300">Care</span>
          </span>
        </a>

        {/* headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
              Healthcare Platform
            </p>
            <h2 className="text-4xl font-extrabold leading-tight xl:text-5xl">
              Your health journey,<br />powered by <span className="text-teal-300">AI</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-teal-100">
              Join thousands of patients and doctors who trust MediCare for smarter, faster, and more personal healthcare.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-teal-50">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-300" />
                {f}
              </li>
            ))}
          </ul>

          {/* testimonial */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-teal-50">
              &ldquo;MediCare changed how I manage my clinic. Bookings and patient follow-ups are fully automated now.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <img
                src="https://ui-avatars.com/api/?name=Dr+Arjun+Mehta&background=0d9488&color=fff"
                alt="Dr Arjun"
                className="h-9 w-9 rounded-full"
              />
              <div>
                <p className="text-sm font-bold">Dr. Arjun Mehta</p>
                <p className="text-xs text-teal-300">Cardiologist, Apollo Group</p>
              </div>
            </div>
          </div>
        </div>

        {/* bottom note */}
        <p className="relative z-10 text-xs text-teal-400">
          © 2025 MediCare Health. All rights reserved.
        </p>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — form
      ══════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-10">
        {/* back to home */}
        <a
          href="/"
          className="mb-8 flex items-center gap-1.5 self-start text-sm font-medium text-slate-500 transition hover:text-teal-600"
        >
          <ArrowLeft size={15} /> Back to Home
        </a>

        <div className="w-full max-w-[420px]">
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500">
              <Heart size={17} fill="white" className="text-white" />
            </div>
            <span className="text-xl font-extrabold">Medi<span className="text-teal-500">Care</span></span>
          </div>

          {/* heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isLogin ? "Welcome back 👋" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Sign in to access your health dashboard"
                : "Join MediCare and take control of your health"}
            </p>
          </div>

          {/* tab switcher */}
          <div className="mb-8 flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
            {(["Sign In", "Sign Up"] as const).map((label, i) => {
              const active = isLogin ? i === 0 : i === 1;
              return (
                <button
                  key={label}
                  onClick={() => { setIsLogin(i === 0); setError(""); setSuccess(""); setFormData({ name: "", email: "", password: "" }); }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-white text-teal-700 shadow-sm shadow-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* name (signup only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Dr. Aditya Paswan"
                    value={formData.name}
                    onChange={set("name")}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>
            )}

            {/* email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="doctor@medicare.ai"
                  value={formData.email}
                  onChange={set("email")}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            {/* password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                {isLogin && (
                  <button type="button" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={set("password")}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-teal-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* error / success */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
                <CheckCircle2 size={15} /> {success}
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-shine mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-teal-500 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isLogin ? (
                <><LogIn size={16} /> Sign In to Dashboard</>
              ) : (
                <><UserPlus size={16} /> Create My Account</>
              )}
            </button>
          </form>

          {/* divider */}
          {isLogin && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold text-slate-400">OR CONTINUE WITH</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* social buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { window.location.href = authApi.getGoogleLoginUrl(); }}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  {/* Google SVG */}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => { window.location.href = authApi.getFacebookLoginUrl(); }}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  {/* Facebook SVG */}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M18 9a9 9 0 1 0-10.406 8.894v-6.29H5.309V9h2.285V7.017c0-2.256 1.344-3.503 3.4-3.503.985 0 2.015.175 2.015.175v2.215h-1.136c-1.118 0-1.468.694-1.468 1.406V9h2.497l-.399 2.604h-2.098v6.29A9.003 9.003 0 0 0 18 9Z" fill="#1877F2"/>
                    <path d="m12.503 11.604.399-2.604H10.405V7.31c0-.712.35-1.406 1.468-1.406h1.136V3.689s-1.03-.175-2.016-.175c-2.055 0-3.399 1.247-3.399 3.503V9H5.31v2.604h2.285v6.29a9.069 9.069 0 0 0 2.812 0v-6.29h2.098Z" fill="#fff"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </>
          )}

          {/* switch mode */}
          <p className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={switchMode}
              className="font-bold text-teal-600 transition hover:text-teal-700 hover:underline"
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
