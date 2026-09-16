"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "id" as const, label: "Bahasa Indonesia", flag: "🇮🇩", short: "ID" },
    { code: "en" as const, label: "English", flag: "🇬🇧", short: "EN" },
  ];

  const currentLang = languages.find((l) => l.code === lang) || languages[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-surface text-ink text-xs font-medium transition-colors"
        aria-label="Pilih Bahasa / Select Language"
        title="Ganti Bahasa / Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-ink-muted" />
        <span className="font-mono text-[11px] font-semibold">{currentLang.short}</span>
        <ChevronDown className="w-3 h-3 text-ink-muted transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-lg bg-surface border border-rule shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-ink-muted font-semibold border-b border-rule">
            {lang === "id" ? "Pilih Bahasa" : "Select Language"}
          </div>
          {languages.map((l) => {
            const isSelected = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? "bg-accent-soft text-accent font-semibold"
                    : "text-ink hover:bg-paper"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{l.flag}</span>
                  <span>{l.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
