import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Page Number to PDF — Free & Private",
  description: "Sisipkan nomor halaman kustom (Header / Footer) ke dokumen PDF dengan opsi posisi dan format teks fleksibel.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
