"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Minimize2,
  Maximize2,
  Layers,
  Scissors,
  ArrowRightLeft,
  Trash2,
  RotateCw,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Stamp,
  Hash,
  Crop,
  PenTool,
  Highlighter,
  Sliders,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TOOLS_LIST, ToolCategory } from "@/lib/utils/toolsList";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconMap: Record<string, React.ElementType> = {
  Minimize2,
  Maximize2,
  Layers,
  Scissors,
  ArrowRightLeft,
  Trash2,
  RotateCw,
  FileText,
  FileSpreadsheet,
  Presentation,
  FilePresentation: Presentation,
  Image: ImageIcon,
  Stamp,
  Hash,
  Crop,
  PenTool,
  Highlighter,
  Sliders,
};

export default function HomePage() {
  const { lang, t, getToolTranslation } = useLanguage();

  const categoryLabels: Record<ToolCategory, string> = {
    Compress: t("catCompress"),
    Organize: t("catOrganize"),
    Convert: t("catConvert"),
    Edit: t("catEdit"),
  };

  const categories: ToolCategory[] = ["Compress", "Organize", "Convert", "Edit"];

  const translatedTools = useMemo(() => {
    return TOOLS_LIST.map((t) => {
      const trans = getToolTranslation(t.slug, t.title, t.description);
      return {
        ...t,
        title: trans.title,
        description: trans.description,
      };
    });
  }, [lang, getToolTranslation]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ncpdf",
    "url": "https://ncpdf.org",
    "description": "Free, fast & private PDF tools directly in your browser. Compress, convert, edit, merge and sign PDFs.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Client-side PDF Compression to KB/MB",
      "Merge & Split PDF",
      "Word/Excel/PPT to PDF Conversion",
      "Watermark, Sign & Highlight PDF",
      "PDF to JPG converter",
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header / Intro */}
        <div className="mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-ink">
            {t("heroTitle")}
          </h1>
          <p className="mt-2 text-base text-ink-muted">
            {t("heroSubtitle")}
          </p>
        </div>

        {/* The Index: List grouped per category */}
        <div className="space-y-12">
          {categories.map((category) => {
            const tools = translatedTools.filter((t) => t.category === category);
            if (tools.length === 0) return null;

            return (
              <section key={category} id={category.toLowerCase()}>
                <h2 className="text-xl font-display text-ink mb-2">
                  {categoryLabels[category]}
                </h2>
                <div className="border-t border-rule divide-y divide-rule">
                  {tools.map((tool) => {
                    const IconComponent = iconMap[tool.icon] || FileText;

                    return (
                      <Link
                        key={tool.slug}
                        href={tool.href}
                        className="group flex flex-col sm:flex-row sm:items-baseline justify-between py-3.5 px-3 rounded-md hover:bg-accent-soft transition-colors duration-120 gap-1 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconComponent className="w-4 h-4 text-ink flex-shrink-0" />
                          <span className="text-sm font-medium text-ink group-hover:text-accent transition-colors">
                            {tool.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 sm:text-right pl-7 sm:pl-0">
                          <span className="text-xs text-ink-muted line-clamp-1">
                            {tool.description}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
