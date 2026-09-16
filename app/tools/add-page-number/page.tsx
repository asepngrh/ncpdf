"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfPageEditor } from "@/components/shared/PdfPageEditor";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { readFileAsArrayBuffer, formatBytes, PdfToolError } from "@/lib/utils/fileHelpers";
import { getPageCount } from "@/lib/pdf/pdfCore";
import { addPageNumbersToPdf, PageNumberPosition } from "@/lib/pdf/addPageNumber";
import { Hash, Sparkles, FileText, Check } from "lucide-react";

const POSITIONS: { id: PageNumberPosition; label: string; short: string }[] = [
  { id: "top-left", label: "Kiri Atas", short: "Top Left" },
  { id: "top-center", label: "Tengah Atas", short: "Top Center" },
  { id: "top-right", label: "Kanan Atas", short: "Top Right" },
  { id: "bottom-left", label: "Kiri Bawah", short: "Bottom Left" },
  { id: "bottom-center", label: "Tengah Bawah", short: "Bottom Center" },
  { id: "bottom-right", label: "Kanan Bawah", short: "Bottom Right" },
];

const FORMAT_PRESETS = [
  { label: "Halaman {page} dari {total}", value: "Page {page} of {total}" },
  { label: "{page} / {total}", value: "{page} / {total}" },
  { label: "{page}", value: "{page}" },
  { label: "- {page} -", value: "- {page} -" },
  { label: "Hal {page}", value: "Hal {page}" },
];

