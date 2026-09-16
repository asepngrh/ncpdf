"use client";

import React from "react";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper backdrop-blur-md transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-tight text-ink hover:text-accent transition-colors inline-flex items-center gap-2 group leading-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/immich-maintenance.webp"
            alt="ncpdf logo"
            className="w-5 h-5 object-contain shrink-0 transition-transform group-hover:scale-105"
          />
          <span className="leading-none inline-block">ncpdf</span>
        </Link>

        {/* Right Controls: Language & Dark/Light Mode Theme */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
