import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Pages from PDF — Free & Private",
  description: "Pilih dan hapus halaman yang tidak dibutuhkan dari file PDF secara cepat langsung di browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
