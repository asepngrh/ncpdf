import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for ncpdf — Free online PDF and document processing tools.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <header className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Last Updated: September 16, 2026
          </p>
        </header>

        {/* 1. Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink">
            1. Acceptance of Terms
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            By accessing or using ncpdf (&quot;we&quot;, &quot;us&quot;, or &quot;the ncpdf team&quot;) via our website and associated tools, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            2. Description of Service
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            ncpdf provides a suite of free, web-based PDF and document utility tools (including compressing, merging, splitting, organizing, watermarking, signing, cropping, and document format conversions).
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Our tools operate primarily through two processing models:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-muted leading-relaxed">
            <li>
              <strong>Client-Side Tools:</strong> The vast majority of our utilities (such as compression, merging, splitting, editing, and client-side format exports) process your files 100% locally within your web browser using Web Workers and JavaScript. Your documents never leave your computer or mobile device.
            </li>
            <li>
              <strong>Server-Assisted Conversion Tools:</strong> Complex document conversions (such as Word, Excel, and PowerPoint conversions) are transmitted via encrypted HTTPS connections to temporary conversion worker engines, where they are converted and immediately deleted once delivery is complete.
            </li>
          </ul>
        </section>

        {/* 3. Acceptable Use */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            3. Acceptable Use
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            You agree to use ncpdf only for lawful purposes. You agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-muted leading-relaxed">
            <li>
              Process, upload, or transmit any material that is illegal, defamatory, infringing on third-party intellectual property rights, or harmful.
            </li>
            <li>
              Attempt to disrupt, overload, scrape, reverse-engineer, or execute Denial of Service (DoS) attacks against our conversion servers or application infrastructure.
            </li>
            <li>
              Bypass or attempt to circumvent rate limits, technical security controls, or file size thresholds implemented on the platform.
            </li>
          </ul>
        </section>

        {/* 4. Intellectual Property & File Ownership */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            4. Intellectual Property &amp; File Ownership
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            <strong>Your Content Remains Yours:</strong> We claim no intellectual property rights or ownership over any documents, images, or files you process through ncpdf. We do not store, copy, inspect, or use your files to train machine learning models.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            All rights, source code, logos, visual interfaces, and branding associated with ncpdf remain the exclusive property of ncpdf and its contributors.
          </p>
        </section>

        {/* 5. Disclaimer of Warranties */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            5. Disclaimer of Warranties
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            ncpdf is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. While we strive for high reliability and precision, we do not guarantee that file conversions will be 100% error-free, uninterrupted, or perfectly preserve proprietary formatting of complex layouts.
          </p>
        </section>

        {/* 6. Limitation of Liability */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            6. Limitation of Liability
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            To the maximum extent permitted by applicable law, ncpdf and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to loss of data, loss of business, or document corruption resulting from the use or inability to use this service.
          </p>
        </section>

        {/* 7. Changes to Service & Termination */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            7. Changes to Service &amp; Termination
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice. We may also restrict access to users who violate these Terms of Service.
          </p>
        </section>

        {/* 8. Governing Law */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            8. Governing Law
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            These Terms are governed by general principles of applicable law in the jurisdiction where the service operates, without regard to conflict of law provisions.
          </p>
        </section>

        {/* 9. Contact */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            9. Contact Us
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            If you have any questions or feedback regarding these Terms of Service, please contact us at{" "}
            <a
              href="mailto:contact@ncpdf.app"
              className="text-accent underline hover:text-accent-hover"
            >
              contact@ncpdf.app
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
