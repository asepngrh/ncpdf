import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Image to PDF — Free & Private",
  description: "Sisipkan foto, stempel, atau logo ke dokumen PDF dengan drag & resize visual interaktif.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
