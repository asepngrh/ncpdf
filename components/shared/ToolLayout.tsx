"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface ToolLayoutProps {
  title: string;
  description: string;
  category?: "Compress" | "Organize" | "Convert" | "Edit" | string;
  badgeText?: string;
  isClientSide?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}

export function ToolLayout({
  title,
  description,
  category,
  badgeText,
  isClientSide = true,
  wide = false,
  children,
}: ToolLayoutProps) {
  const { t } = useLanguage();
  const cat = category || (badgeText === "Server-Assisted" ? "Convert" : "Tools");

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-accent-soft selection:text-ink">
      <Navbar />

      <main
        className={`flex-1 w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all ${
          wide ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        {/* Breadcrumb Navigation (Mobile Friendly Wrapping) */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted mb-4 sm:mb-6">
          <Link href="/" className="hover:text-ink transition-colors">
            {t("breadcrumbHome") || "Home"}
          </Link>
          <span className="text-rule">/</span>
          <Link
            href={`/#${cat.toLowerCase()}`}
            className="hover:text-ink transition-colors"
          >
            {cat}
          </Link>
          <span className="text-rule">/</span>
          <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-none">
            {title}
          </span>
        </nav>

        {/* Tool Header */}
        <div className="mb-6 sm:mb-8 space-y-1 sm:space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-ink">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tool Workspace Area */}
        <div className="w-full">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
