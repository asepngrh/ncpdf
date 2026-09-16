import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel ke PDF — Free & Private",
  description: "Konversi spreadsheet Excel (.xlsx, .xls, .ods, .csv) menjadi dokumen PDF yang rapi dan siap dicetak.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
