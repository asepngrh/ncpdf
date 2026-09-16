import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ncpdf — Free PDF Tools (Compress, Convert, Edit & Merge)",
    template: "%s | ncpdf",
  },
  description:
    "Solusi lengkap alat PDF gratis dan cepat. Kompresi ke target KB/MB, gabung, pisah, konversi Word/Excel/PPT, tambah watermark, dan tanda tangan digital tanpa watermark dan tanpa perlu login.",
  keywords: [
    "PDF tools",
    "compress pdf",
    "resize pdf kb",
    "merge pdf",
    "split pdf",
    "word to pdf",
    "pdf to word",
    "sign pdf",
    "watermark pdf",
    "free pdf editor",
  ],
  authors: [{ name: "ncpdf" }],
  creator: "ncpdf",
  metadataBase: new URL("https://ncpdf.org"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://ncpdf.org",
    title: "ncpdf — Free PDF Tools (Compress, Convert, Edit & Merge)",
    description:
      "Alat PDF gratis, cepat, dan mengutamakan privasi. Sebagian besar alat berjalan 100% langsung di browser Anda.",
    siteName: "ncpdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "ncpdf — Free PDF Tools",
    description: "Free, fast & private PDF tools directly in your browser.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/immich-maintenance.webp",
    shortcut: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/immich-maintenance.webp",
    apple: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/immich-maintenance.webp",
  },
};

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem("ncpdf_theme");
                if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                  document.documentElement.classList.add("dark");
                  document.documentElement.setAttribute("data-theme", "dark");
                  document.documentElement.style.colorScheme = "dark";
                } else {
                  document.documentElement.classList.remove("dark");
                  document.documentElement.setAttribute("data-theme", "light");
                  document.documentElement.style.colorScheme = "light";
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-paper text-ink min-h-screen">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
