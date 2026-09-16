import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF ke JPG — Free & Private",
  description: "Konversi tiap halaman dokumen PDF menjadi gambar JPG beresolusi tinggi langsung di browser Anda.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
