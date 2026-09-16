import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize PDF ke MB — Free & Private",
  description: "Batasi dan kompres ukuran dokumen PDF ke target Megabyte (MB) secara otomatis di browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
