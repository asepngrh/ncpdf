"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { lang } = useLanguage();

  const isId = lang === "id";

  return (
    <footer className="w-full border-t border-rule bg-paper py-10 mt-16 text-xs text-ink-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-2">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/#compress" className="hover:text-ink transition-colors">
              {isId ? "Alat PDF" : "Tools"}
            </Link>
            <Link href="/about" className="hover:text-ink transition-colors">
              {isId ? "Tentang" : "About"}
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              {isId ? "Kontak" : "Contact"}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-ink transition-colors">
              {isId ? "Kebijakan Privasi" : "Privacy Policy"}
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors">
              {isId ? "Syarat & Ketentuan" : "Terms of Service"}
            </Link>
            <Link href="/disclaimer" className="hover:text-ink transition-colors">
              {isId ? "Sanggahan (Disclaimer)" : "Disclaimer"}
            </Link>
          </div>
        </div>

        {/* Bottom Credits & Tagline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-rule/60 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} ncpdf</span>
            <span className="text-rule">•</span>
            <a
              href="https://v1nicoopedia.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              by.nicoo
            </a>
          </div>
          <span className="font-mono text-[10px] text-ink-muted/80">
            {isId
              ? "Pemrosesan PDF client-first • Tanpa penyimpanan file permanen"
              : "Client-first PDF processing • No permanent file storage"}
          </span>
        </div>
      </div>
    </footer>
  );
}
