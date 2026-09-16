import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF — Free & Private",
  description: "Kecilkan ukuran file PDF Anda langsung di browser tanpa mengurangi ketajaman teks. Privasi 100% aman.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
