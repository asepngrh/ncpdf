import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF — Free & Private",
  description: "Putar orientasi halaman PDF 90°, 180°, atau 270° per halaman atau semua halaman secara permanen.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
