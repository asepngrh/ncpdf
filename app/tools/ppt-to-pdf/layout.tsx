import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PowerPoint ke PDF — Free & Private",
  description: "Ubah slide presentasi PowerPoint (.pptx, .ppt, .odp) menjadi dokumen PDF siap presentasi dan cetak.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
