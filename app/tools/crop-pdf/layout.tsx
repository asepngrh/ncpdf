import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop PDF — Free & Private",
  description: "Potong margin tepi halaman PDF secara visual dan presisi langsung di browser tanpa watermark.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
