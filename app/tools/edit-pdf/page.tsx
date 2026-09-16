"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfInteractiveEditor } from "@/components/shared/PdfInteractiveEditor";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { readFileAsArrayBuffer, PdfToolError } from "@/lib/utils/fileHelpers";
import { getPageCount } from "@/lib/pdf/pdfCore";
import { applyPdfEdits, PdfEditElement } from "@/lib/pdf/editPdf";
import { FileText, Sparkles, Edit3, Type, Image as ImageIcon, Pen, Shapes } from "lucide-react";

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Edit elements dictionary (1-indexed page -> PdfEditElement[])
  const [pageEdits, setPageEdits] = useState<Record<number, PdfEditElement[]>>({});

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileAccepted = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const selected = files[0];
      setFile(selected);
      setErrorMessage(null);
      setResultBlob(null);
      setPageEdits({});

      const buffer = await readFileAsArrayBuffer(selected);
      setPdfBytes(buffer);
      const count = await getPageCount(buffer);
      setPageCount(count);
      setCurrentPage(1);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof PdfToolError ? err.userMessage : "Gagal membaca berkas PDF."
      );
    }
  };

  const handleProcess = async () => {
    if (!pdfBytes || !file) return;

    try {
      setIsProcessing(true);
      setProgress(15);
      setErrorMessage(null);

      const outputBytes = await applyPdfEdits(pdfBytes, pageEdits, (p) => setProgress(p));
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof PdfToolError ? err.userMessage : "Gagal menyimpan perubahan pada PDF."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Count total edits across all pages
  const totalEditsCount = Object.values(pageEdits).reduce(
    (acc, list) => acc + (list?.length || 0),
    0
  );

  return (
    <ToolLayout
      title="Edit PDF"
      description="Tambahkan teks, gambar, coretan tangan bebas, dan bentuk (shapes) ke dokumen PDF Anda secara visual."
      category="Edit"
      isClientSide={true}
      wide={true}
    >
      <div className="space-y-6">
        {!file && (
          <FileDropzone
            accept={{ "application/pdf": [".pdf"] }}
            multiple={false}
            onFilesAccepted={handleFileAccepted}
            title="Pilih atau drop PDF yang ingin diedit"
            subtitle="Tambahkan teks, gambar, tanda tangan, coretan, atau bentuk geometris"
          />
        )}

        {file && !resultBlob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Rich Interactive Canvas Editor */}
            <div className="lg:col-span-8 space-y-3">
              <PdfInteractiveEditor
                pdfBytes={pdfBytes}
                pageCount={pageCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageEdits={pageEdits}
                onPageEditsChange={setPageEdits}
              />
            </div>

            {/* Right Column: Actions & Document Details */}
            <div className="lg:col-span-4 border border-rule bg-surface rounded-lg p-5 space-y-4 shadow-subtle">
              {/* File Info */}
              <div className="flex items-center justify-between p-3 bg-paper rounded-md border border-rule text-xs">
                <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-medium text-ink truncate">{file.name}</span>
                </div>
                <span className="font-mono text-ink-muted shrink-0">{pageCount} Halaman</span>
              </div>

              {/* Elements Overview */}
              <div className="space-y-2 p-3 bg-paper rounded-md border border-rule text-xs">
                <div className="flex justify-between items-center text-ink font-medium pb-2 border-b border-rule">
                  <span>Ringkasan Perubahan:</span>
                  <span className="font-mono bg-[#24406B] text-white px-2 py-0.5 rounded-full text-[10px]">
                    {totalEditsCount} Elemen
                  </span>
                </div>

                <div className="space-y-1 text-ink-muted text-[11px] pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-accent" /> Teks:
                    </span>
                    <span className="font-mono">
                      {Object.values(pageEdits).flat().filter((e) => e?.type === "text").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-accent" /> Gambar:
                    </span>
                    <span className="font-mono">
                      {Object.values(pageEdits).flat().filter((e) => e?.type === "image").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Pen className="w-3.5 h-3.5 text-accent" /> Coretan (Draw):
                    </span>
                    <span className="font-mono">
                      {Object.values(pageEdits).flat().filter((e) => e?.type === "draw").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shapes className="w-3.5 h-3.5 text-accent" /> Bentuk (Shapes):
                    </span>
                    <span className="font-mono">
                      {Object.values(pageEdits).flat().filter((e) => e?.type === "shape").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick instructions */}
              <div className="p-3 bg-paper rounded-md border border-rule text-xs text-ink-muted space-y-1.5">
                <div className="font-medium text-ink flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-accent" />
                  Tips Mengedit:
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Gunakan ikon di toolbar atas untuk memilih alat.</li>
                  <li>Klik pada teks atau bentuk untuk mengatur ukuran & warna.</li>
                  <li>Tarik sudut elemen untuk membesarkan atau mengecilkan.</li>
                </ul>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                  {errorMessage}
                </div>
              )}

              {isProcessing && (
                <div className="pt-2">
                  <ProgressBar
                    progress={progress}
                    label="Menerapkan Perubahan ke PDF..."
                    sublabel="Menyusun teks, gambar, bentuk, dan rotasi ke dalam dokumen PDF..."
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3 border-t border-rule">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setFile(null);
                    setPdfBytes(null);
                    setPageEdits({});
                  }}
                  disabled={isProcessing}
                >
                  Ganti File
                </Button>
                <Button
                  className="flex-1 text-xs"
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Simpan PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Download Result Card */}
        {resultBlob && file && (
          <ResultDownloadCard
            filename={`edited_${file.name}`}
            blob={resultBlob}
            originalSize={file.size}
            onReset={() => {
              setResultBlob(null);
              setFile(null);
              setPdfBytes(null);
              setPageEdits({});
            }}
          />
        )}
      </div>
    </ToolLayout>
  );
}
