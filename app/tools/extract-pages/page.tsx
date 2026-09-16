"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfThumbnailGrid, PageThumbnailItem } from "@/components/shared/PdfThumbnailGrid";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { extractPagesToSinglePdf, extractPagesToZip } from "@/lib/pdf/extractPages";
import { readFileAsArrayBuffer, getBaseFileName } from "@/lib/utils/fileHelpers";
import { Scissors, Archive, AlertCircle } from "lucide-react";

export default function ExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageThumbnailItem[]>([]);
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

  const selectedIndices = pages
    .filter((p) => p.selected)
    .map((p) => p.pageIndex);

  const selectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const clearSelection = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  const handleExtractSingle = async () => {
    if (!pdfBytes || selectedIndices.length === 0) {
      setErrorMessage("Please select at least one page to extract.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const extractedBytes = await extractPagesToSinglePdf(pdfBytes, selectedIndices);
      const blob = new Blob([extractedBytes as unknown as BlobPart], { type: "application/pdf" });
      setIsZipResult(false);
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to extract pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractZip = async () => {
    if (!pdfBytes || selectedIndices.length === 0 || !file) {
      setErrorMessage("Please select at least one page to extract.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const baseName = getBaseFileName(file.name);
      const zipBlob = await extractPagesToZip(pdfBytes, selectedIndices, baseName);
      setIsZipResult(true);
      setResultBlob(zipBlob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to extract pages to ZIP.");
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
      title="Extract Pages"
      description="Select specific pages from your PDF to save as a new document or separate files."
      category="Organize"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !resultBlob && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to extract pages"
          subtitle="Click or drag a PDF file here (up to 50 MB)"
        />
      )}

      {/* Workspace State: Preview & Select Pages */}
      {file && pdfBytes && !resultBlob && !isProcessing && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md bg-surface border border-rule">
            <div>
              <p className="text-sm font-medium text-ink truncate max-w-xs sm:max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-ink-muted">
                {selectedIndices.length} of {pages.length} pages selected
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-2.5 py-1.5 rounded-md border border-rule text-xs font-medium text-ink hover:bg-paper transition-colors"
              >
                Select all
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="px-2.5 py-1.5 rounded-md border border-rule text-xs font-medium text-ink-muted hover:text-ink hover:bg-paper transition-colors"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={selectedIndices.length === 0}
                onClick={handleExtractSingle}
                className="px-3.5 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5" />
                Extract to 1 PDF
              </button>

              <button
                type="button"
                disabled={selectedIndices.length === 0}
                onClick={handleExtractZip}
                className="px-3.5 py-1.5 rounded-md border border-rule text-xs font-medium text-ink hover:bg-paper disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5 text-accent" />
                Extract as ZIP
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-paper border border-warning/30 flex items-start gap-2.5 text-xs text-warning">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selectable Thumbnail Grid */}
          <div className="space-y-2">
            <p className="text-xs text-ink-muted">
              Select the pages you wish to extract:
            </p>
            <PdfThumbnailGrid
              pdfBytes={pdfBytes}
              pages={pages.length > 0 ? pages : undefined}
              selectable={true}
              onPagesChange={setPages}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          label="Extracting chosen pages..."
          sublabel="Creating new document..."
        />
      )}

      {/* Download Result */}
      {resultBlob && file && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName={
            isZipResult
              ? `${getBaseFileName(file.name)}_extracted.zip`
              : `${getBaseFileName(file.name)}_extracted.pdf`
          }
          originalSize={file.size}
          onReset={handleReset}
          actionText={
            isZipResult ? "Download ZIP Archive" : "Download Extracted PDF"
          }
        />
      )}
    </ToolLayout>
  );
}
