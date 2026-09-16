import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Increase PDF Size — Free & Private",
  description: "Tambahkan ukuran file PDF secara aman tanpa merusak tampilan untuk memenuhi batas minimum upload dokumen.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
