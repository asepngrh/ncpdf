import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF ke Excel — Free & Private",
  description: "Ekstrak tabel dan angka dari file PDF ke spreadsheet Excel (.xlsx) dengan akurasi tinggi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
