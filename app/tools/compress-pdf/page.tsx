"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { compressPdf } from "@/lib/pdf/compressPdf";
import { readFileAsArrayBuffer, getBaseFileName, formatBytes } from "@/lib/utils/fileHelpers";
import { AlertCircle, FileText } from "lucide-react";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [customQuality, setCustomQuality] = useState<number>(65);
  const [useCustomSlider, setUseCustomSlider] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("Compressing PDF...");
  const [progressPercent, setProgressPercent] = useState<number | undefined>(undefined);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesAccepted = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResultBlob(null);
      setErrorMessage(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressStatus("Preparing PDF document...");
    setProgressPercent(10);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const compressedBytes = await compressPdf(buffer, {
        level,
        customQuality: useCustomSlider ? customQuality / 100 : undefined,
        onProgress: (status, percent) => {
          setProgressStatus(status);
          setProgressPercent(percent);
        },
      });

      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Failed to compress PDF.");
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
      title="Compress PDF"
      description="Reduce PDF file size while keeping text sharp and selectable."
      category="Compress"
      isClientSide={true}
    >
      {/* Upload State */}
      {!file && !resultBlob && (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          title="Drop your PDF here to compress"
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

            {/* Compression Presets */}
            <div>
              <label className="block text-xs font-medium text-ink mb-2">
                Compression Level:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "low",
                    label: "Basic compression",
                    desc: "High quality, slight size reduction",
                  },
                  {
                    id: "medium",
                    label: "Recommended",
                    desc: "Balanced reduction & sharpness",
                  },
                  {
                    id: "high",
                    label: "Strong compression",
                    desc: "Smallest size, lower image quality",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLevel(opt.id as any);
                      setUseCustomSlider(false);
                    }}
                    className={`p-3 rounded-md border text-left transition-colors duration-120 ${
                      !useCustomSlider && level === opt.id
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-rule bg-surface hover:border-ink-muted text-ink-muted"
                    }`}
                  >
                    <p className="text-xs font-medium text-ink">{opt.label}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Quality Slider Option */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <button
                  type="button"
                  onClick={() => setUseCustomSlider(!useCustomSlider)}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  {useCustomSlider ? "Use presets" : "Set custom quality %"}
                </button>
                {useCustomSlider && (
                  <span className="font-mono text-xs text-ink">
                    {customQuality}%
                  </span>
                )}
              </div>

              {useCustomSlider && (
                <input
                  type="range"
                  min={15}
                  max={95}
                  value={customQuality}
                  onChange={(e) => setCustomQuality(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              )}
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
                onClick={handleCompress}
                className="px-5 py-2 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                Compress PDF
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
          sublabel="Re-encoding images while keeping text vector selectable..."
        />
      )}

      {/* Result Download */}
      {resultBlob && file && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName={`${getBaseFileName(file.name)}_compressed.pdf`}
          originalSize={file.size}
          onReset={handleReset}
          actionText="Download Compressed PDF"
        />
      )}
    </ToolLayout>
  );
}
