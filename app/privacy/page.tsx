"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const isId = lang === "id";

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <header className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            {isId ? "Kebijakan Privasi" : "Privacy Policy"}
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            {isId ? "Terakhir Diperbarui: 16 September 2026" : "Last Updated: September 16, 2026"}
          </p>
        </header>

        {/* 1. Privacy by Architecture */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "1. Privasi Berbasis Arsitektur (Privacy by Architecture)" : "1. Overview: Privacy by Architecture"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Di ncpdf (\"kami\", \"tim ncpdf\"), kami meyakini bahwa cara terbaik untuk menjaga privasi dokumen Anda adalah dengan tidak mengumpulkan maupun menyimpan file Anda sama sekali. Kami merancang arsitektur ncpdf dengan prinsip utama perlindungan privasi:"
              : "At ncpdf (\"we\", \"us\", or \"the ncpdf team\"), we believe the strongest way to safeguard your document privacy is to avoid collecting or storing your files in the first place. We designed ncpdf from the ground up around a privacy-by-architecture model:"}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-muted leading-relaxed">
            <li>
              <strong>{isId ? "Pemrosesan Client-Side (100% di browser Anda):" : "Client-Side Processing (100% in your browser):"}</strong>{" "}
              {isId
                ? "Alat-alat utama—seperti Kompresi PDF, Resize Target KB/MB, Gabung (Merge), Pisah (Split), Ekstrak, Hapus Halaman, Atur Urutan, Putar PDF, Watermark, Nomor Halaman, Tanda Tangan Digital, Sorotan (Highlight), Crop PDF, dan PDF ke JPG—diproses seluruhnya di dalam browser Anda menggunakan Web Workers dan WebAssembly. File Anda diproses di RAM lokal perangkat Anda dan tidak pernah dikirim ke server kami."
                : "Core operations—including PDF Compression, Custom KB/MB Resizing, Merging, Splitting, Page Extraction, Deletion, Rearrangement, Rotation, Watermarking, Page Numbering, Digital Signing, Highlighting, Cropping, and PDF-to-JPG conversions—are executed entirely within your web browser using Web Workers and WebAssembly. Your files are processed in your local device RAM and are never transmitted to our servers."}
            </li>
            <li>
              <strong>{isId ? "Konversi Server-Assisted (Zero Retention):" : "Server-Assisted Conversions (Zero Retention):"}</strong>{" "}
              {isId
                ? "Konversi format Office (seperti Word ke PDF, Excel ke PDF, PPT ke PDF, dan konversi ke Office) memerlukan engine khusus. File tersebut dikirim melalui sambungan terenkripsi HTTPS, diproses dalam memori terisolasi sementara, dan langsung dihapus permanen secara otomatis begitu hasil konversi selesai dikirim ke browser Anda."
                : "Office format conversions (such as Word to PDF, Excel to PDF, PowerPoint to PDF, and reverse Office conversions) require dedicated conversion engines. These files are sent via encrypted HTTPS, processed in temporary isolated memory, and automatically and permanently deleted immediately after the converted output is returned to your browser."}
            </li>
          </ul>
        </section>

        {/* 2. What We Collect */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "2. Data yang Kami Kumpulkan" : "2. Information We Collect"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Kami tidak mewajibkan pembuatan akun, registrasi, maupun login. Kami tidak mengumpulkan nama, alamat email, atau nomor telepon untuk menggunakan alat kami."
              : "We do not require user accounts, registration, or logins. We do not collect names, email addresses, or phone numbers to use our tools."}
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Kami hanya mengumpulkan data teknis anonim dan agregat standar melalui alat analitik ramah privasi untuk memantau kestabilan performa web:"
              : "We only collect standard, aggregate, and anonymized technical data through privacy-conscious analytics tools to maintain application stability and understand global traffic patterns:"}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-muted leading-relaxed">
            <li>{isId ? "Halaman yang dikunjungi dan fitur yang digunakan." : "Pages visited and features utilized."}</li>
            <li>{isId ? "Jenis browser, sistem operasi, dan kategori perangkat." : "Browser type, operating system, and device category."}</li>
            <li>{isId ? "Wilayah geografis perkiraan (berdasarkan negara/kota dari IP)." : "Approximate geographic region (derived from IP address at the country/city level)."}</li>
            <li>{isId ? "Metrik teknis performa web dan tingkat error." : "Technical performance metrics, error rates, and load times."}</li>
          </ul>
          <p className="text-sm text-ink-muted leading-relaxed font-medium">
            {isId
              ? "Kami tidak pernah memeriksa, mencatat, atau menyimpan isi dokumen maupun metadata file yang Anda proses."
              : "We never inspect, log, or collect the contents of your documents or metadata within your uploaded files."}
          </p>
        </section>

        {/* 3. Server-Assisted File Handling */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "3. Penanganan File pada Server Konversi" : "3. Server-Assisted File Handling & Retention"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId ? "Untuk alat konversi yang memerlukan bantuan server:" : "For conversion tools requiring server assistance:"}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-muted leading-relaxed">
            <li>
              <strong>{isId ? "Enkripsi End-to-End:" : "End-to-End Encryption:"}</strong>{" "}
              {isId
                ? "Semua data yang dikirim antara perangkat Anda dan server konversi dienkripsi menggunakan protokol TLS/HTTPS standar industri."
                : "All data transmitted between your device and the conversion engine is encrypted using industry-standard TLS/HTTPS."}
            </li>
            <li>
              <strong>{isId ? "Penghapusan Otomatis Instan:" : "Immediate Automated Deletion:"}</strong>{" "}
              {isId
                ? "File hanya disimpan dalam RAM sementara selama proses konversi berlangsung dan langsung dihapus seketika setelah unduhan selesai dikirimkan."
                : "Files are retained only for the transient duration required to execute the conversion. Once the converted stream is delivered to your browser (or if an error occurs), temporary files are wiped from memory."}
            </li>
            <li>
              <strong>{isId ? "Tanpa Akses Manusia & Tanpa AI Training:" : "No Human Access & No AI Training:"}</strong>{" "}
              {isId
                ? "Tidak ada staf yang membaca dokumen Anda dan file Anda tidak pernah dipakai untuk melatih model AI apa pun."
                : "No staff or automated scanning algorithms read or index your documents, and your files are never used to train machine learning models."}
            </li>
          </ul>
        </section>

        {/* 4. Cookies & Analytics */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "4. Cookie & Penyimpanan Lokal" : "4. Cookies & Analytics"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Kami hanya menggunakan cookie dan penyimpanan lokal browser untuk preferensi fungsional (seperti menyimpan pilihan tema gelap/terang dan bahasa) serta analitik anonim."
              : "We use minimal cookies and local browser storage strictly for functional preferences (such as saving your preferred dark/light theme and language selection) and for anonymous aggregate analytics."}
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Anda dapat menonaktifkan atau memblokir cookie kapan saja melalui pengaturan browser Anda tanpa memengaruhi fungsi alat-alat PDF client-side."
              : "You can disable or block cookies at any time through your browser settings without impacting your ability to use our client-side PDF tools."}
          </p>
        </section>

        {/* 5. User Rights */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "5. Hak Privasi Pengguna" : "5. Your Privacy Rights"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId
              ? "Karena kami tidak menyimpan akun pengguna ataupun arsip dokumen, kami tidak memiliki data pribadi yang dapat dihubungkan dengan identitas Anda. Untuk pertanyaan mengenai data analitik teknis, Anda dapat menghubungi kami."
              : "Depending on your jurisdiction (such as GDPR or CCPA), you may have rights regarding your personal data. Because we do not store personal accounts or document records, we generally hold no personal data linked to your identity. For any inquiries regarding analytics data, please reach out to us."}
          </p>
        </section>

        {/* 6. Contact */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            {isId ? "6. Hubungi Kami" : "6. Contact Us"}
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            {isId ? "Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami di " : "If you have questions or concerns about this Privacy Policy or our data handling practices, please contact us at "}
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
