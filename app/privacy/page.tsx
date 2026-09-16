import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldAlert, Lock, Server } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Kebijakan Privasi",
  description: "Kebijakan privasi transparan ncpdf: Dokumen diproses langsung di browser Anda atau melalui server zero-retention tanpa penyimpanan permanen.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            Kebijakan Privasi
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Terakhir diperbarui: September 2026
          </p>
        </div>

        {/* Section 1: Client-Side */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-ink">
            <Lock className="w-5 h-5 text-emerald-700" />
            <h2 className="font-serif text-xl font-medium">1. Alat Client-Side (100% di Perangkat Anda)</h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Alat-alat berikut diproses sepenuhnya di browser Anda tanpa pernah mengunggah file Anda ke server internet mana pun:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-xs font-mono text-ink-muted bg-surface p-4 rounded border border-rule">
            <li>• Compress PDF & Resize KB/MB</li>
            <li>• Increase PDF Size</li>
            <li>• Merge & Split PDF</li>
            <li>• Rearrange, Delete, Extract Pages</li>
            <li>• Rotate PDF</li>
            <li>• Watermark PDF</li>
            <li>• Add Page Number & Image</li>
            <li>• Crop PDF & Highlight PDF</li>
            <li>• Sign PDF (Tanda Tangan)</li>
            <li>• PDF ke JPG / PNG</li>
          </ul>
          <p className="text-xs text-ink-muted">
            File Anda tetap berada di memori RAM perangkat lokal Anda dan hilang saat tab browser ditutup.
          </p>
        </section>

        {/* Section 2: Server-Assisted */}
        <section className="space-y-3 pt-4 border-t border-rule">
          <div className="flex items-center gap-2 text-ink">
            <Server className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-xl font-medium">2. Alat Konversi Server-Assisted (Zero Retention)</h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Untuk alat konversi Office (Word ke PDF, PDF ke Word, Excel ke PDF, PDF ke Excel, PowerPoint ke PDF), file Anda dikirim ke microservice Gotenberg melalui sambungan terenkripsi HTTPS.
          </p>
          <div className="p-4 bg-paper-muted border border-rule rounded text-xs text-ink-muted space-y-2">
            <p className="font-semibold text-ink">Komitmen Zero-Retention kami:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>File tidak pernah disimpan di disk penyimpanan database permanen.</li>
              <li>File hanya diproses sementara di RAM dan langsung dihapus otomatis begitu respon unduhan selesai dikirimkan ke Anda.</li>
              <li>Kami tidak menganalisis, membaca isi, mengindeks, atau membagikan dokumen Anda kepada pihak ketiga mana pun.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Analytics & Cookies */}
        <section className="space-y-3 pt-4 border-t border-rule">
          <div className="flex items-center gap-2 text-ink">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
            <h2 className="font-serif text-xl font-medium">3. Data Non-Pribadi & Cookie</h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Kami tidak menggunakan pelacak invasif atau menjual data pengguna. Kami mungkin mencatat data teknis agregat anonim (seperti jumlah hitungan konversi atau error log tanpa menyertakan dokumen) untuk memantau stabilitas server dan mencegah penyalahgunaan lalu lintas (rate limiting).
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
