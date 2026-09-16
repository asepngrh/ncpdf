import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">
            Error 404
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-ink font-normal">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
            Halaman atau alat PDF yang Anda cari tidak tersedia atau tautan telah berpindah.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button asChild variant="outline" className="text-xs">
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Kembali ke Indeks
            </Link>
          </Button>
          <Button asChild className="text-xs">
            <Link href="/">
              <Home className="w-3.5 h-3.5 mr-1.5" /> Beranda ncpdf
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
