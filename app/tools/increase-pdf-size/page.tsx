"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { increasePdfSize } from "@/lib/pdf/increasePdfSize";
import { readFileAsArrayBuffer, getBaseFileName, formatBytes } from "@/lib/utils/fileHelpers";
import { AlertCircle, FileText } from "lucide-react";

export default function IncreasePdfSizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState<number>(1024); // 1 MB default
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [500, 1024, 2048, 5120];

  const handleFilesAccepted = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setResultBlob(null);
      setErrorMessage(null);

      const currentKb = Math.ceil(selected.size / 1024);
      if (currentKb >= targetKb) {
        setTargetKb(currentKb + 500);
      }
    }
  };

  const handleIncrease = async () => {
    if (!file || targetKb <= 0) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const targetBytes = targetKb * 1024;
      const increasedBytes = await increasePdfSize(buffer, targetBytes);
      const blob = new Blob([increasedBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to increase PDF size.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultBlob(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      title="Increase PDF Size"
      description="Safely expand PDF file size with compliant metadata padding to fulfill strict portal upload minimums."
      category="Compress"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !resultBlob && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to increase size"
          subtitle="Click or drag a PDF file here (up to 50 MB)"
        />
      )}

      {/* Configuration State */}
      {file && !resultBlob && !isProcessing && (
        <div className="space-y-6">
          <div className="p-5 rounded-md bg-surface border border-rule space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-ink-muted flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ink truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="font-mono text-xs text-ink-muted">
                    Current: {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-ink-muted hover:text-ink"
              >
                Change file
              </button>
            </div>

            {/* Target Size Input */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Target Minimum Size (KB):
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  min={Math.ceil(file.size / 1024)}
                  max={50000}
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-paper rounded-md border border-rule font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-muted">
                  KB ({formatBytes(targetKb * 1024)})
                </span>
              </div>

              {/* Quick Presets */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-ink-muted">Quick minimums:</span>
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetKb(preset)}
                    className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                      targetKb === preset
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-rule bg-surface hover:border-ink-muted text-ink-muted"
                    }`}
                  >
                    &ge;{preset >= 1024 ? `${preset / 1024} MB` : `${preset} KB`}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md bg-paper border border-warning/30 flex items-start gap-2.5 text-xs text-warning">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleIncrease}
                className="px-5 py-2 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                Increase Size to &ge;{formatBytes(targetKb * 1024)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          label="Injecting compliant metadata padding..."
          sublabel="Safely increasing byte size without altering document visual..."
        />
      )}

      {/* Result Download */}
      {resultBlob && file && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName={`${getBaseFileName(file.name)}_padded.pdf`}
          originalSize={file.size}
          newSize={resultBlob.size}
          onReset={handleReset}
          actionText="Download Expanded PDF"
        />
      )}
    </ToolLayout>
  );
}
