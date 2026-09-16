"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfPageEditor, CropBox } from "@/components/shared/PdfPageEditor";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { readFileAsArrayBuffer, formatBytes, PdfToolError } from "@/lib/utils/fileHelpers";
import { getPageCount, getPageDimensions } from "@/lib/pdf/pdfCore";
import { cropPdf } from "@/lib/pdf/cropPdf";
import { Crop, Sparkles, FileText, Info } from "lucide-react";

export default function CropPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [activePreset, setActivePreset] = useState<number | null>(40);

  // Crop state
  const [cropBox, setCropBox] = useState<CropBox>({
    x: 40,
    y: 40,
    width: 515,
    height: 760,
  });
  const [pageScope, setPageScope] = useState<"all" | "current" | "custom">("all");
  const [customPagesText, setCustomPagesText] = useState<string>("");

  // Processing
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

      const buffer = await readFileAsArrayBuffer(selected);
      setPdfBytes(buffer);
      const count = await getPageCount(buffer);
      setPageCount(count);
      setCurrentPage(1);

      // Detect actual page 1 dimensions
      const dims = await getPageDimensions(buffer, 0);
      setPageSize(dims);

      // Default crop box with 40pt margin based on actual page size
      const defaultMargin = 40;
      setActivePreset(40);
      setCropBox({
        x: defaultMargin,
        y: defaultMargin,
        width: Math.max(50, Math.round(dims.width - defaultMargin * 2)),
        height: Math.max(50, Math.round(dims.height - defaultMargin * 2)),
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal membaca berkas PDF.");
    }
  };

  const handleProcess = async () => {
    if (!pdfBytes || !file) return;

    try {
      setIsProcessing(true);
      setProgress(10);
      setErrorMessage(null);

      let customPages: number[] | undefined;
      if (pageScope === "custom" && customPagesText.trim()) {
        customPages = customPagesText
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n >= 1 && n <= pageCount);
      }

      const outputBytes = await cropPdf(
        pdfBytes,
        {
          cropBox,
          pageScope,
          targetPage: currentPage,
          customPages,
        },
        (p) => setProgress(p)
      );

      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal melakukan crop pada PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetMargin = (margin: number) => {
    setActivePreset(margin);
    if (margin === 0) {
      setCropBox({
        x: 0,
        y: 0,
        width: pageSize.width,
        height: pageSize.height,
      });
      return;
    }
    const newWidth = Math.max(50, Math.round(pageSize.width - margin * 2));
    const newHeight = Math.max(50, Math.round(pageSize.height - margin * 2));
    setCropBox({
      x: margin,
      y: margin,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleCropChange = (box: CropBox) => {
    setActivePreset(null);
    setCropBox(box);
  };

  return (
    <ToolLayout
      title="Crop PDF"
      description="Pangkas margin dan sesuaikan area dokumen PDF dengan kotak crop visual interaktif."
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
            title="Pilih atau drop PDF yang ingin dipangkas (crop)"
            subtitle="Sesuaikan margin dokumen dengan preview visual interaktif"
          />
        )}

        {file && !resultBlob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Visual Crop Editor */}
            <div className="lg:col-span-7 bg-surface border border-rule rounded-lg p-4 sm:p-5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-rule flex-wrap gap-2">
                <h3 className="font-display font-medium text-sm sm:text-base text-ink flex items-center gap-1.5">
                  <Crop className="w-4 h-4 text-accent" />
                  Visual Crop Area Halaman {currentPage}
                </h3>
                <span className="text-xs text-ink-muted font-mono truncate max-w-[180px] sm:max-w-xs" title={file.name}>
                  {file.name}
                </span>
              </div>

              <PdfPageEditor
                pdfBytes={pdfBytes}
                pageCount={pageCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                mode="crop"
                cropBox={cropBox}
                onCropChange={handleCropChange}
                onPageDimensionsChange={(dims) => setPageSize(dims)}
              />

              <div className="mt-3 p-2.5 bg-paper rounded-md border border-rule text-xs text-ink-muted flex items-start gap-2">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>
                  Tarik sudut atau tepi kotak putih pada preview untuk mengubah ukuran, atau geser area tengah untuk mengatur posisi crop.
                </span>
              </div>
            </div>

            {/* Right Column: Dimensions & Settings */}
            <div className="lg:col-span-5 border border-rule bg-surface rounded-lg p-5 space-y-4 shadow-subtle">
              {/* File Info */}
              <div className="flex items-center justify-between p-2.5 bg-paper rounded-md border border-rule text-xs">
                <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-medium text-ink truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-ink-muted shrink-0">
                  <span>{pageCount} Hal</span>
                  <span>•</span>
                  <span>{pageSize.width}×{pageSize.height}pt</span>
                </div>
              </div>

              {/* Preset Margin Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink block">
                  Pilihan Cepat Margin:
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-paper rounded-lg border border-rule">
                  {[
                    { label: "Penuh (0)", margin: 0 },
                    { label: "Tipis (20)", margin: 20 },
                    { label: "Standar (40)", margin: 40 },
                    { label: "Lebar (70)", margin: 70 },
                  ].map((preset) => (
                    <button
                      key={preset.margin}
                      type="button"
                      onClick={() => handlePresetMargin(preset.margin)}
                      className={`py-1.5 px-1 text-center rounded-md border text-[11px] font-mono transition ${
                        activePreset === preset.margin
                          ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                          : "bg-surface text-ink border-rule hover:bg-paper"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Coordinate Inputs */}
              <div className="pt-2 border-t border-rule space-y-2">
                <label className="text-xs font-medium text-ink block">
                  Koordinat Area Crop (PDF Points):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-ink-muted font-mono block mb-1">X (Kiri):</span>
                    <input
                      type="number"
                      value={cropBox.x}
                      onChange={(e) => {
                        setActivePreset(null);
                        setCropBox({ ...cropBox, x: Math.max(0, Number(e.target.value)) });
                      }}
                      className="w-full h-8 px-2.5 text-xs font-mono bg-white text-slate-900 border border-rule rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-mono block mb-1">Y (Atas):</span>
                    <input
                      type="number"
                      value={cropBox.y}
                      onChange={(e) => {
                        setActivePreset(null);
                        setCropBox({ ...cropBox, y: Math.max(0, Number(e.target.value)) });
                      }}
                      className="w-full h-8 px-2.5 text-xs font-mono bg-white text-slate-900 border border-rule rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-mono block mb-1">Lebar (Width):</span>
                    <input
                      type="number"
                      value={cropBox.width}
                      onChange={(e) => {
                        setActivePreset(null);
                        setCropBox({ ...cropBox, width: Math.max(30, Number(e.target.value)) });
                      }}
                      className="w-full h-8 px-2.5 text-xs font-mono bg-white text-slate-900 border border-rule rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted font-mono block mb-1">Tinggi (Height):</span>
                    <input
                      type="number"
                      value={cropBox.height}
                      onChange={(e) => {
                        setActivePreset(null);
                        setCropBox({ ...cropBox, height: Math.max(30, Number(e.target.value)) });
                      }}
                      className="w-full h-8 px-2.5 text-xs font-mono bg-white text-slate-900 border border-rule rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Scope */}
              <div className="pt-2 border-t border-rule space-y-2">
                <label className="text-xs font-medium text-ink block">
                  Terapkan Crop Ke:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-paper rounded-lg border border-rule">
                  <button
                    type="button"
                    onClick={() => setPageScope("all")}
                    className={`py-1.5 px-2 text-center rounded-md border text-[11px] font-medium transition ${
                      pageScope === "all"
                        ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                        : "bg-surface text-ink border-rule hover:bg-paper"
                    }`}
                  >
                    Semua Hal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageScope("current")}
                    className={`py-1.5 px-2 text-center rounded-md border text-[11px] font-medium transition ${
                      pageScope === "current"
                        ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                        : "bg-surface text-ink border-rule hover:bg-paper"
                    }`}
                  >
                    Hal {currentPage} Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageScope("custom")}
                    className={`py-1.5 px-2 text-center rounded-md border text-[11px] font-medium transition ${
                      pageScope === "custom"
                        ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                        : "bg-surface text-ink border-rule hover:bg-paper"
                    }`}
                  >
                    Tertentu
                  </button>
                </div>

                {pageScope === "custom" && (
                  <input
                    type="text"
                    value={customPagesText}
                    onChange={(e) => setCustomPagesText(e.target.value)}
                    placeholder="Contoh: 1, 2, 4"
                    className="w-full h-8 px-2.5 text-xs font-mono bg-white text-slate-900 border border-rule rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                )}
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
                    label="Memotong Margin Halaman PDF..."
                    sublabel="Menyesuaikan batas crop area pada semua halaman..."
                  />
                </div>
              )}

              <div className="pt-2 flex gap-3 border-t border-rule">
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
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Pangkas PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Result Download Card */}
        {resultBlob && file && (
          <ResultDownloadCard
            filename={`cropped_${file.name}`}
            blob={resultBlob}
            originalSize={file.size}
            onReset={() => {
              setResultBlob(null);
              setFile(null);
              setPdfBytes(null);
            }}
          />
        )}
      </div>
    </ToolLayout>
  );
}
