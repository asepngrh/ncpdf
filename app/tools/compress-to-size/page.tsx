"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { readFileAsArrayBuffer, getBaseFileName, formatBytes, PdfToolError } from "@/lib/utils/fileHelpers";
import { resizeToTarget } from "@/lib/pdf/resizeToTarget";
import { Sparkles, FileText, ShieldCheck, AlertCircle } from "lucide-react";

const SIZE_PRESETS = [
  { label: "< 100 KB", value: 100, unit: "KB" as const },
  { label: "< 200 KB", value: 200, unit: "KB" as const },
  { label: "< 300 KB", value: 300, unit: "KB" as const },
  { label: "< 500 KB", value: 500, unit: "KB" as const },
  { label: "< 1 MB", value: 1, unit: "MB" as const },
  { label: "< 2 MB", value: 2, unit: "MB" as const },
  { label: "< 5 MB", value: 5, unit: "MB" as const },
];

export default function CompressToSizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetValue, setTargetValue] = useState<number>(300);
  const [targetUnit, setTargetUnit] = useState<"KB" | "MB">("KB");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>("Mengompresi PDF...");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [achievedBytes, setAchievedBytes] = useState<number>(0);
  const [warningNote, setWarningNote] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileAccepted = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setErrorMessage(null);
    setWarningNote(null);
    setResultBlob(null);

    // Auto preset reasonable target: 50% of current size or 300 KB
    const originalKb = Math.round(selected.size / 1024);
    if (originalKb > 1024) {
      setTargetValue(Math.max(1, Math.round(originalKb / 2048)));
      setTargetUnit("MB");
    } else {
      setTargetValue(Math.max(50, Math.round(originalKb / 2)));
      setTargetUnit("KB");
    }
  };

  const handleApplyPreset = (value: number, unit: "KB" | "MB") => {
    setTargetValue(value);
    setTargetUnit(unit);
  };

  const handleCompress = async () => {
    if (!file) return;

    if (!targetValue || targetValue <= 0) {
      setErrorMessage("Harap masukkan target ukuran yang valid (lebih dari 0).");
      return;
    }

    try {
      setIsProcessing(true);
      setProgressPercent(10);
      setProgressStatus("Mempersiapkan dokumen PDF...");
      setErrorMessage(null);
      setWarningNote(null);

      const targetBytes =
        targetUnit === "MB"
          ? targetValue * 1024 * 1024
          : targetValue * 1024;

      const buffer = await readFileAsArrayBuffer(file);

      const result = await resizeToTarget(buffer, targetBytes, (status, pct) => {
        setProgressStatus(status);
        if (pct !== undefined) setProgressPercent(pct);
      });

      const blob = new Blob([result.pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });

      setResultBlob(blob);
      setAchievedBytes(result.achievedBytes);
      if (result.warningNote) {
        setWarningNote(result.warningNote);
      }
      setProgressPercent(100);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof PdfToolError
          ? err.userMessage
          : "Gagal mengompresi PDF ke ukuran target."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compress PDF ke Ukuran Kustom"
      description="Kecilkan ukuran file PDF secara presisi ke batas target yang Anda inginkan (KB / MB atau < 1MB) langsung di browser."
      category="Compress"
      isClientSide={true}
    >
      <div className="space-y-6">
        {!file && (
          <FileDropzone
            accept={{ "application/pdf": [".pdf"] }}
            multiple={false}
            onFilesAccepted={handleFileAccepted}
            title="Pilih atau drop PDF yang ingin dikompresi ke ukuran kustom"
          />
        )}

        {file && !resultBlob && (
          <div className="border border-rule bg-surface rounded-lg max-w-xl mx-auto p-6 space-y-5 shadow-subtle">
            {/* File Info Card */}
            <div className="flex items-center gap-3 p-3 bg-paper rounded-md border border-rule">
              <FileText className="w-7 h-7 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">{file.name}</div>
                <div className="text-xs text-ink-muted font-mono">
                  Ukuran Awal: <strong className="text-ink">{formatBytes(file.size)}</strong>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-ink block">
                Pilihan Cepat Target Ukuran:
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZE_PRESETS.map((preset) => {
                  const isSelected =
                    targetValue === preset.value && targetUnit === preset.unit;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(preset.value, preset.unit)}
                      className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
                        isSelected
                          ? "bg-accent text-white border-accent font-semibold shadow-xs"
                          : "bg-surface text-ink border-rule hover:bg-paper"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Input Form */}
            <div className="pt-3 border-t border-rule space-y-2">
              <label className="text-xs font-medium text-ink block">
                Atau Masukkan Target Ukuran Manual:
              </label>
              <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={10}
                    max={100000}
                    step={1}
                    value={targetValue || ""}
                    onChange={(e) => setTargetValue(e.target.value === "" ? 0 : Number(e.target.value))}
                    placeholder="Contoh: 300"
                    className="w-full h-9 px-3 pr-10 text-sm bg-white text-slate-900 placeholder:text-slate-400 rounded-md border border-rule font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-ink-muted pointer-events-none select-none">
                    {targetUnit}
                  </span>
                </div>

                {/* Unit Selector */}
                <div className="flex h-9 border border-rule rounded-md overflow-hidden bg-paper p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTargetUnit("KB")}
                    className={`px-3 text-xs font-mono font-medium rounded transition ${
                      targetUnit === "KB"
                        ? "bg-surface text-ink shadow-xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    KB
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUnit("MB")}
                    className={`px-3 text-xs font-mono font-medium rounded transition ${
                      targetUnit === "MB"
                        ? "bg-surface text-ink shadow-xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    MB
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted pt-0.5 max-w-sm">
                <span>Target: &lt; {targetValue || 0} {targetUnit}</span>
                <span>
                  Perkiraan reduksi: ~
                  {Math.max(
                    0,
                    Math.round(
                      ((file.size -
                        (targetUnit === "MB"
                          ? (targetValue || 0) * 1024 * 1024
                          : (targetValue || 0) * 1024)) /
                        file.size) *
                        100
                    )
                  )}
                  %
                </span>
              </div>
            </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {errorMessage}
                </div>
              )}

              {isProcessing && (
                <div className="pt-2">
                  <ProgressBar
                    progress={progressPercent}
                    label="Mengompres PDF ke Target Ukuran..."
                    sublabel="Mengoptimalkan resolusi dan struktur stream PDF..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    setFile(null);
                    setResultBlob(null);
                  }}
                  disabled={isProcessing}
                >
                  Ganti File
                </Button>
                <Button
                  className="flex-1 text-xs"
                  onClick={handleCompress}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Kompres ke {targetValue} {targetUnit}
                </Button>
              </div>
          </div>
        )}

        {/* Result Card */}
        {resultBlob && file && (
          <div className="space-y-4">
            {warningNote && (
              <div className="max-w-md mx-auto p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Catatan Batas Kompresi:</span>
                  {warningNote}
                </div>
              </div>
            )}

            <ResultDownloadCard
              filename={`compressed_${file.name}`}
              blob={resultBlob}
              originalSize={file.size}
              newSize={achievedBytes || resultBlob.size}
              actionText="Download Compressed PDF"
              onReset={() => {
                setResultBlob(null);
                setFile(null);
                setWarningNote(null);
              }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
