"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfPageEditor, OverlayElement } from "@/components/shared/PdfPageEditor";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readFileAsArrayBuffer, PdfToolError } from "@/lib/utils/fileHelpers";
import { getPageCount } from "@/lib/pdf/pdfCore";
import { highlightPdf, HighlightItem } from "@/lib/pdf/highlightPdf";
import { Highlighter, Trash2, Undo, Sparkles } from "lucide-react";

const PRESET_COLORS = [
  { hex: "#FFEB3B", name: "Kuning" },
  { hex: "#81C784", name: "Hijau" },
  { hex: "#64B5F6", name: "Biru" },
  { hex: "#F48FB1", name: "Pink" },
  { hex: "#FFB74D", name: "Oranye" },
  { hex: "#BA68C8", name: "Ungu" },
];

export default function HighlightPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Highlighting state
  const [allHighlights, setAllHighlights] = useState<HighlightItem[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("#FFEB3B");
  const [currentOpacity, setCurrentOpacity] = useState<number>(0.45);

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
      setAllHighlights([]);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal membaca berkas PDF.");
    }
  };

  // Highlights on current page
  const currentPageHighlights = allHighlights.filter((h) => h.pageNumber === currentPage);

  const handleCurrentPageHighlightsChange = (newCurrentHighlights: OverlayElement[]) => {
    const otherPageHighlights = allHighlights.filter((h) => h.pageNumber !== currentPage);
    const updated = [
      ...otherPageHighlights,
      ...newCurrentHighlights.map((h) => ({ ...h, pageNumber: currentPage })),
    ];
    setAllHighlights(updated);
  };

  const handleUndo = () => {
    if (allHighlights.length === 0) return;
    setAllHighlights(allHighlights.slice(0, -1));
  };

  const handleClearAll = () => {
    setAllHighlights([]);
  };

  const handleProcess = async () => {
    if (!pdfBytes || !file || allHighlights.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(10);
      setErrorMessage(null);

      const outputBytes = await highlightPdf(pdfBytes, allHighlights, (p) => setProgress(p));
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal menyimpan highlight ke PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Highlight PDF"
      description="Tandai dan sorot teks penting pada dokumen PDF dengan berbagai pilihan warna dan transparansi."
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
            title="Pilih atau drop PDF yang ingin di-highlight"
          />
        )}

        {file && !resultBlob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Page Drawing */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--rule)] rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-base text-[var(--ink)]">Tandai Area Highlight</h3>
                <span className="text-xs text-[var(--ink-muted)] font-mono">{file.name}</span>
              </div>

              <PdfPageEditor
                pdfBytes={pdfBytes}
                pageCount={pageCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                mode="highlight"
                highlights={currentPageHighlights}
                onHighlightsChange={handleCurrentPageHighlightsChange}
                currentHighlightColor={currentColor}
                currentHighlightOpacity={currentOpacity}
              />

              <div className="mt-3 p-2.5 bg-[var(--paper-muted)] rounded border border-[var(--rule)] text-xs text-[var(--ink-muted)] flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <span>
                  Klik dan drag kursor mouse di atas halaman PDF untuk membuat kotak highlight. Arahkan mouse ke highlight untuk menghapus.
                </span>
              </div>
            </div>

            {/* Right Column: Palette & Annotations List */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-[var(--rule)] bg-[var(--surface)]">
                <CardContent className="p-5 space-y-4">
                  {/* Color Palette */}
                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1.5">
                      Pilihan Warna Highlight
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setCurrentColor(c.hex)}
                          className={`py-1.5 px-2 text-xs rounded border flex items-center gap-2 transition ${
                            currentColor === c.hex
                              ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium"
                              : "border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--paper-muted)]"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[11px] text-[var(--ink)]">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity & Custom Color */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--rule)]">
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Warna Kustom
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => setCurrentColor(e.target.value)}
                          className="w-8 h-8 rounded border border-[var(--rule)] cursor-pointer p-0.5"
                        />
                        <span className="font-mono text-xs text-[var(--ink-muted)]">{currentColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Opacity ({Math.round(currentOpacity * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0.2"
                        max="0.8"
                        step="0.05"
                        value={currentOpacity}
                        onChange={(e) => setCurrentOpacity(Number(e.target.value))}
                        className="w-full h-2 bg-[var(--rule)] accent-[var(--accent)] rounded"
                      />
                    </div>
                  </div>

                  {/* Highlights Summary & Actions */}
                  <div className="pt-2 border-t border-[var(--rule)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--ink)]">
                        Daftar Sorotan ({allHighlights.length} total)
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={handleUndo}
                          disabled={allHighlights.length === 0}
                          title="Undo sorotan terakhir"
                        >
                          <Undo className="w-3.5 h-3.5 mr-1" /> Undo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-red-600 hover:text-red-700"
                          onClick={handleClearAll}
                          disabled={allHighlights.length === 0}
                          title="Hapus semua sorotan"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Reset
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[var(--rule)] rounded p-2 bg-[var(--paper-muted)] text-xs">
                      {allHighlights.length === 0 ? (
                        <div className="text-[11px] text-[var(--ink-muted)] text-center py-3">
                          Belum ada highlight. Drag di atas halaman PDF untuk mulai menyorot.
                        </div>
                      ) : (
                        allHighlights.map((hl, idx) => (
                          <div
                            key={hl.id}
                            className="flex items-center justify-between p-1.5 bg-[var(--surface)] border border-[var(--rule)] rounded text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full border border-black/20"
                                style={{ backgroundColor: hl.color }}
                              />
                              <span className="font-mono text-[var(--ink)]">
                                #{idx + 1} — Hal {hl.pageNumber} ({Math.round(hl.width)}x{Math.round(hl.height)}pt)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAllHighlights(allHighlights.filter((h) => h.id !== hl.id))}
                              className="text-red-600 hover:text-red-700 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
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
                        label="Menerapkan Highlight ke Dokumen..."
                        sublabel="Memproses stabilo pada area teks PDF yang dipilih..."
                      />
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setFile(null);
                        setPdfBytes(null);
                        setAllHighlights([]);
                      }}
                      disabled={isProcessing}
                    >
                      Ganti PDF
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      onClick={handleProcess}
                      disabled={isProcessing || allHighlights.length === 0}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Terapkan Highlight
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {resultBlob && file && (
          <ResultDownloadCard
            filename={`highlighted_${file.name}`}
            blob={resultBlob}
            originalSize={file.size}
            onReset={() => {
              setResultBlob(null);
              setFile(null);
              setPdfBytes(null);
              setAllHighlights([]);
            }}
          />
        )}
      </div>
    </ToolLayout>
  );
}
