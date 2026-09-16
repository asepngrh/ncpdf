import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign PDF — Free & Private",
  description: "Tandatangani dokumen PDF secara online dengan menggambar tanda tangan, mengetik font kursif, atau mengunggah tanda tangan transparan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
