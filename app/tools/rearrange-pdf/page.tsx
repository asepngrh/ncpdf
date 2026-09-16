"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfThumbnailGrid, PageThumbnailItem } from "@/components/shared/PdfThumbnailGrid";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { rearrangePages } from "@/lib/pdf/rearrangePages";
import { readFileAsArrayBuffer, getBaseFileName } from "@/lib/utils/fileHelpers";
import { ArrowRightLeft, AlertCircle } from "lucide-react";

export default function RearrangePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageThumbnailItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
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

  const handleSaveOrder = async () => {
    if (!pdfBytes || !file || pages.length === 0) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const newOrder = pages.map((p) => p.pageIndex);
      const rearrangedBytes = await rearrangePages(pdfBytes, newOrder);
      const blob = new Blob([rearrangedBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to rearrange pages.");
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
      title="Rearrange Pages"
      description="Drag and drop page thumbnails to reorder pages in your PDF document."
      category="Organize"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !resultBlob && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to rearrange pages"
          subtitle="Click or drag a PDF file here (up to 50 MB)"
        />
      )}

      {/* Workspace State: Preview & Drag Reorder */}
      {file && pdfBytes && !resultBlob && !isProcessing && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md bg-surface border border-rule">
            <div>
              <p className="text-sm font-medium text-ink truncate max-w-xs sm:max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-ink-muted">
                {pages.length} pages total • Drag thumbnails or use arrows to change position
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-md border border-rule text-xs font-medium text-ink-muted hover:text-ink hover:bg-paper transition-colors"
              >
                Change file
              </button>

              <button
                type="button"
                onClick={handleSaveOrder}
                className="px-4 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Save New Order
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-paper border border-warning/30 flex items-start gap-2.5 text-xs text-warning">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Draggable Thumbnail Grid */}
          <PdfThumbnailGrid
            pdfBytes={pdfBytes}
            pages={pages.length > 0 ? pages : undefined}
            canReorder={true}
            onPagesChange={setPages}
          />
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          label="Saving new page order..."
          sublabel="Reconstructing PDF document..."
        />
      )}

      {/* Download Result */}
      {resultBlob && file && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName={`${getBaseFileName(file.name)}_reordered.pdf`}
          originalSize={file.size}
          onReset={handleReset}
          actionText="Download Reordered PDF"
        />
      )}
    </ToolLayout>
  );
}
