import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for ncpdf — Learn how we protect your document privacy with client-side processing and zero-retention conversions.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <header className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Last Updated: September 16, 2026
          </p>
        </header>

        {/* 1. Privacy by Architecture */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink">
            1. Overview: Privacy by Architecture
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            At ncpdf (&quot;we&quot;, &quot;us&quot;, or &quot;the ncpdf team&quot;), we believe the strongest way to safeguard your document privacy is to avoid collecting or storing your files in the first place. We designed ncpdf from the ground up around a <strong>privacy-by-architecture</strong> model:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-muted leading-relaxed">
            <li>
              <strong>Client-Side Processing (100% in your browser):</strong> Core operations—including PDF Compression, Custom KB/MB Resizing, Merging, Splitting, Page Extraction, Deletion, Rearrangement, Rotation, Watermarking, Page Numbering, Digital Signing, Highlighting, Cropping, and PDF-to-JPG conversions—are executed entirely within your web browser using Web Workers and WebAssembly. Your files are processed in your local device RAM and are <strong>never transmitted</strong> to our servers.
            </li>
            <li>
              <strong>Server-Assisted Conversions (Zero Retention):</strong> Office format conversions (such as Word to PDF, Excel to PDF, PowerPoint to PDF, and reverse Office conversions) require dedicated conversion engines. These files are sent via encrypted HTTPS, processed in temporary isolated memory, and <strong>automatically and permanently deleted</strong> immediately after the converted output is returned to your browser.
            </li>
          </ul>
        </section>

        {/* 2. What We Collect */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            2. Information We Collect
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            We do not require user accounts, registration, or logins. We do not collect names, email addresses, or phone numbers to use our tools.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            We only collect standard, aggregate, and anonymized technical data through privacy-conscious analytics tools to maintain application stability and understand global traffic patterns:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-muted leading-relaxed">
            <li>Pages visited and features utilized.</li>
            <li>Browser type, operating system, and device category.</li>
            <li>Approximate geographic region (derived from IP address at the country/city level).</li>
            <li>Technical performance metrics, error rates, and load times.</li>
          </ul>
          <p className="text-sm text-ink-muted leading-relaxed font-medium">
            We never inspect, log, or collect the contents of your documents or metadata within your uploaded files.
          </p>
        </section>

        {/* 3. Server-Assisted File Handling */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            3. Server-Assisted File Handling &amp; Retention
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            For conversion tools requiring server assistance:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-muted leading-relaxed">
            <li>
              <strong>End-to-End Encryption:</strong> All data transmitted between your device and the conversion engine is encrypted using industry-standard TLS/HTTPS.
            </li>
            <li>
              <strong>Immediate Automated Deletion:</strong> Files are retained only for the transient duration required to execute the conversion. Once the converted stream is delivered to your browser (or if an error occurs), temporary files are wiped from memory.
            </li>
            <li>
              <strong>No Human Access &amp; No AI Training:</strong> No staff or automated scanning algorithms read or index your documents, and your files are never used to train machine learning models.
            </li>
          </ul>
        </section>

        {/* 4. Cookies & Analytics */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            4. Cookies &amp; Analytics
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            We use minimal cookies and local browser storage strictly for functional preferences (such as saving your preferred dark/light theme and language selection) and for anonymous aggregate analytics.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            You can disable or block cookies at any time through your browser settings without impacting your ability to use our client-side PDF tools.
          </p>
        </section>

        {/* 5. Third-Party Infrastructure */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            5. Third-Party Service Providers
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            We partner with reputable infrastructure and hosting providers (such as Cloudflare and Vercel) to deliver static assets with global CDN caching and DDoS mitigation. These service providers process network requests in accordance with strict security standards.
          </p>
        </section>

        {/* 6. Children's Privacy */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            6. Children&apos;s Privacy
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            ncpdf does not knowingly collect personally identifiable information from children under the age of 13 (or 16 in certain jurisdictions). If you believe a child has provided personal information to our site, please contact us so we can take appropriate measures.
          </p>
        </section>

        {/* 7. User Rights */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            7. Your Privacy Rights
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Depending on your jurisdiction (such as GDPR in Europe or CCPA in California), you may have rights regarding your personal data. Because we do not store personal accounts or document records, we generally hold no personal data linked to your identity. For any inquiries regarding analytics data, please reach out to us.
          </p>
        </section>

        {/* 8. Changes to this Policy */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            8. Changes to This Privacy Policy
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            We may update this Privacy Policy from time to time to reflect technological or regulatory updates. Any changes will be posted on this page with an updated &quot;Last Updated&quot; date.
          </p>
        </section>

        {/* 9. Contact */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            9. Contact Us
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            If you have questions or concerns about this Privacy Policy or our data handling practices, please contact us at{" "}
            <a
              href="mailto:privacy@ncpdf.app"
              className="text-accent underline hover:text-accent-hover"
            >
              privacy@ncpdf.app
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
