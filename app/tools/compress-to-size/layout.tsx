import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF ke Ukuran Kustom — Free & Private",
  description: "Kompres dan kecilkan ukuran PDF ke target persis yang Anda inginkan (misal: < 100 KB, < 500 KB, < 1 MB) langsung di browser Anda.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
