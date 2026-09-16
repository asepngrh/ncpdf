import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Disclaimer for ncpdf — Information regarding tool usage, file safety, and liability limitations.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <header className="border-b border-rule pb-8">
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight">
            Disclaimer
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Last Updated: September 16, 2026
          </p>
        </header>

        {/* 1. General Disclaimer */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink">
            1. General Disclaimer
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            ncpdf provides PDF and document processing tools on an &quot;as is&quot; and &quot;as available&quot; basis for informational and general utility purposes. While we employ industry-standard libraries and engines to maintain output fidelity, ncpdf makes no representations or warranties of any kind regarding the accuracy, completeness, reliability, or suitability of the processed documents.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Document conversions and modifications—particularly those involving complex vector graphics, embedded fonts, macros, or intricate table layouts—may occasionally produce visual variances or unexpected formatting anomalies.
          </p>
        </section>

        {/* 2. User Responsibility */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            2. User Responsibility &amp; Content Legality
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            You retain sole responsibility for all documents, images, and content you process using ncpdf. You are responsible for ensuring that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-muted leading-relaxed">
            <li>You possess the legal rights or authorization to modify, compress, convert, or sign the submitted documents.</li>
            <li>Your files do not contain confidential information prohibited by your organization or jurisdiction from being handled via third-party or browser utilities.</li>
            <li>You maintain local backups of all original files prior to performing destructive operations (such as page deletion, cropping, or high-compression resizing).</li>
          </ul>
          <p className="text-sm text-ink-muted leading-relaxed">
            ncpdf does not inspect, monitor, or censor the contents of user documents and assumes no liability for illegal or unauthorized content processed through our platform.
          </p>
        </section>

        {/* 3. No Professional Advice */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            3. No Legal, Financial, or Professional Advice
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            The tools and informational content on ncpdf do not constitute legal, medical, financial, or certified engineering advice. In particular, the digital signing tool is intended for standard electronic document workflows; you should consult legal counsel regarding the legal validity of electronic signatures for critical contracts in your specific jurisdiction.
          </p>
        </section>

        {/* 4. External Links */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            4. External Links &amp; Third-Party Services
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Our website may contain links to external third-party websites or services (such as documentation references, partner platforms, or donation gateways). We have no control over and assume no responsibility for the content, privacy practices, or policies of any third-party websites.
          </p>
        </section>

        {/* 5. Limitation of Liability */}
        <section className="space-y-3 pt-6 border-t border-rule">
          <h2 className="font-serif text-xl font-medium text-ink">
            5. Limitation of Liability
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Under no circumstances shall ncpdf or its contributors be held liable for any data loss, file corruption, or financial damages arising from the use of our service. For full terms regarding liability and indemnification, please review our{" "}
            <Link href="/terms" className="text-accent underline hover:text-accent-hover">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
