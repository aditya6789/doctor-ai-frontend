"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, clearAuthSession, setAuthSession } from "@/lib/api";

function getTokenFromHash() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const finalizeSession = async () => {
      const queryToken = searchParams.get("access_token");
      const hashToken = getTokenFromHash();
      const token = queryToken || hashToken;

      if (!token) {
        setError("Google login token missing in callback.");
        return;
      }

      // Strip token from address bar immediately (guide: avoid leaving JWT in URL).
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      try {
        setAuthSession(token);
        const me = await authApi.me();
        setAuthSession(token, me);
        router.replace("/dashboard");
      } catch {
        clearAuthSession();
        setError("Session verification failed. Please sign in again.");
      }
    };

    void finalizeSession();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Completing sign-in...</h1>
        <p className="text-slate-400">
          {error || "Please wait while we verify your Google session."}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Completing sign-in...</h1>
            <p className="text-slate-400">Loading…</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
