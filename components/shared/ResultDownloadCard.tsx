"use client";

import React from "react";
import { Download, Check, RotateCcw } from "lucide-react";
import { formatBytes, downloadBlob } from "@/lib/utils/fileHelpers";

export interface ResultDownloadCardProps {
  blob?: Blob | null;
  fileName?: string;
  filename?: string;
  title?: string;
  description?: string;
  fileSize?: number;
  originalSize?: number;
  newSize?: number;
  onReset: () => void;
  onDownload?: () => void;
  actionText?: string;
  downloadButtonText?: string;
}

export function ResultDownloadCard({
  blob,
  fileName,
  filename,
  title = "File Siap Diunduh",
  description,
  fileSize,
  originalSize,
  newSize,
  onReset,
  onDownload,
  actionText,
  downloadButtonText,
}: ResultDownloadCardProps) {
  const resolvedFileName = fileName || filename || "download.pdf";
  const actualNewSize = fileSize ?? newSize ?? (blob ? blob.size : 0);
  const hasReduction = Boolean(originalSize && originalSize > actualNewSize);
  const percentageSaved = hasReduction && originalSize
    ? Math.round(((originalSize - actualNewSize) / originalSize) * 100)
    : 0;

  // Dynamically resolve actionText if not explicitly overridden
  const ext = resolvedFileName.split(".").pop()?.toLowerCase();
  let defaultActionText = "Download File";
  if (ext === "pdf") defaultActionText = "Download PDF";
  else if (ext === "docx" || ext === "doc") defaultActionText = "Download Word (.docx)";
  else if (ext === "xlsx" || ext === "xls") defaultActionText = "Download Excel (.xlsx)";
  else if (ext === "zip") defaultActionText = "Download ZIP Archive";
  else if (ext === "jpg" || ext === "jpeg") defaultActionText = "Download JPG Image";

  const buttonText = downloadButtonText || actionText || defaultActionText;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (blob) {
      downloadBlob(blob, resolvedFileName);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg bg-surface border border-rule text-center shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
        <Check className="w-5 h-5" />
      </div>

      <h3 className="text-lg font-serif font-normal text-ink">
        {title}
      </h3>

      {description ? (
        <p className="mt-1 text-xs text-ink-muted">
          {description}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-ink-muted truncate max-w-xs mx-auto font-mono bg-accent-soft px-2 py-1 rounded border border-rule">
        {resolvedFileName}
      </p>

      {/* File Size Metadata */}
      {actualNewSize > 0 && (
        <div className="mt-5 p-3 rounded-md bg-paper border border-rule flex items-center justify-around font-mono text-xs">
          {originalSize ? (
            <div className="text-left">
              <span className="block text-[10px] text-ink-muted uppercase font-ui font-medium">
                Ukuran Awal
              </span>
              <span className="text-ink">{formatBytes(originalSize)}</span>
            </div>
          ) : null}

          {hasReduction && (
            <div className="text-center px-2.5 py-1 rounded bg-surface border border-rule text-xs text-emerald-700 dark:text-emerald-400 font-ui font-semibold shadow-xs">
              -{percentageSaved}%
            </div>
          )}

          <div className="text-right">
            <span className="block text-[10px] text-ink-muted uppercase font-ui font-medium">
              Hasil Akhir
            </span>
            <span className="text-ink font-semibold">{formatBytes(actualNewSize)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-3 px-5 rounded-md bg-accent text-white font-medium text-sm hover:opacity-90 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <Download className="w-4 h-4 text-white" />
          <span className="text-white font-medium">{buttonText}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2 px-4 rounded-md text-xs font-medium text-ink-muted hover:text-ink hover:bg-paper border border-transparent hover:border-rule transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Proses file lain
        </button>
      </div>
    </div>
  );
}
