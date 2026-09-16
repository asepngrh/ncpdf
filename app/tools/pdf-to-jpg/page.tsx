"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import {
  readFileAsArrayBuffer,
  downloadBlob,
  getBaseFileName,
  formatBytes,
  PdfToolError,
} from "@/lib/utils/fileHelpers";
import { getPageCount } from "@/lib/pdf/pdfCore";
import {
  convertPdfToJpgPages,
  packageJpgResults,
  ConvertedJpgPage,
} from "@/lib/pdf/pdfToJpg";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  ArrowRight,
  FileText,
} from "lucide-react";

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);

  // Settings
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [quality, setQuality] = useState<number>(0.92);
  const [scale, setScale] = useState<number>(2.0);

  // Processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [convertedPages, setConvertedPages] = useState<ConvertedJpgPage[]>([]);
  const [resultPackage, setResultPackage] = useState<{
    blob: Blob;
    filename: string;
    isZip: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileAccepted = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const selected = files[0];
      setFile(selected);
      setErrorMessage(null);
      setConvertedPages([]);
      setResultPackage(null);

      const buffer = await readFileAsArrayBuffer(selected);
      setPdfBytes(buffer);
      const count = await getPageCount(buffer);
      setPageCount(count);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof PdfToolError
          ? err.userMessage
          : "Gagal membaca berkas PDF."
      );
    }
  };

  const handleConvert = async () => {
    if (!pdfBytes || !file) return;

    try {
      setIsProcessing(true);
      setProgress(5);
      setProgressStatus("Mempersiapkan dokumen PDF...");
      setErrorMessage(null);

      const pages = await convertPdfToJpgPages(
        pdfBytes,
        { format, scale, quality },
        (p, cur, total) => {
          setProgress(p);
          setProgressStatus(`Merender halaman ${cur} dari ${total}...`);
        }
      );

      setConvertedPages(pages);
      setProgressStatus("Mengemas gambar...");

      const baseName = getBaseFileName(file.name);
      const pkg = await packageJpgResults(pages, baseName);
      setResultPackage(pkg);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof PdfToolError
          ? err.userMessage
          : "Gagal mengonversi PDF ke gambar."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF ke JPG / PNG"
      description="Konversi setiap halaman dokumen PDF menjadi gambar JPG atau PNG berkualitas tinggi langsung di browser Anda."
      category="Convert"
      isClientSide={true}
      wide={true}
    >
      <div className="space-y-6">
        {!file && (
          <FileDropzone
            accept={{ "application/pdf": [".pdf"] }}
            multiple={false}
            onFilesAccepted={handleFileAccepted}
            title="Pilih atau drop PDF untuk dikonversi ke gambar"
            subtitle="Mendukung PDF 1 halaman maupun banyak halaman (multi-page)"
          />
        )}

        {file && !resultPackage && (
          <div className="border border-rule bg-surface rounded-lg max-w-xl mx-auto p-6 space-y-5 shadow-subtle">
            {/* File Info */}
            <div className="flex items-center gap-3 p-3 bg-paper rounded-md border border-rule">
              <FileText className="w-8 h-8 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {file.name}
                </div>
                <div className="text-xs text-ink-muted font-mono">
                  {formatBytes(file.size)} •{" "}
                  <strong className="text-ink font-semibold">
                    {pageCount} Halaman
                  </strong>
                </div>
              </div>
            </div>

            {/* Conversion Output Type Indicator */}
            <div className="flex items-center justify-center gap-3 text-xs font-mono text-ink-muted py-1">
              <span className="px-2.5 py-1 bg-paper rounded border border-rule uppercase font-semibold text-ink">
                PDF ({pageCount} Hal)
              </span>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
              <span className="px-2.5 py-1 bg-accent-soft text-accent font-semibold rounded border border-accent/30 uppercase">
                {pageCount > 1
                  ? `${format.toUpperCase()} (Arsip ZIP)`
                  : `${format.toUpperCase()} Image`}
              </span>
            </div>

            {/* Settings */}
            <div className="space-y-4 pt-2 border-t border-rule">
              {/* Format Toggle (JPG vs PNG) */}
              <div>
                <label className="text-xs font-medium text-ink block mb-1.5">
                  Format Output Gambar:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("jpg")}
                    className={`py-2 px-3 text-xs font-medium rounded-md border transition ${
                      format === "jpg"
                        ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                        : "bg-surface text-ink border-rule hover:bg-paper"
                    }`}
                  >
                    JPEG (.jpg) — Ukuran File Ringan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("png")}
                    className={`py-2 px-3 text-xs font-medium rounded-md border transition ${
                      format === "png"
                        ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                        : "bg-surface text-ink border-rule hover:bg-paper"
                    }`}
                  >
                    PNG (.png) — Kualitas Lossless
                  </button>
                </div>
              </div>

              {/* Quality Preset (For JPG) */}
              {format === "jpg" && (
                <div>
                  <label className="text-xs font-medium text-ink block mb-1.5">
                    Kualitas Kompresi JPG ({Math.round(quality * 100)}%):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuality(0.8)}
                      className={`py-1.5 text-xs rounded-md border transition ${
                        quality === 0.8
                          ? "bg-accent text-white border-accent font-medium"
                          : "bg-surface text-ink border-rule hover:bg-paper"
                      }`}
                    >
                      Standar (80%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuality(0.92)}
                      className={`py-1.5 text-xs rounded-md border transition ${
                        quality === 0.92
                          ? "bg-accent text-white border-accent font-medium"
                          : "bg-surface text-ink border-rule hover:bg-paper"
                      }`}
                    >
                      Tinggi (92%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuality(0.98)}
                      className={`py-1.5 text-xs rounded-md border transition ${
                        quality === 0.98
                          ? "bg-accent text-white border-accent font-medium"
                          : "bg-surface text-ink border-rule hover:bg-paper"
                      }`}
                    >
                      Maksimal (98%)
                    </button>
                  </div>
                </div>
              )}

              {/* Resolution / DPI */}
              <div>
                <label className="text-xs font-medium text-ink block mb-1.5">
                  Ketajaman Resolusi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScale(1.5)}
                    className={`py-1.5 text-xs rounded-md border transition ${
                      scale === 1.5
                        ? "bg-accent text-white border-accent font-medium"
                        : "bg-surface text-ink border-rule hover:bg-paper"
                    }`}
                  >
                    Normal (150 DPI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(2.0)}
                    className={`py-1.5 text-xs rounded-md border transition ${
                      scale === 2.0
                        ? "bg-accent text-white border-accent font-medium"
                        : "bg-surface text-ink border-rule hover:bg-paper"
                    }`}
                  >
                    High-Res (200 DPI - Tajam)
                  </button>
                </div>
              </div>
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
                  label="Mengonversi Halaman PDF ke Gambar JPG..."
                  sublabel="Rendering halaman PDF dengan resolusi tinggi..."
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => {
                  setFile(null);
                  setPdfBytes(null);
                }}
                disabled={isProcessing}
              >
                Ganti File
              </Button>
              <Button
                className="flex-1 text-xs"
                onClick={handleConvert}
                disabled={isProcessing}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Konversi {pageCount} Halaman ke {format.toUpperCase()}
              </Button>
            </div>
          </div>
        )}

        {/* Success View with Gallery & Result Card */}
        {resultPackage && file && (
          <div className="space-y-6">
            <ResultDownloadCard
              filename={resultPackage.filename}
              blob={resultPackage.blob}
              originalSize={file.size}
              onReset={() => {
                setResultPackage(null);
                setConvertedPages([]);
                setFile(null);
                setPdfBytes(null);
              }}
            />

            {/* Gallery of All Converted Pages */}
            <div className="bg-surface border border-rule rounded-lg p-5 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-display font-medium text-base text-ink">
                  Hasil Render ({convertedPages.length} Gambar)
                </h3>
                <span className="text-xs text-ink-muted">
                  Klik tombol unduh pada masing-masing halaman untuk menyimpan per lembar
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {convertedPages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="border border-rule rounded-lg overflow-hidden bg-surface flex flex-col group hover:shadow-md transition duration-150"
                  >
                    <div className="relative aspect-[3/4] bg-paper flex items-center justify-center overflow-hidden border-b border-rule">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.dataUrl}
                        alt={`Halaman ${page.pageNumber}`}
                        className="w-full h-full object-contain p-1"
                      />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-900/80 text-white rounded">
                        #{page.pageNumber}
                      </span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between bg-surface text-xs">
                      <span className="font-mono text-ink text-[11px]">
                        Hal {page.pageNumber}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] text-accent hover:text-accent hover:bg-accent-soft"
                        onClick={() =>
                          downloadBlob(
                            page.blob,
                            `${getBaseFileName(file.name)}_hal_${page.pageNumber}.${page.format}`
                          )
                        }
                      >
                        <Download className="w-3 h-3 mr-1" /> Unduh
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
