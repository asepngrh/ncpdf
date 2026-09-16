import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word ke PDF — Free & Private",
  description: "Konversi dokumen Microsoft Word (.docx, .doc, .odt) menjadi file PDF berkualitas tinggi dengan format rapi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
