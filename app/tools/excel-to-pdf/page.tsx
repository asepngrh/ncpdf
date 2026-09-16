"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes, getBaseFileName } from "@/lib/utils/fileHelpers";
import { FileSpreadsheet, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileAccepted = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setErrorMessage(null);
    setResultBlob(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setProgress(20);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      setProgress(40);

      const res = await fetch("/api/convert/excel-to-pdf", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal mengonversi file Excel ke PDF.");
      }

      const blob = await res.blob();
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Terjadi kesalahan saat menghubungi server konversi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Excel ke PDF"
      description="Konversi spreadsheet Excel (XLS, XLSX, CSV, ODS) menjadi dokumen PDF yang rapi dan siap cetak."
      category="Convert"
      isClientSide={false}
    >
      <div className="space-y-6">
        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-3.5 bg-[var(--paper-muted)] rounded border border-[var(--rule)] text-xs text-[var(--ink-muted)]">
          <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[var(--ink)] block mb-0.5">Jaminan Privasi & Zero Retention</span>
            File Anda dikirim sementara secara terenkripsi ke server konversi kami dan otomatis dihapus segera setelah proses selesai. Tidak ada dokumen yang disimpan.
          </div>
        </div>

        {!file && (
          <FileDropzone
            accept={{
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
              "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
              "text/csv": [".csv"],
            }}
            multiple={false}
            onFilesAccepted={handleFileAccepted}
            title="Pilih atau drop file Excel (.xlsx, .xls, .ods, .csv)"
          />
        )}

        {file && !resultBlob && (
          <Card className="border-[var(--rule)] bg-[var(--surface)] max-w-xl mx-auto">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-[var(--paper-muted)] rounded border border-[var(--rule)]">
                <FileSpreadsheet className="w-8 h-8 text-emerald-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--ink)] truncate">{file.name}</div>
                  <div className="text-xs text-[var(--ink-muted)] font-mono">{formatBytes(file.size)}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs font-mono text-[var(--ink-muted)] py-2">
                <span className="px-2.5 py-1 bg-[var(--paper)] rounded border border-[var(--rule)] uppercase font-semibold">
                  {file.name.split(".").pop()}
                </span>
                <ArrowRight className="w-4 h-4 text-[var(--ink-muted)]" />
                <span className="px-2.5 py-1 bg-[var(--accent-soft)] text-[var(--accent)] font-semibold rounded border border-[var(--accent)]/30 uppercase">
                  PDF
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {errorMessage}
                </div>
              )}

              {isProcessing && (
                <div className="pt-2">
                  <ProgressBar
                    progress={progress}
                    label="Mengonversi Spreadsheet Excel ke PDF..."
                    sublabel="Mohon tunggu sejenak, tabel dan rumus sedang dikonversi..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setFile(null)}
                  disabled={isProcessing}
                >
                  Ganti File
                </Button>
                <Button className="flex-1 text-xs" onClick={handleConvert} disabled={isProcessing}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Konversi ke PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {resultBlob && file && (
          <ResultDownloadCard
            filename={`${getBaseFileName(file.name)}.pdf`}
            blob={resultBlob}
            originalSize={file.size}
            onReset={() => {
              setResultBlob(null);
              setFile(null);
            }}
          />
        )}
      </div>
    </ToolLayout>
  );
}
