"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfPageEditor, OverlayElement } from "@/components/shared/PdfPageEditor";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { readFileAsArrayBuffer, PdfToolError } from "@/lib/utils/fileHelpers";
import { getPageCount } from "@/lib/pdf/pdfCore";
import { addImageToPdf } from "@/lib/pdf/addImageToPdf";
import { ImagePlus, Sparkles, Move } from "lucide-react";

export default function AddImageToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Image & Placement State
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [placementMode, setPlacementMode] = useState<"overlay" | "new-page">("overlay");
  const [overlayElement, setOverlayElement] = useState<OverlayElement | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1);
  const [pageScope, setPageScope] = useState<"current" | "all" | "custom">("current");
  const [customPagesText, setCustomPagesText] = useState<string>("");
  const [newPagePosition, setNewPagePosition] = useState<"start" | "end" | "after-page">("end");

  // Processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileAccepted = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const selected = files[0];
      setFile(selected);
      setErrorMessage(null);
      setResultBlob(null);

      const buffer = await readFileAsArrayBuffer(selected);
      setPdfBytes(buffer);
      const count = await getPageCount(buffer);
      setPageCount(count);
      setCurrentPage(1);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal membaca berkas PDF.");
    }
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;
    setImageName(imgFile.name);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);

      // Preload image to get natural dimensions
      const img = new Image();
      img.onload = () => {
        const maxWidth = 180;
        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const width = Math.round(img.naturalWidth * scale);
        const height = Math.round(img.naturalHeight * scale);

        setOverlayElement({
          id: "img-overlay",
          x: 50,
          y: 50,
          width,
          height,
          content: dataUrl,
          type: "image",
          rotation: 0,
          opacity: 1,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(imgFile);
  };

  const handleProcess = async () => {
    if (!pdfBytes || !file || !imageDataUrl) return;

    try {
      setIsProcessing(true);
      setProgress(10);
      setErrorMessage(null);

      let customPages: number[] | undefined;
      if (pageScope === "custom" && customPagesText.trim()) {
        customPages = customPagesText
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n >= 1 && n <= pageCount);
      }

      const outputBytes = await addImageToPdf(
        pdfBytes,
        {
          imageDataUrl,
          mode: placementMode,
          x: overlayElement?.x || 50,
          y: overlayElement?.y || 50,
          width: overlayElement?.width || 150,
          height: overlayElement?.height || 100,
          rotation,
          opacity,
          pageScope,
          targetPage: currentPage,
          customPages,
          newPagePosition,
        },
        (p) => setProgress(p)
      );

      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal menyisipkan gambar ke PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Add Image to PDF"
      description="Sisipkan gambar atau logo ke dokumen PDF. Atur posisi, ukuran, rotasi, dan transparansi dengan mudah."
      category="Edit"
      isClientSide={true}
      wide={true}
    >
      <div className="space-y-6">
        {!file && (
          <FileDropzone
            accept={{ "application/pdf": [".pdf"] }}
            multiple={false}
            onFilesAccepted={handleFileAccepted}
            title="Pilih atau drop PDF yang ingin disisipi gambar"
          />
        )}

        {file && !resultBlob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Page Editor */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--rule)] rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-base text-[var(--ink)]">
                  {placementMode === "overlay" ? "Drag & Resize Gambar di Halaman" : "Preview Halaman"}
                </h3>
                <span className="text-xs text-[var(--ink-muted)] font-mono">{file.name}</span>
              </div>

              <PdfPageEditor
                pdfBytes={pdfBytes}
                pageCount={pageCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                mode={placementMode === "overlay" && overlayElement ? "overlay" : "preview"}
                overlayElement={
                  overlayElement
                    ? {
                        ...overlayElement,
                        rotation,
                        opacity,
                      }
                    : null
                }
                onOverlayChange={(elem) => setOverlayElement(elem)}
              />

              {placementMode === "overlay" && overlayElement && (
                <div className="mt-3 p-2.5 bg-[var(--paper-muted)] rounded border border-[var(--rule)] text-xs text-[var(--ink-muted)] flex items-center gap-2">
                  <Move className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>
                    Geser kotak gambar di atas untuk memindahkan posisi. Tarik bulatan di sudut kanan bawah untuk mengubah ukuran.
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Upload Image & Settings */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-[var(--rule)] bg-[var(--surface)]">
                <CardContent className="p-5 space-y-4">
                  {/* Image Picker */}
                  <div>
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1.5">
                      1. Upload Gambar / Logo (PNG, JPG)
                    </label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageSelected}
                      className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--accent-soft)] file:text-[var(--accent)] hover:file:bg-[var(--accent-soft)]/80"
                    />
                    {imageName && (
                      <span className="text-[11px] font-mono text-[var(--accent)] block mt-1">
                        Gambar terpilih: {imageName}
                      </span>
                    )}
                  </div>

                  {imageDataUrl && (
                    <>
                      {/* Placement Mode */}
                      <div>
                        <label className="text-xs font-medium text-[var(--ink)] block mb-1.5">
                          2. Metode Penempatan
                        </label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={placementMode === "overlay" ? "default" : "outline"}
                            size="sm"
                            className="flex-1 text-xs h-8"
                            onClick={() => setPlacementMode("overlay")}
                          >
                            Tempel di Atas Halaman
                          </Button>
                          <Button
                            type="button"
                            variant={placementMode === "new-page" ? "default" : "outline"}
                            size="sm"
                            className="flex-1 text-xs h-8"
                            onClick={() => setPlacementMode("new-page")}
                          >
                            Sebagai Halaman Baru
                          </Button>
                        </div>
                      </div>

                      {placementMode === "overlay" ? (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                                Rotasi ({rotation}°)
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                step="15"
                                value={rotation}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="w-full h-2 bg-[var(--rule)] accent-[var(--accent)] rounded"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                                Opacity ({Math.round(opacity * 100)}%)
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={opacity}
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                className="w-full h-2 bg-[var(--rule)] accent-[var(--accent)] rounded"
                              />
                            </div>
                          </div>

                          {/* Scope */}
                          <div className="pt-2 border-t border-[var(--rule)]">
                            <label className="text-xs font-medium text-[var(--ink)] block mb-1.5">
                              Terapkan Ke Halaman
                            </label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              <Button
                                type="button"
                                variant={pageScope === "current" ? "default" : "outline"}
                                size="sm"
                                className="text-[11px] h-8"
                                onClick={() => setPageScope("current")}
                              >
                                Hal {currentPage} Saja
                              </Button>
                              <Button
                                type="button"
                                variant={pageScope === "all" ? "default" : "outline"}
                                size="sm"
                                className="text-[11px] h-8"
                                onClick={() => setPageScope("all")}
                              >
                                Semua Halaman
                              </Button>
                              <Button
                                type="button"
                                variant={pageScope === "custom" ? "default" : "outline"}
                                size="sm"
                                className="text-[11px] h-8"
                                onClick={() => setPageScope("custom")}
                              >
                                Tertentu
                              </Button>
                            </div>

                            {pageScope === "custom" && (
                              <Input
                                type="text"
                                value={customPagesText}
                                onChange={(e) => setCustomPagesText(e.target.value)}
                                placeholder="Contoh: 1, 2, 4"
                                className="font-mono text-xs"
                              />
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="pt-2 border-t border-[var(--rule)]">
                          <label className="text-xs font-medium text-[var(--ink)] block mb-1.5">
                            Posisi Halaman Baru
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              type="button"
                              variant={newPagePosition === "start" ? "default" : "outline"}
                              size="sm"
                              className="text-[11px] h-8"
                              onClick={() => setNewPagePosition("start")}
                            >
                              Halaman Pertama
                            </Button>
                            <Button
                              type="button"
                              variant={newPagePosition === "after-page" ? "default" : "outline"}
                              size="sm"
                              className="text-[11px] h-8"
                              onClick={() => setNewPagePosition("after-page")}
                            >
                              Setelah Hal {currentPage}
                            </Button>
                            <Button
                              type="button"
                              variant={newPagePosition === "end" ? "default" : "outline"}
                              size="sm"
                              className="text-[11px] h-8"
                              onClick={() => setNewPagePosition("end")}
                            >
                              Halaman Terakhir
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                      {errorMessage}
                    </div>
                  )}

                  {isProcessing && (
                    <div className="pt-2">
                      <ProgressBar
                        progress={progress}
                        label="Menyisipkan Gambar ke PDF..."
                        sublabel="Menyematkan layer gambar dengan skala dan transparansi yang dipilih..."
                      />
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setFile(null);
                        setPdfBytes(null);
                        setImageDataUrl(null);
                      }}
                      disabled={isProcessing}
                    >
                      Ganti PDF
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      onClick={handleProcess}
                      disabled={isProcessing || !imageDataUrl}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Sisipkan Gambar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {resultBlob && file && (
          <ResultDownloadCard
            filename={`image_added_${file.name}`}
            blob={resultBlob}
            originalSize={file.size}
            onReset={() => {
              setResultBlob(null);
              setFile(null);
              setPdfBytes(null);
              setImageDataUrl(null);
            }}
          />
        )}
      </div>
    </ToolLayout>
  );
}
