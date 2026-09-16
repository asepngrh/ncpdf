"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes, getBaseFileName, readFileAsArrayBuffer, PdfToolError } from "@/lib/utils/fileHelpers";
import { convertPdfToExcel } from "@/lib/pdf/pdfToExcel";
import { FileText, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>("Mengonversi PDF ke Excel (.xlsx)...");
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
      setProgress(10);
      setProgressStatus("Membaca data PDF...");
      setErrorMessage(null);

      const arrayBuffer = await readFileAsArrayBuffer(file);
      const xlsxBytes = await convertPdfToExcel(arrayBuffer, (p, status) => {
        setProgress(p);
        setProgressStatus(status);
      });

      const blob = new Blob([xlsxBytes as unknown as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof PdfToolError
          ? err.userMessage
          : "Gagal mengekstrak data tabel PDF ke format Excel."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF ke Excel"
      description="Ekstrak tabel dan data angka dari file PDF menjadi spreadsheet Microsoft Excel (.xlsx) yang rapi."
      category="Convert"
      isClientSide={true}
    >
      <div className="space-y-6">
        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-3.5 bg-[var(--paper-muted)] rounded border border-[var(--rule)] text-xs text-[var(--ink-muted)]">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[var(--ink)] block mb-0.5">Diproses 100% di Browser Anda</span>
            Dokumen Anda tidak dikirim ke server. Struktur tabel dan teks diekstrak secara lokal dan langsung disusun menjadi file Excel (.xlsx) asli.
          </div>
        </div>

        {!file && (
          <FileDropzone
            accept={{ "application/pdf": [".pdf"] }}
            multiple={false}
            onFilesAccepted={handleFileAccepted}
            title="Pilih atau drop file PDF untuk diubah ke Excel (.xlsx)"
          />
        )}

        {file && !resultBlob && (
          <Card className="border-[var(--rule)] bg-[var(--surface)] max-w-xl mx-auto">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-[var(--paper-muted)] rounded border border-[var(--rule)]">
                <FileText className="w-8 h-8 text-[var(--accent)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--ink)] truncate">{file.name}</div>
                  <div className="text-xs text-[var(--ink-muted)] font-mono">{formatBytes(file.size)}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs font-mono text-[var(--ink-muted)] py-2">
                <span className="px-2.5 py-1 bg-[var(--paper)] rounded border border-[var(--rule)] uppercase font-semibold">
                  PDF
                </span>
                <ArrowRight className="w-4 h-4 text-[var(--ink-muted)]" />
                <span className="px-2.5 py-1 bg-[var(--accent-soft)] text-[var(--accent)] font-semibold rounded border border-[var(--accent)]/30 uppercase">
                  XLSX (Excel)
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
                    label="Mengekstrak Tabel PDF ke Excel (.xlsx)..."
                    sublabel="Mohon tunggu sejenak, struktur baris dan kolom sedang dianalisis..."
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
                  Konversi ke Excel (.xlsx)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {resultBlob && file && (
          <ResultDownloadCard
            filename={`${getBaseFileName(file.name)}.xlsx`}
            blob={resultBlob}
            originalSize={file.size}
            actionText="Download Excel (.xlsx)"
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
