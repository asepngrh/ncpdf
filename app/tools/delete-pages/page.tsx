"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfThumbnailGrid, PageThumbnailItem } from "@/components/shared/PdfThumbnailGrid";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { deletePages } from "@/lib/pdf/deletePages";
import { readFileAsArrayBuffer, getBaseFileName } from "@/lib/utils/fileHelpers";
import { Trash2, AlertCircle } from "lucide-react";

export default function DeletePagesPage() {
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

  const selectedCount = pages.filter((p) => p.selected).length;

  const handleDelete = async () => {
    if (!pdfBytes || !file) return;

    if (selectedCount === 0) {
      setErrorMessage("Please select at least one page to delete.");
      return;
    }

    if (selectedCount === pages.length) {
      setErrorMessage("Cannot delete all pages from the PDF document.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const indicesToDelete = pages
        .filter((p) => p.selected)
        .map((p) => p.pageIndex);

      const prunedBytes = await deletePages(pdfBytes, indicesToDelete);
      const blob = new Blob([prunedBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to delete pages.");
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
      title="Delete Pages"
      description="Select and remove unwanted pages from your PDF document."
      category="Organize"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !resultBlob && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to delete pages"
          subtitle="Click or drag a PDF file here (up to 50 MB)"
        />
      )}

      {/* Workspace State: Preview & Select Pages to Delete */}
      {file && pdfBytes && !resultBlob && !isProcessing && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md bg-surface border border-rule">
            <div>
              <p className="text-sm font-medium text-ink truncate max-w-xs sm:max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-ink-muted">
                {selectedCount} of {pages.length} pages selected for deletion
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
                disabled={selectedCount === 0 || selectedCount === pages.length}
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-md bg-warning text-white text-xs font-medium hover:bg-warning/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete {selectedCount > 0 ? `${selectedCount} Pages` : "Selected"}
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
              Click checkboxes or thumbnails to mark pages for removal:
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
          label="Removing selected pages..."
          sublabel="Generating cleaner PDF document..."
        />
      )}

      {/* Download Result */}
      {resultBlob && file && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName={`${getBaseFileName(file.name)}_deleted_pages.pdf`}
          originalSize={file.size}
          onReset={handleReset}
          actionText="Download PDF without Deleted Pages"
        />
      )}
    </ToolLayout>
  );
}
