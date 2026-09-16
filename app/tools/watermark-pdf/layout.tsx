import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark PDF — Free & Private",
  description: "Tambahkan watermark teks atau logo gambar kustom pada dokumen PDF dengan live preview dan pengaturan rotasi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
