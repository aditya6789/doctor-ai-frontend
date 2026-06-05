"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language } from "./translations";

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app_language") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "de")) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language];
    if (dict && key in dict) {
      return dict[key];
    }
    return fallback ?? key;
  };

  // Prevent hydration mismatches by rendering a loading or simple fallback shell
  // but since we want standard SSR structure, we can just return the provider.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
