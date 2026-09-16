import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit PDF — Free & Private PDF Editor Online",
  description: "Tambahkan teks, gambar, coretan gambar bebas, dan berbagai bentuk (kotak, lingkaran, panah) langsung pada dokumen PDF Anda secara gratis.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
