import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF ke Word — Free & Private",
  description: "Ubah dokumen PDF kembali menjadi file Microsoft Word (.docx) yang dapat diedit tanpa watermark.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
