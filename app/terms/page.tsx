import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan layanan gratis alat PDF ncpdf.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Berlaku sejak: September 2026
          </p>
        </div>

        <section className="space-y-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
          <h2 className="font-serif text-lg font-medium text-ink">1. Penggunaan Layanan</h2>
          <p>
            Dengan mengakses dan menggunakan situs <strong>ncpdf</strong>, Anda menyetujui untuk menggunakan seluruh alat sesuai dengan ketentuan hukum yang berlaku. Anda dilarang menggunakan layanan ini untuk mengolah atau menyebarkan konten yang melanggar hukum, berbahaya, atau melanggar hak cipta pihak lain.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-rule text-xs sm:text-sm text-ink-muted leading-relaxed">
          <h2 className="font-serif text-lg font-medium text-ink">2. Tanggung Jawab Pengguna</h2>
          <p>
            Anda bertanggung jawab penuh atas keabsahan dan kepemilikan dokumen yang Anda proses menggunakan alat ncpdf. Kami tidak bertanggung jawab atas kehilangan atau kerusakan data yang mungkin timbul akibat kegagalan koneksi atau gangguan peramban lokal.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-rule text-xs sm:text-sm text-ink-muted leading-relaxed">
          <h2 className="font-serif text-lg font-medium text-ink">3. Ketersediaan Layanan "Sebagaimana Adanya" (As-Is)</h2>
          <p>
            Layanan ncpdf disediakan secara gratis "sebagaimana adanya" tanpa jaminan ketersediaan 100% tanpa henti. Kami berhak memperbarui, memodifikasi, atau menghentikan fitur tertentu sewaktu-waktu demi pemeliharaan dan peningkatan sistem.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
