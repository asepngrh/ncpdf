import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize PDF ke KB — Free & Private",
  description: "Sesuaikan ukuran PDF ke batas kilobyte tertentu (mis. 200 KB, 300 KB, 500 KB) untuk upload portal pendaftaran.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
