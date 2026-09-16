"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { resizeToTarget, ResizeTargetResult } from "@/lib/pdf/resizeToTarget";
import { readFileAsArrayBuffer, getBaseFileName, formatBytes } from "@/lib/utils/fileHelpers";
import { AlertCircle, FileText } from "lucide-react";

export default function ResizePdfMbPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetMb, setTargetMb] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("Resizing to target MB...");
  const [progressPercent, setProgressPercent] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<ResizeTargetResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = [1, 2, 5, 10];

  const handleFilesAccepted = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const handleResize = async () => {
    if (!file || targetMb <= 0) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressStatus("Analyzing PDF structure...");
    setProgressPercent(10);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const targetBytes = targetMb * 1024 * 1024;
      const res = await resizeToTarget(buffer, targetBytes, (status, percent) => {
        setProgressStatus(status);
        setProgressPercent(percent);
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to resize PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <ToolLayout
      title="Resize PDF to MB"
      description="Compress PDF to satisfy a Megabyte (MB) ceiling for email or document submission."
      category="Compress"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !result && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to resize to MB"
          subtitle="Click or drag a PDF file here (up to 50 MB)"
        />
      )}

      {/* Configuration State */}
      {file && !result && !isProcessing && (
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
                    {formatBytes(file.size)}
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

            {/* Target MB Input */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Target Maximum Size (MB):
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  min={0.5}
                  max={50}
                  step={0.5}
                  value={targetMb}
                  onChange={(e) => setTargetMb(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-paper rounded-md border border-rule font-mono text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-muted">
                  MB
                </span>
              </div>

              {/* Quick Presets */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-ink-muted">Quick presets:</span>
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetMb(preset)}
                    className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                      targetMb === preset
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-rule bg-surface hover:border-ink-muted text-ink-muted"
                    }`}
                  >
                    &le;{preset} MB
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
                onClick={handleResize}
                className="px-5 py-2 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                Resize to ~{targetMb} MB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          progress={progressPercent}
          label={progressStatus}
          sublabel="Running iterative image quality calibration in browser..."
        />
      )}

      {/* Result Download */}
      {result && file && (
        <div className="space-y-4">
          {result.warningNote && (
            <div className="max-w-md mx-auto p-3.5 rounded-md bg-paper border border-warning/30 text-xs text-ink-muted flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span>{result.warningNote}</span>
            </div>
          )}

          <ResultDownloadCard
            blob={new Blob([result.pdfBytes as unknown as BlobPart], { type: "application/pdf" })}
            fileName={`${getBaseFileName(file.name)}_${targetMb}mb.pdf`}
            originalSize={file.size}
            newSize={result.achievedBytes}
            onReset={handleReset}
            actionText="Download Resized PDF"
          />
        </div>
      )}
    </ToolLayout>
  );
}
