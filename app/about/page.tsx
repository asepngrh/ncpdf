"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutPage() {
  const { lang } = useLanguage();
  const isId = lang === "id";

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <div className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            {isId ? "Tentang ncpdf" : "About ncpdf"}
          </h1>
          <p className="mt-3 text-base text-ink-muted leading-relaxed">
            {isId
              ? "Free PDF Tools yang dirancang untuk kecepatan, kemudahan, dan privasi tanpa kompromi."
              : "Free PDF Tools engineered for blazing speed, simplicity, and uncompromising privacy."}
          </p>
        </div>

        {/* Core Philosophy */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-ink">
            {isId ? "Filosofi \"Client-First\"" : "\"Client-First\" Philosophy"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Sebagian besar situs pengolah PDF di internet mewajibkan Anda mengunggah dokumen sensitif ke server mereka. Kami percaya bahwa dokumen pribadi, tugas kuliah, laporan keuangan, dan kontrak kerja Anda tidak seharusnya berada di server pihak ketiga."
              : "Most online PDF utilities require you to upload confidential documents to third-party servers. We believe your private documents, academic assignments, financial statements, and business contracts should never leave your device."}
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId ? (
              <>
                <strong>ncpdf</strong> dibangun dengan prinsip <em>Client-First</em>. Dari 22 alat yang kami sediakan, mayoritas alat beroperasi 100% di dalam browser Anda menggunakan teknologi WebAssembly, JavaScript modern, dan engine <code className="font-mono text-xs bg-paper-muted px-1.5 py-0.5 rounded border border-rule">pdf-lib</code> serta <code className="font-mono text-xs bg-paper-muted px-1.5 py-0.5 rounded border border-rule">pdfjs-dist</code>.
              </>
            ) : (
              <>
                <strong>ncpdf</strong> is built on a strict <em>Client-First</em> foundation. The vast majority of our 22 tools operate 100% locally inside your web browser utilizing WebAssembly, modern JavaScript, and high-performance engines like <code className="font-mono text-xs bg-paper-muted px-1.5 py-0.5 rounded border border-rule">pdf-lib</code> and <code className="font-mono text-xs bg-paper-muted px-1.5 py-0.5 rounded border border-rule">pdfjs-dist</code>.
              </>
            )}
          </p>
        </section>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 bg-surface border border-rule rounded-lg space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <h3 className="font-serif text-base text-ink font-medium">
              {isId ? "Privasi Sejati" : "True Privacy"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isId
                ? "Dokumen pada alat client-side tidak pernah meninggalkan perangkat Anda. Tidak ada data yang disimpan atau diintip."
                : "Client-side tools never transmit your files over the network. Zero data stored or inspected."}
            </p>
          </div>

          <div className="p-5 bg-surface border border-rule rounded-lg space-y-2">
            <Cpu className="w-6 h-6 text-accent" />
            <h3 className="font-serif text-base text-ink font-medium">
              {isId ? "Cepat & Ringan" : "Fast & Lightweight"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isId
                ? "Tanpa waktu tunggu antrean server. Pemrosesan dilakukan secepat kekuatan perangkat keras Anda."
                : "No server upload or queue bottlenecks. Processing runs at the raw speed of your local hardware."}
            </p>
          </div>

          <div className="p-5 bg-surface border border-rule rounded-lg space-y-2">
            <Sparkles className="w-6 h-6 text-orange-600" />
            <h3 className="font-serif text-base text-ink font-medium">
              {isId ? "100% Gratis" : "100% Free"}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isId
                ? "Tanpa watermark, tanpa perlu membuat akun, dan tanpa batasan jumlah penggunaan harian."
                : "No watermarks, no account creation required, and no daily usage limits."}
            </p>
          </div>
        </div>

        {/* Zero-Retention Server Architecture */}
        <section className="space-y-4 pt-4 border-t border-rule">
          <h2 className="font-serif text-2xl text-ink">
            {isId ? "Bagaimana dengan Konversi Office?" : "What About Office Document Conversions?"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Untuk konversi dokumen Microsoft Office (Word, Excel, PowerPoint) yang membutuhkan LibreOffice engine, kami menggunakan microservice terisolasi berbasis Gotenberg."
              : "For Microsoft Office document conversions (Word, Excel, PowerPoint) requiring headless conversion engines, we utilize isolated Gotenberg microservices."}
          </p>
          <div className="p-4 bg-paper-muted border border-rule rounded space-y-2 text-xs text-ink-muted">
            <div className="flex items-center gap-2 font-medium text-ink">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{isId ? "Prinsip Zero-Retention Server:" : "Zero-Retention Server Commitment:"}</span>
            </div>
            <p>
              {isId
                ? "File Anda hanya dialirkan secara terenkripsi (HTTPS/TLS) ke memori server untuk dikonversi secara instan, dan langsung dibuang segera setelah output dihasilkan. Kami tidak memiliki database penyimpanan dokumen."
                : "Your files are streamed over encrypted HTTPS/TLS into transient RAM for instant conversion, and immediately purged as soon as delivery is complete. We maintain no persistent document storage database."}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
