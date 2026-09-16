import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF — Free & Private",
  description: "Gabungkan banyak file PDF menjadi satu file utuh dengan urutan kustom langsung di browser Anda.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
