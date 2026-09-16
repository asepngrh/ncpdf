"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface text-ink transition-colors cursor-pointer"
      aria-label={theme === "dark" ? "Aktifkan Mode Terang (Light Mode)" : "Aktifkan Mode Gelap (Dark Mode)"}
      title={theme === "dark" ? "Mode Terang / Light Mode" : "Mode Gelap / Dark Mode"}
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-ink transition-transform duration-200 hover:-rotate-12" />
        )
      ) : (
        <span className="w-4 h-4" />
      )}
    </button>
  );
}