export default function AddPageNumberPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Settings
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [format, setFormat] = useState<string>("Page {page} of {total}");
  const [fontFamily, setFontFamily] = useState<"Helvetica" | "TimesRoman" | "Courier">("Helvetica");
  const [fontSize, setFontSize] = useState<number>(11);
  const [colorHex, setColorHex] = useState<string>("#333333");
  const [margin, setMargin] = useState<number>(28);
  const [startPageNumber, setStartPageNumber] = useState<number>(1);
  const [firstPageToNumber, setFirstPageToNumber] = useState<number>(1);

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

      const outputBytes = await addPageNumbersToPdf(
        pdfBytes,
        {
          position,
          format,
          fontFamily,
          fontSize,
          colorHex,
          margin,
          startPageNumber,
          firstPageToNumber,
        },
        (p) => setProgress(p)
      );

      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal menambahkan nomor halaman.");
    } finally {
      setIsProcessing(false);
    }
  };

  const previewText = format
    .replace(/{page}/g, String(startPageNumber + (currentPage - firstPageToNumber)))
    .replace(/{total}/g, String(pageCount - firstPageToNumber + 1));

  return (
    <ToolLayout
      title="Add Page Number"
      description="Tambahkan nomor halaman atau format kustom (Header / Footer) ke dokumen PDF Anda."
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
            title="Pilih atau drop PDF untuk diberi nomor halaman"
            subtitle="Pilih posisi, format penomoran, ukuran font, dan margin secara visual"
          />
        )}

        {file && !resultBlob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Preview */}
            <div className="lg:col-span-7 bg-surface border border-rule rounded-lg p-4 sm:p-5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-rule flex-wrap gap-2">
                <h3 className="font-display font-medium text-sm sm:text-base text-ink flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-accent" />
                  Live Preview Halaman {currentPage}
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
                mode="preview"
                customOverlayRender={(pageWidth, pageHeight, scale) => {
                  if (currentPage < firstPageToNumber) return null;

                  const isTop = position.startsWith("top");
                  const isLeft = position.includes("left");
                  const isRight = position.includes("right");

                  return (
                    <div
                      className="absolute pointer-events-none font-mono"
                      style={{
                        color: colorHex,
                        fontSize: `${fontSize * scale}px`,
                        fontFamily:
                          fontFamily === "TimesRoman"
                            ? "serif"
                            : fontFamily === "Courier"
                            ? "monospace"
                            : "sans-serif",
                        top: isTop ? `${margin * scale}px` : undefined,
                        bottom: !isTop ? `${margin * scale}px` : undefined,
                        left: isLeft ? `${margin * scale}px` : isRight ? undefined : "50%",
                        right: isRight ? `${margin * scale}px` : undefined,
                        transform: !isLeft && !isRight ? "translateX(-50%)" : undefined,
                        fontWeight: 500,
                      }}
                    >
                      {previewText}
                    </div>
                  );
                }}
              />
            </div>

            {/* Right Column: Settings Panel */}
            <div className="lg:col-span-5 border border-rule bg-surface rounded-lg p-5 space-y-4 shadow-subtle">
              {/* File Info */}
              <div className="flex items-center gap-2.5 p-2.5 bg-paper rounded-md border border-rule text-xs">
                <FileText className="w-4 h-4 text-accent shrink-0" />
                <span className="font-medium text-ink truncate flex-1">{file.name}</span>
                <span className="font-mono text-ink-muted shrink-0">{pageCount} Halaman</span>
              </div>

              {/* Position Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink block">
                  Posisi Nomor Halaman:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-paper rounded-lg border border-rule">
                  {POSITIONS.map((pos) => {
                    const isSelected = position === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPosition(pos.id)}
                        className={`py-2 px-1 text-center rounded-md border text-[11px] font-medium transition duration-120 ${
                          isSelected
                            ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                            : "bg-surface text-ink border-rule hover:bg-paper"
                        }`}
                      >
                        {pos.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format String & Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink block">
                  Format Penomoran:
                </label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  placeholder="Page {page} of {total}"
                  className="w-full h-9 px-3 text-xs bg-white text-slate-900 placeholder:text-slate-400 font-mono rounded-md border border-rule focus:outline-none focus:ring-2 focus:ring-accent"
                />

                {/* Format Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {FORMAT_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormat(p.value)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                        format === p.value
                          ? "bg-accent-soft text-accent border-accent/40 font-semibold"
                          : "bg-paper text-ink-muted border-rule hover:text-ink hover:bg-surface"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography & Font Settings */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rule">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Jenis Font:
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as any)}
                    className="w-full h-8 text-xs px-2 border border-rule rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="Helvetica">Helvetica (Sans)</option>
                    <option value="TimesRoman">Times New Roman (Serif)</option>
                    <option value="Courier">Courier (Mono)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-ink mb-1">
                    <span>Ukuran Font</span>
                    <span className="font-mono text-ink-muted">{fontSize}pt</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-rule accent-[#24406B] rounded cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Color & Margin Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Warna Teks:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-8 h-8 rounded border border-rule cursor-pointer p-0.5 bg-white shrink-0"
                    />
                    <span className="font-mono text-xs text-ink">{colorHex}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-ink mb-1">
                    <span>Jarak Margin</span>
                    <span className="font-mono text-ink-muted">{margin}pt</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full h-2 bg-rule accent-[#24406B] rounded cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Page Offsets & Starting Number */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rule">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Mulai Halaman ke-:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={firstPageToNumber || ""}
                    onChange={(e) => setFirstPageToNumber(Math.max(1, Number(e.target.value)))}
                    className="w-full h-8 px-2.5 text-xs font-mono bg-white text-slate-900 border border-rule rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="text-[10px] text-ink-muted block mt-0.5">
                    (Mis. 2 untuk lewati cover)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Angka Awal Nomor:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={startPageNumber || ""}
                    onChange={(e) => setStartPageNumber(Math.max(1, Number(e.target.value)))}
                    className="w-full h-8 px-2.5 text-xs font-mono bg-white text-slate-900 border border-rule rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="text-[10px] text-ink-muted block mt-0.5">
                    (Mis. mulai dari 1)
                  </span>
                </div>
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
                    label="Menyisipkan Nomor Halaman ke PDF..."
                    sublabel="Menyesuaikan penomoran dan posisi font pada seluruh halaman..."
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
                  Terapkan Penomoran
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Result Download Card */}
        {resultBlob && file && (
          <ResultDownloadCard
            filename={`numbered_${file.name}`}
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
