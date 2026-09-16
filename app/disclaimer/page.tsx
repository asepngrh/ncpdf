"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DisclaimerPage() {
  const { lang } = useLanguage();
  const isId = lang === "id";

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <header className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            {isId ? "Sanggahan (Disclaimer)" : "Disclaimer"}
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            {isId ? "Terakhir Diperbarui: 16 September 2026" : "Last Updated: September 16, 2026"}
          </p>
        </header>

        {/* 1. General Disclaimer */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "1. Sanggahan Umum" : "1. General Disclaimer"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "ncpdf menyediakan alat pemrosesan dokumen dan PDF atas dasar prinsip \"as is\" (apa adanya) dan \"as available\" untuk tujuan utilitas umum. Meskipun kami menggunakan engine dan library standar industri untuk menjaga ketepatan konversi, ncpdf tidak memberikan jaminan atas kelengkapan, ketepatan, atau keakuratan 100% pada hasil dokumen yang diproses."
              : "ncpdf provides PDF and document processing tools on an \"as is\" and \"as available\" basis for informational and general utility purposes. While we employ industry-standard libraries and engines to maintain output fidelity, ncpdf makes no representations or warranties of any kind regarding the accuracy, completeness, reliability, or suitability of the processed documents."}
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Modifikasi dan konversi dokumen—khususnya dokumen dengan grafik vektor rumit, font khusus tertanam, makro, atau format tabel berlapis—terkadang dapat menghasilkan sedikit variasi visual atau tata letak."
              : "Document conversions and modifications—particularly those involving complex vector graphics, embedded fonts, macros, or intricate table layouts—may occasionally produce visual variances or unexpected formatting anomalies."}
          </p>
        </section>

        {/* 2. User Responsibility */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "2. Tanggung Jawab Pengguna & Legalitas Konten" : "2. User Responsibility & Content Legality"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Anda bertanggung jawab penuh atas seluruh file dan dokumen yang Anda proses di ncpdf. Anda bertanggung jawab memastikan bahwa:"
              : "You retain sole responsibility for all documents, images, and content you process using ncpdf. You are responsible for ensuring that:"}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-muted leading-relaxed">
            <li>
              {isId
                ? "Anda memiliki hak legal dan otorisasi yang sah untuk mengedit, mengompres, atau mengonversi dokumen terkait."
                : "You possess the legal rights or authorization to modify, compress, convert, or sign the submitted documents."}
            </li>
            <li>
              {isId
                ? "File Anda tidak melanggar ketentuan kerahasiaan institusi Anda."
                : "Your files do not contain confidential information prohibited by your organization from being handled via web utilities."}
            </li>
            <li>
              {isId
                ? "Anda selalu menyimpan salinan (backup) file asli sebelum melakukan operasi yang mengubah struktur dokumen (seperti hapus halaman, crop, atau kompresi tinggi)."
                : "You maintain local backups of all original files prior to performing destructive operations (such as page deletion, cropping, or high-compression resizing)."}
            </li>
          </ul>
        </section>

        {/* 3. No Professional Advice */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "3. Bukan Nasihat Hukum atau Profesional" : "3. No Legal or Professional Advice"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Fitur dan konten informasi di ncpdf bukan merupakan nasihat hukum, keuangan, maupun medis. Khusus untuk fitur tanda tangan digital, pengguna disarankan memastikan keabsahan hukum penandatanganan elektronik untuk dokumen kontrak penting sesuai dengan yurisdiksi hukum setempat."
              : "The tools and informational content on ncpdf do not constitute legal, medical, or financial advice. In particular, the digital signing tool is intended for standard electronic document workflows; you should consult legal counsel regarding the legal validity of electronic signatures for critical contracts in your specific jurisdiction."}
          </p>
        </section>

        {/* 4. External Links */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "4. Tautan Luar" : "4. External Links"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Situs kami dapat memuat tautan ke situs pihak ketiga (seperti dokumentasi atau platform donasi). Kami tidak bertanggung jawab atas kebijakan privasi maupun isi konten pada situs pihak ketiga tersebut."
              : "Our website may contain links to external third-party websites or services. We have no control over and assume no responsibility for the content, privacy practices, or policies of any third-party websites."}
          </p>
        </section>

        {/* 5. Limitation of Liability */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "5. Batasan Tanggung Jawab" : "5. Limitation of Liability"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId ? (
              <>
                ncpdf dan kontributornya tidak bertanggung jawab atas kerugian atau kerusakan data yang timbul dari penggunaan layanan kami. Untuk ketentuan lengkap, silakan baca{" "}
                <Link href="/terms" className="text-accent underline hover:text-accent-hover">
                  Syarat & Ketentuan Layanan
                </Link>
                .
              </>
            ) : (
              <>
                Under no circumstances shall ncpdf or its contributors be held liable for any data loss, file corruption, or damages arising from the use of our service. For full terms, please review our{" "}
                <Link href="/terms" className="text-accent underline hover:text-accent-hover">
                  Terms of Service
                </Link>
                .
              </>
            )}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
