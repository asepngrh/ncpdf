import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Tentang ncpdf",
  description: "Pelajari filosofi di balik ncpdf: tool PDF gratis, cepat, dan 100% mengutamakan privasi tanpa login dan tanpa watermark.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <div className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            Tentang ncpdf
          </h1>
          <p className="mt-3 text-base text-ink-muted leading-relaxed">
            Free PDF Tools yang dirancang untuk kecepatan, kemudahan, dan privasi tanpa kompromi.
          </p>
        </div>

        {/* Core Philosophy */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-ink">Filosofi "Client-First"</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Sebagian besar situs pengolah PDF di internet mewajibkan Anda mengunggah dokumen sensitif ke server mereka. Kami percaya bahwa dokumen pribadi, tugas kuliah, laporan keuangan, dan kontrak kerja Anda tidak seharusnya berada di server pihak ketiga.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            <strong>ncpdf</strong> dibangun dengan prinsip <em>Client-First</em>. Dari 22 alat yang kami sediakan, 16 alat beroperasi 100% di dalam browser Anda menggunakan teknologi WebAssembly, JavaScript modern, dan engine <code className="font-mono text-xs bg-paper-muted px-1.5 py-0.5 rounded border border-rule">pdf-lib</code> serta <code className="font-mono text-xs bg-paper-muted px-1.5 py-0.5 rounded border border-rule">pdfjs-dist</code>.
          </p>
        </section>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 bg-surface border border-rule rounded-lg space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <h3 className="font-serif text-base text-ink font-medium">Privasi Sejati</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Dokumen pada alat client-side tidak pernah meninggalkan perangkat Anda. Tidak ada data yang kami simpan atau intip.
            </p>
          </div>

          <div className="p-5 bg-surface border border-rule rounded-lg space-y-2">
            <Cpu className="w-6 h-6 text-accent" />
            <h3 className="font-serif text-base text-ink font-medium">Cepat & Ringan</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Tanpa waktu tunggu antrean upload/download server. Pemrosesan dilakukan secepat kekuatan perangkat keras Anda.
            </p>
          </div>

          <div className="p-5 bg-surface border border-rule rounded-lg space-y-2">
            <Sparkles className="w-6 h-6 text-orange-600" />
            <h3 className="font-serif text-base text-ink font-medium">Tanpa Batas</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              100% gratis, tanpa watermark, tanpa perlu membuat akun, dan tanpa batasan jumlah penggunaan harian.
            </p>
          </div>
        </div>

        {/* Zero-Retention Server Architecture */}
        <section className="space-y-4 pt-4 border-t border-rule">
          <h2 className="font-serif text-2xl text-ink">Bagaimana dengan Konversi Office?</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Untuk konversi dokumen Microsoft Office (Word, Excel, PowerPoint) yang membutuhkan LibreOffice engine, kami menggunakan microservice terisolasi berbasis <strong>Gotenberg</strong>.
          </p>
          <div className="p-4 bg-paper-muted border border-rule rounded space-y-2 text-xs text-ink-muted">
            <div className="flex items-center gap-2 font-medium text-ink">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Prinsip Zero-Retention Server:</span>
            </div>
            <p>
              File Anda hanya dialirkan secara terenkripsi (HTTPS/TLS) ke memori server untuk dikonversi secara instan, dan langsung dibuang segera setelah output dihasilkan. Kami tidak memiliki database penyimpanan dokumen.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
