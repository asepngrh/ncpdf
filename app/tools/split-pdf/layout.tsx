import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF — Free & Private",
  description: "Pisahkan halaman dokumen PDF berdasarkan rentang halaman pilihan atau unduh semua halaman dalam file ZIP.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
