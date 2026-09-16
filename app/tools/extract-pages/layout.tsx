import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extract PDF Pages — Free & Private",
  description: "Ekstrak halaman tertentu dari dokumen PDF menjadi file PDF baru atau arsip ZIP dengan mudah.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
