"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfThumbnailGrid, PageThumbnailItem } from "@/components/shared/PdfThumbnailGrid";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { rotatePdf } from "@/lib/pdf/rotatePdf";
import { readFileAsArrayBuffer, getBaseFileName } from "@/lib/utils/fileHelpers";
import { useProcessInWorker } from "@/lib/pdf/useProcessInWorker";
import { RotateCw, RotateCcw, AlertCircle } from "lucide-react";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageThumbnailItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isWorkerReady, runTask } = useProcessInWorker();

  const handleFilesAccepted = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setResultBlob(null);
      setErrorMessage(null);

      const buffer = await readFileAsArrayBuffer(selected);
      setPdfBytes(buffer);

      if (isWorkerReady) {
        try {
          await runTask("ECHO", { ready: true });
        } catch (e) {
          // fallback
        }
      }
    }
  };

  const handleRotateAll = (degreesToAdd: number) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + degreesToAdd + 360) % 360,
      }))
    );
  };

  const handleSaveRotated = async () => {
    if (!pdfBytes || !file) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const rotations = pages.map((p) => ({
        pageIndex: p.pageIndex,
        rotation: p.rotation,
      }));

      const rotatedBytes = await rotatePdf(pdfBytes, rotations);
      const blob = new Blob([rotatedBytes], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to rotate PDF.");
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
      title="Rotate PDF"
      description="Rotate individual PDF pages or all pages at once."
      category="Organize"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !resultBlob && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to rotate pages"
          subtitle="Click or drag a PDF file here (up to 50 MB)"
        />
      )}

      {/* Workspace State: Preview & Rotate Controls */}
      {file && pdfBytes && !resultBlob && !isProcessing && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-md bg-surface border border-rule">
            <div>
              <p className="text-sm font-medium text-ink truncate max-w-xs sm:max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-ink-muted">
                {pages.length > 0 ? `${pages.length} pages` : "Loading pages..."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotateAll(-90)}
                className="px-3 py-1.5 rounded-md border border-rule text-xs font-medium text-ink hover:bg-paper transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                -90° All
              </button>

              <button
                type="button"
                onClick={() => handleRotateAll(90)}
                className="px-3 py-1.5 rounded-md border border-rule text-xs font-medium text-ink hover:bg-paper transition-colors flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                +90° All
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-md border border-rule text-xs font-medium text-ink-muted hover:text-ink hover:bg-paper transition-colors"
              >
                Change file
              </button>

              <button
                type="button"
                onClick={handleSaveRotated}
                className="px-4 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                Save Rotated PDF
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-paper border border-warning/30 flex items-start gap-2.5 text-xs text-warning">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Thumbnail Grid */}
          <PdfThumbnailGrid
            pdfBytes={pdfBytes}
            pages={pages.length > 0 ? pages : undefined}
            canRotate={true}
            canReorder={false}
            onPagesChange={setPages}
          />
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <ProgressBar
          label="Applying page rotations..."
          sublabel="Saving rotated PDF document..."
        />
      )}

      {/* Result Download State */}
      {resultBlob && file && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName={`${getBaseFileName(file.name)}_rotated.pdf`}
          originalSize={file.size}
          onReset={handleReset}
          actionText="Download Rotated PDF"
        />
      )}
    </ToolLayout>
  );
}
