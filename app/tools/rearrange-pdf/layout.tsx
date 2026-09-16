import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rearrange PDF Pages — Free & Private",
  description: "Atur ulang urutan halaman PDF Anda secara visual dengan drag and drop thumbnail interaktif.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
