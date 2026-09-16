"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, TRANSLATIONS, TOOLS_TRANSLATIONS, ToolTranslation } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.id, params?: Record<string, string | number>) => string;
  getToolTranslation: (slug: string, fallbackTitle?: string, fallbackDesc?: string) => ToolTranslation;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => TRANSLATIONS.en[key] || String(key),
  getToolTranslation: (slug, fallbackTitle = "", fallbackDesc = "") => ({
    title: fallbackTitle,
    description: fallbackDesc,
  }),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check localStorage first
    try {
      const stored = localStorage.getItem("ncpdf_lang");
      if (stored === "id" || stored === "en") {
        setLangState(stored);
        setMounted(true);
        return;
      }
    } catch {
      // Ignore storage errors
    }

    // 2. Auto-detect from user device / browser locale
    try {
      if (typeof navigator !== "undefined") {
        const browserLang = (
          navigator.language ||
          (navigator.languages && navigator.languages[0]) ||
          (navigator as any).userLanguage ||
          ""
        ).toLowerCase();

        if (browserLang.startsWith("id")) {
          setLangState("id");
          setMounted(true);
          return;
        }
      }
    } catch {
      // Ignore navigator errors
    }

    // Default worldwide to English
    setLangState("en");
    setMounted(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("ncpdf_lang", newLang);
    } catch {
      // Ignore storage errors
    }
  };

  const t = (key: keyof typeof TRANSLATIONS.id, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || String(key);

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
      });
    }

    return text;
  };

  const getToolTranslation = (slug: string, fallbackTitle = "", fallbackDesc = ""): ToolTranslation => {
    const item = TOOLS_TRANSLATIONS[slug];
    if (item && item[lang]) {
      return item[lang];
    }
    return {
      title: fallbackTitle,
      description: fallbackDesc,
    };
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getToolTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
