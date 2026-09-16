"use client";

import React, { useState } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";
import { formatBytes } from "@/lib/utils/fileHelpers";

interface FileDropzoneProps {
  accept?: Accept;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesAccepted: (files: File[]) => void;
  selectedFiles?: File[];
  onFileRemoved?: (index: number) => void;
  title?: string;
  subtitle?: string;
}

export function FileDropzone({
  accept = { "application/pdf": [".pdf"] },
  multiple = false,
  maxSizeMB = 50,
  onFilesAccepted,
  selectedFiles = [],
  onFileRemoved,
  title = "Drop your PDF here",
  subtitle,
}: FileDropzoneProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const maxBytes = maxSizeMB * 1024 * 1024;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    maxSize: maxBytes,
    onDrop: (accepted, rejected) => {
      setErrorMessage(null);

      if (rejected.length > 0) {
        const firstError = rejected[0].errors[0];
        if (firstError?.code === "file-too-large") {
          setErrorMessage(`Ukuran file melebihi batas maksimal ${maxSizeMB} MB.`);
        } else if (firstError?.code === "file-invalid-type") {
          setErrorMessage("Format file tidak didukung. Silakan upload file PDF yang valid.");
        } else {
          setErrorMessage(firstError?.message || "File tidak valid. Silakan coba lagi.");
        }
        return;
      }

      if (accepted.length > 0) {
        onFilesAccepted(accepted);
      }
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`group relative flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.99] touch-manipulation ${
          isDragActive
            ? "border-accent bg-accent-soft ring-4 ring-accent/10"
            : "border-rule bg-surface hover:border-ink-muted hover:bg-paper/30 shadow-subtle"
        }`}
      >
        <input {...getInputProps()} />

        <div className="w-12 h-12 rounded-full bg-paper border border-rule flex items-center justify-center text-ink-muted group-hover:text-accent group-hover:scale-105 mb-3 transition-all">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm sm:text-base font-medium text-ink text-center px-2">
          {isDragActive ? "Lepaskan file untuk mengunggah..." : title}
        </p>

        <p className="mt-1 text-xs text-ink-muted text-center px-2">
          {subtitle || `Klik atau seret file ke sini (maksimal ${maxSizeMB} MB)`}
        </p>

        <button
          type="button"
          className="mt-4 px-5 py-2.5 text-xs font-semibold bg-[#24406B] text-white rounded-lg hover:bg-[#1a3052] transition-colors pointer-events-none shadow-xs"
        >
          Pilih {multiple ? "Beberapa File" : "File"}
        </button>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files Preview List */}
      {selectedFiles.length > 0 && (
        <div className="border border-rule rounded-lg bg-surface divide-y divide-rule shadow-subtle overflow-hidden">
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-3 text-xs gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="font-medium text-ink truncate max-w-[180px] sm:max-w-md">
                  {file.name}
                </span>
                <span className="font-mono text-ink-muted text-[11px] shrink-0">
                  ({formatBytes(file.size)})
                </span>
              </div>

              {onFileRemoved && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemoved(idx);
                  }}
                  className="p-1.5 text-ink-muted hover:text-red-600 rounded-md hover:bg-paper transition-colors shrink-0"
                  title="Hapus file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
