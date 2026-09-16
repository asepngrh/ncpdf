import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-rule bg-paper py-8 mt-16 text-xs text-ink-muted">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span>&copy; {new Date().getFullYear()}</span>
          <a
            href="https://v1nicoopedia.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            by.nicoo
          </a>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/#compress" className="hover:text-ink transition-colors">
            Tools
          </Link>
          <span className="text-rule">/</span>
          <span>No files stored</span>
        </div>
      </div>
    </footer>
  );
}
