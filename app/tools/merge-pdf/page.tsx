"use client";

import React, { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { mergePdf } from "@/lib/pdf/mergePdf";
import { renderPageToCanvas, getPageCount } from "@/lib/pdf/pdfCore";
import { readFileAsArrayBuffer, formatBytes } from "@/lib/utils/fileHelpers";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Plus,
  AlertCircle,
  FileText,
  LayoutGrid,
  List,
  GripVertical,
  Loader2,
  Sparkles,
} from "lucide-react";

interface MergePdfItem {
  id: string;
  file: File;
  thumbnailUrl: string | null;
  pageCount: number;
  loading: boolean;
  buffer?: ArrayBuffer;
}

export default function MergePdfPage() {
  const [items, setItems] = useState<MergePdfItem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const activeRenders = useRef<{ [id: string]: boolean }>({});

  const handleFilesAccepted = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setErrorMessage(null);

    const newItems: MergePdfItem[] = newFiles.map((file, idx) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      thumbnailUrl: null,
      pageCount: 1,
      loading: true,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Load thumbnails asynchronously for newly added items
    for (const item of newItems) {
      activeRenders.current[item.id] = true;
      loadThumbnailForItem(item.id, item.file);
    }
  };

  const loadThumbnailForItem = async (id: string, file: File) => {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      if (!activeRenders.current[id]) return;

      const count = await getPageCount(buffer).catch(() => 1);
      const canvas = await renderPageToCanvas(buffer, 0, 0.4);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                thumbnailUrl: dataUrl,
                pageCount: count,
                loading: false,
                buffer,
              }
            : it
        )
      );
    } catch (err) {
      console.warn("Could not generate thumbnail for", file.name, err);
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, loading: false, pageCount: 1 } : it
        )
      );
    }
  };

  const moveItem = (index: number, direction: "up" | "down" | "left" | "right") => {
    const isForward = direction === "down" || direction === "right";
    const targetIndex = isForward ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const removeItem = (id: string) => {
    delete activeRenders.current[id];
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    e.preventDefault();

    const updated = [...items];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    setDraggedIndex(null);
    setItems(updated);
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setErrorMessage("Silakan pilih minimal 2 file PDF untuk digabungkan.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const buffers = await Promise.all(
        items.map(async (item) => {
          if (item.buffer) return item.buffer;
          return await readFileAsArrayBuffer(item.file);
        })
      );

      const mergedBytes = await mergePdf(buffers);
      const blob = new Blob([mergedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.userMessage || err.message || "Gagal menggabungkan file PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    activeRenders.current = {};
    setItems([]);
    setResultBlob(null);
    setErrorMessage(null);
  };

  const totalOriginalBytes = items.reduce((acc, it) => acc + it.file.size, 0);

  return (
    <ToolLayout
      title="Merge PDF"
      description="Gabungkan beberapa file PDF menjadi satu dokumen berurutan dengan preview visual real-time."
      category="Organize"
      isClientSide={true}
    >
      {/* Upload State */}
      {items.length === 0 && !resultBlob && (
        <FileDropzone
          multiple={true}
          onFilesAccepted={handleFilesAccepted}
          title="Pilih atau drop beberapa file PDF untuk digabungkan"
          subtitle="Pilih 2 atau lebih file PDF • Anda dapat mengatur urutan halaman dengan preview visual"
        />
      )}

      {/* Reorder & Merge State */}
      {items.length > 0 && !resultBlob && !isProcessing && (
        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-surface border border-rule space-y-5 shadow-subtle">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-rule">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">
                  Dokumen yang Digabung ({items.length})
                </span>
                <span className="text-xs text-ink-muted font-mono">
                  • Total {formatBytes(totalOriginalBytes)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switcher */}
                <div className="flex items-center border border-rule rounded-md bg-paper p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition ${
                      viewMode === "grid"
                        ? "bg-surface text-ink font-medium shadow-xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                    title="Tampilan Grid Preview"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition ${
                      viewMode === "list"
                        ? "bg-surface text-ink font-medium shadow-xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                    title="Tampilan List"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Daftar</span>
                  </button>
                </div>

                {/* Add More Files Button */}
                <label className="cursor-pointer text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 px-3 py-1.5 rounded-md border border-rule bg-surface hover:bg-paper transition">
                  <Plus className="w-3.5 h-3.5" />
                  Tambah File
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFilesAccepted(Array.from(e.target.files));
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Hint message */}
            <div className="text-xs text-ink-muted flex items-center justify-between">
              <span>💡 Tarik & lepas (drag and drop) kartu thumbnail untuk mengubah urutan gabungan secara instan.</span>
            </div>

            {/* Grid Preview Mode (Visual Thumbnails) */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`group relative flex flex-col p-2.5 rounded-lg bg-surface border transition-all duration-150 shadow-xs cursor-grab active:cursor-grabbing select-none ${
                      draggedIndex === idx
                        ? "border-accent ring-2 ring-accent opacity-50 scale-95"
                        : "border-rule hover:border-ink hover:shadow-md"
                    }`}
                  >
                    {/* Top Tag & Delete */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-paper border border-rule rounded text-ink">
                        #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="p-1 rounded text-ink-muted hover:text-red-600 hover:bg-red-50 transition"
                        title="Hapus file ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail Image Container */}
                    <div className="relative w-full aspect-[3/4] bg-paper rounded border border-rule/60 overflow-hidden flex items-center justify-center mb-2">
                      {item.loading ? (
                        <div className="flex flex-col items-center gap-1.5 text-ink-muted">
                          <Loader2 className="w-5 h-5 animate-spin text-accent" />
                          <span className="text-[10px] font-mono">Render...</span>
                        </div>
                      ) : item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt={item.file.name}
                          className="w-full h-full object-contain p-0.5 pointer-events-none"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-ink-muted/50" />
                      )}

                      {/* Page count pill */}
                      {item.pageCount > 0 && !item.loading && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono font-medium bg-slate-900/80 text-white rounded backdrop-blur-xs">
                          {item.pageCount} hal
                        </span>
                      )}
                    </div>

                    {/* File Title & Size */}
                    <div className="mt-auto">
                      <p
                        className="text-xs font-medium text-ink truncate text-center"
                        title={item.file.name}
                      >
                        {item.file.name}
                      </p>
                      <p className="text-[10px] text-ink-muted font-mono text-center">
                        {formatBytes(item.file.size)}
                      </p>
                    </div>

                    {/* Arrow Navigation Controls on hover / touch */}
                    <div className="mt-2 pt-1.5 border-t border-rule/70 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(idx, "left");
                        }}
                        className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-20 hover:bg-paper transition"
                        title="Geser ke kiri"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(idx, "right");
                        }}
                        className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-20 hover:bg-paper transition"
                        title="Geser ke kanan"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View Mode */}
            {viewMode === "list" && (
              <div className="border border-rule rounded-md divide-y divide-rule max-h-96 overflow-y-auto">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="flex items-center justify-between p-3 text-xs bg-surface hover:bg-paper/60 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GripVertical className="w-4 h-4 text-ink-muted shrink-0" />
                      <span className="font-mono text-ink-muted w-5">
                        {idx + 1}.
                      </span>

                      {/* Small thumbnail in list */}
                      <div className="w-8 h-10 bg-paper rounded border border-rule shrink-0 overflow-hidden flex items-center justify-center">
                        {item.loading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-accent" />
                        ) : item.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-ink-muted" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="font-medium text-ink truncate block max-w-xs sm:max-w-md">
                          {item.file.name}
                        </span>
                        <span className="font-mono text-[11px] text-ink-muted">
                          {item.pageCount} halaman • {formatBytes(item.file.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, "up")}
                        className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-20 hover:bg-paper"
                        title="Pindah ke atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => moveItem(idx, "down")}
                        className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-20 hover:bg-paper"
                        title="Pindah ke bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded text-ink-muted hover:text-red-600 hover:bg-paper ml-1"
                        title="Hapus dari daftar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-rule">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-ink-muted hover:text-ink transition"
              >
                Hapus Semua ({items.length})
              </button>

              <button
                type="button"
                disabled={items.length < 2}
                onClick={handleMerge}
                className="px-5 py-2.5 rounded-md bg-[#24406B] text-white text-xs font-semibold hover:bg-[#1a3052] disabled:opacity-40 transition shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gabungkan {items.length} PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <ProgressBar
          label="Menggabungkan dokumen PDF..."
          sublabel="Menyusun halaman sesuai urutan yang Anda tentukan..."
        />
      )}

      {/* Result Download Card */}
      {resultBlob && (
        <ResultDownloadCard
          blob={resultBlob}
          fileName="merged_document.pdf"
          originalSize={totalOriginalBytes}
          onReset={handleReset}
          actionText="Download PDF Hasil Gabungan"
        />
      )}
    </ToolLayout>
  );
}
