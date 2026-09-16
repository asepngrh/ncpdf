"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TermsPage() {
  const { lang } = useLanguage();
  const isId = lang === "id";

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <header className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            {isId ? "Syarat & Ketentuan Layanan" : "Terms of Service"}
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            {isId ? "Terakhir Diperbarui: 16 September 2026" : "Last Updated: September 16, 2026"}
          </p>
        </header>

        {/* 1. Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "1. Penerimaan Syarat" : "1. Acceptance of Terms"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Dengan mengakses atau menggunakan ncpdf (\"kami\", \"tim ncpdf\") melalui situs web dan alat-alat terkait, Anda menyetujui untuk terikat oleh Syarat & Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan kami."
              : "By accessing or using ncpdf (\"we\", \"us\", or \"the ncpdf team\") via our website and associated tools, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service."}
          </p>
        </section>

        {/* 2. Description of Service */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "2. Deskripsi Layanan" : "2. Description of Service"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "ncpdf menyediakan rangkaian alat utilitas dokumen dan PDF gratis berbasis web (termasuk kompresi, penggabungan, pemisahan, pengorganisasian, watermark, penomoran, tanda tangan digital, pemotongan, dan konversi format dokumen)."
              : "ncpdf provides a suite of free, web-based PDF and document utility tools (including compressing, merging, splitting, organizing, watermarking, signing, cropping, and document format conversions)."}
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId ? "Alat kami beroperasi melalui dua model pemrosesan:" : "Our tools operate primarily through two processing models:"}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-muted leading-relaxed">
            <li>
              <strong>{isId ? "Alat Client-Side:" : "Client-Side Tools:"}</strong>{" "}
              {isId
                ? "Sebagian besar alat kami (kompresi, merge, split, edit, tanda tangan, watermark, PDF ke JPG) memproses file 100% secara lokal di browser perangkat Anda menggunakan JavaScript dan Web Workers. Dokumen Anda tidak pernah dikirim ke server mana pun."
                : "The vast majority of our utilities (such as compression, merging, splitting, editing, and client-side format exports) process your files 100% locally within your web browser using Web Workers and JavaScript. Your documents never leave your computer or mobile device."}
            </li>
            <li>
              <strong>{isId ? "Alat Konversi Server-Assisted:" : "Server-Assisted Conversion Tools:"}</strong>{" "}
              {isId
                ? "Konversi dokumen Office yang kompleks (Word, Excel, PowerPoint) dikirim melalui sambungan terenkripsi HTTPS ke server konversi sementara, diproses instan, dan langsung dihapus otomatis setelah output selesai dikirim."
                : "Complex document conversions (such as Word, Excel, and PowerPoint conversions) are transmitted via encrypted HTTPS connections to temporary conversion worker engines, where they are converted and immediately deleted once delivery is complete."}
            </li>
          </ul>
        </section>

        {/* 3. Acceptable Use */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "3. Batasan Penggunaan yang Diizinkan" : "3. Acceptable Use"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Anda setuju untuk menggunakan ncpdf hanya untuk tujuan yang sah menurut hukum. Anda setuju untuk TIDAK:"
              : "You agree to use ncpdf only for lawful purposes. You agree NOT to:"}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-muted leading-relaxed">
            <li>
              {isId
                ? "Memproses atau mengunggah materi yang melanggar hukum, melanggar hak cipta/kekayaan intelektual pihak lain, atau berbahaya."
                : "Process, upload, or transmit any material that is illegal, defamatory, infringing on third-party intellectual property rights, or harmful."}
            </li>
            <li>
              {isId
                ? "Mencoba mengganggu, membebani secara berlebihan, melakukan scraping, atau melancarkan serangan Denial of Service (DoS) terhadap server konversi kami."
                : "Attempt to disrupt, overload, scrape, reverse-engineer, or execute Denial of Service (DoS) attacks against our conversion servers or application infrastructure."}
            </li>
            <li>
              {isId
                ? "Membobol atau mencoba mengakali pembatasan rate limit dan sistem keamanan teknis kami."
                : "Bypass or attempt to circumvent rate limits, technical security controls, or file size thresholds implemented on the platform."}
            </li>
          </ul>
        </section>

        {/* 4. Intellectual Property & File Ownership */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "4. Hak Kekayaan Intelektual & Kepemilikan Dokumen" : "4. Intellectual Property & File Ownership"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            <strong>{isId ? "Dokumen Anda Sepenuhnya Milik Anda:" : "Your Content Remains Yours:"}</strong>{" "}
            {isId
              ? "Kami tidak mengklaim hak kepemilikan atas dokumen, gambar, atau file yang Anda proses di ncpdf. Kami tidak menyimpan, mengintip, maupun menggunakan file Anda untuk melatih model AI apa pun."
              : "We claim no intellectual property rights or ownership over any documents, images, or files you process through ncpdf. We do not store, copy, inspect, or use your files to train machine learning models."}
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Seluruh kode sumber, antarmuka visual, logo, dan merek dagang ncpdf adalah hak cipta ncpdf dan kontributornya."
              : "All rights, source code, logos, visual interfaces, and branding associated with ncpdf remain the exclusive property of ncpdf and its contributors."}
          </p>
        </section>

        {/* 5. Disclaimer of Warranties */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "5. Penafian Jaminan (Disclaimer of Warranties)" : "5. Disclaimer of Warranties"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "ncpdf disediakan berdasarkan prinsip \"AS IS\" (apa adanya) dan \"AS AVAILABLE\" tanpa jaminan apa pun, baik tersurat maupun tersirat. Kami tidak menjamin bahwa hasil konversi akan 100% sempurna tanpa variasi format pada dokumen dengan tata letak kompleks."
              : "ncpdf is provided on an \"AS IS\" and \"AS AVAILABLE\" basis without warranties of any kind, whether express or implied. While we strive for high reliability and precision, we do not guarantee that file conversions will be 100% error-free, uninterrupted, or perfectly preserve proprietary formatting of complex layouts."}
          </p>
        </section>

        {/* 6. Limitation of Liability */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "6. Batasan Tanggung Jawab" : "6. Limitation of Liability"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Sejauh yang diizinkan oleh hukum yang berlaku, tim ncpdf tidak bertanggung jawab atas kerugian langsung, tidak langsung, kehilangan data, atau kerusakan file yang diakibatkan oleh penggunaan layanan ini."
              : "To the maximum extent permitted by applicable law, ncpdf and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to loss of data, loss of business, or document corruption resulting from the use or inability to use this service."}
          </p>
        </section>

        {/* 7. Changes to Service */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "7. Perubahan Layanan" : "7. Changes to Service & Termination"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Kami berhak untuk mengubah, memperbarui, atau menghentikan fitur layanan kapan saja tanpa pemberitahuan sebelumnya."
              : "We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice. We may also restrict access to users who violate these Terms of Service."}
          </p>
        </section>

        {/* 8. Governing Law */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "8. Hukum yang Berlaku" : "8. Governing Law"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Ketentuan ini diatur oleh prinsip-prinsip hukum umum yang berlaku di wilayah operasional layanan, tanpa mengesampingkan pertentangan ketentuan hukum."
              : "These Terms are governed by general principles of applicable law in the jurisdiction where the service operates, without regard to conflict of law provisions."}
          </p>
        </section>

        {/* 9. Contact */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "9. Hubungi Kami" : "9. Contact Us"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId ? "Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami di " : "If you have any questions or feedback regarding these Terms of Service, please contact us at "}
            <a
              href="mailto:nicoopedia.dev@gmail.com"
              className="text-accent underline hover:text-accent-hover"
            >
              nicoopedia.dev@gmail.com
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
