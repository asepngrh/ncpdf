import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Highlight PDF — Free & Private",
  description: "Sorot dan tandai teks atau tabel penting pada PDF dengan aneka warna stabilo semi-transparan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
