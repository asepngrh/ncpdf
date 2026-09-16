"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfThumbnailGrid, PageThumbnailItem } from "@/components/shared/PdfThumbnailGrid";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { splitPdfByRange, splitPdfToZip } from "@/lib/pdf/splitPdf";
import { readFileAsArrayBuffer, getBaseFileName } from "@/lib/utils/fileHelpers";
import { Scissors, Archive, AlertCircle } from "lucide-react";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageThumbnailItem[]>([]);
  const [mode, setMode] = useState<"range" | "all">("range");
  const [rangeInput, setRangeInput] = useState<string>("1-2");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isZipResult, setIsZipResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesAccepted = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setResultBlob(null);
      setErrorMessage(null);

      const buffer = await readFileAsArrayBuffer(selected);
      setPdfBytes(buffer);
    }
  };

  const handlePagesLoaded = (loadedPages: PageThumbnailItem[]) => {
    setPages(loadedPages);
    if (loadedPages.length > 0) {
      setRangeInput(
        loadedPages.length > 1 ? `1-${Math.min(loadedPages.length, 2)}` : "1"
      );
    }
  };

  const handlePageSelect = (pageIndex: number) => {
    // Sync checked pages with range input
    const selectedPageNums = pages
      .map((p) => (p.pageIndex === pageIndex ? { ...p, selected: !p.selected } : p))
      .filter((p) => p.selected)
      .map((p) => p.pageNumber);

    if (selectedPageNums.length > 0) {
      setRangeInput(selectedPageNums.join(", "));
    }
  };

  const handleSplit = async () => {
    if (!pdfBytes || !file) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const baseName = getBaseFileName(file.name);

      if (mode === "range") {
        const slicedBytes = await splitPdfByRange(pdfBytes, rangeInput);
        const blob = new Blob([slicedBytes], { type: "application/pdf" });
        setIsZipResult(false);
        setResultBlob(blob);
      } else {
        const zipBlob = await splitPdfToZip(pdfBytes, baseName);
        setIsZipResult(true);
        setResultBlob(zipBlob);
      }
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfBytes(null);
    setPages([]);
    setResultBlob(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific page ranges into a new PDF or split every page into separate files."
      category="Organize"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !resultBlob && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to split"
          subtitle="Click or drag a PDF file here (up to 50 MB)"
        />
      )}

      {/* Configuration & Preview Workspace */}
      {file && pdfBytes && !resultBlob && !isProcessing && (
        <div className="space-y-6">
          <div className="p-5 rounded-md bg-surface border border-rule space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rule">
              <div>
                <p className="text-sm font-medium text-ink truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-ink-muted">
                  {pages.length} pages total
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-ink-muted hover:text-ink text-left"
              >
                Change file
              </button>
            </div>

            {/* Split Mode Choice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("range")}
                className={`p-3 rounded-md border text-left transition-colors duration-120 ${
                  mode === "range"
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-rule bg-surface hover:border-ink-muted text-ink-muted"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-ink">
                  <Scissors className="w-3.5 h-3.5 text-accent" />
                  Extract page range
                </div>
                <p className="text-[11px] text-ink-muted mt-1">
                  Extract chosen pages (e.g. 1-3, 5) into one PDF
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode("all")}
                className={`p-3 rounded-md border text-left transition-colors duration-120 ${
                  mode === "all"
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-rule bg-surface hover:border-ink-muted text-ink-muted"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-ink">
                  <Archive className="w-3.5 h-3.5 text-accent" />
                  Split all pages (ZIP)
                </div>
                <p className="text-[11px] text-ink-muted mt-1">
                  Save every page as an individual PDF file
                </p>
              </button>
            </div>

            {/* Range Input Field */}
            {mode === "range" && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-medium text-ink">
                  Page range (e.g. 1-3, 5, 7):
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="1-3, 5"
                  className="w-full px-3 py-2 text-xs bg-paper rounded-md border border-rule text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-[11px] text-ink-muted">
                  You can also click page thumbnails below to select/deselect pages.
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-md bg-paper border border-warning/30 flex items-start gap-2.5 text-xs text-warning">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSplit}
                className="px-5 py-2 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                {mode === "range" ? "Extract Pages" : "Split into ZIP"}
              </button>
            </div>
          </div>

          {/* Thumbnail Grid with selectable mode */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-ink">
              Page Preview (Click to select for range):
            </p>
            <PdfThumbnailGrid
              pdfBytes={pdfBytes}
              pages={pages.length > 0 ? pages : undefined}
              selectable={mode === "range"}
              onPagesChange={handlePagesLoaded}
              onPageSelect={handlePageSelect}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          label="Splitting PDF document..."
          sublabel="Extracting pages in browser..."
        />
      )}

      {/* Download Result */}
      {resultBlob && file && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName={
            isZipResult
              ? `${getBaseFileName(file.name)}_pages.zip`
              : `${getBaseFileName(file.name)}_split.pdf`
          }
          onReset={handleReset}
          actionText={
            isZipResult ? "Download ZIP Archive" : "Download Split PDF"
          }
        />
      )}
    </ToolLayout>
  );
}
