"use client";

import React, { useState, useEffect } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { PdfPageEditor } from "@/components/shared/PdfPageEditor";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ResultDownloadCard } from "@/components/shared/ResultDownloadCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { readFileAsArrayBuffer, downloadBlob, PdfToolError } from "@/lib/utils/fileHelpers";
import { getPageCount } from "@/lib/pdf/pdfCore";
import { watermarkPdf, WatermarkOptions } from "@/lib/pdf/watermarkPdf";
import { Type, Image as ImageIcon, Sparkles, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Watermark state
  const [wmMode, setWmMode] = useState<"text" | "image">("text");
  const [text, setText] = useState<string>("CONFIDENTIAL");
  const [fontFamily, setFontFamily] = useState<"Helvetica" | "TimesRoman" | "Courier">("Helvetica");
  const [fontSize, setFontSize] = useState<number>(44);
  const [colorHex, setColorHex] = useState<string>("#888888");
  const [opacity, setOpacity] = useState<number>(0.35);
  const [rotation, setRotation] = useState<number>(45);
  const [layout, setLayout] = useState<"single" | "tile">("single");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [pageScope, setPageScope] = useState<"all" | "custom">("all");
  const [customPagesText, setCustomPagesText] = useState<string>("");

  // Image watermark state
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState<number>(0.6);

  // Processing state
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(imgFile);
  };

  const handleProcess = async () => {
    if (!pdfBytes || !file) return;

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

      let options: WatermarkOptions;
      if (wmMode === "text") {
        options = {
          type: "text",
          text: text.trim() || "WATERMARK",
          fontFamily,
          fontSize,
          colorHex,
          opacity,
          rotation,
          layout,
          textAlign,
          pageScope,
          customPages,
        };
      } else {
        if (!imageDataUrl) {
          throw new PdfToolError("No watermark image provided.", "Silakan upload gambar watermark terlebih dahulu.");
        }
        options = {
          type: "image",
          imageDataUrl,
          opacity,
          scale: imageScale,
          pageScope,
          customPages,
        };
      }

      const outputBytes = await watermarkPdf(pdfBytes, options, (p) => setProgress(p));
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal menambahkan watermark pada PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Watermark PDF"
      description="Tambahkan teks atau logo watermark kustom ke dokumen PDF Anda dengan live preview."
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
            title="Pilih atau drop PDF untuk diberi watermark"
          />
        )}

        {file && !resultBlob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Editor Preview */}
            <div className="lg:col-span-7 bg-surface border border-rule rounded-lg p-4 sm:p-5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-rule flex-wrap gap-2">
                <h3 className="font-display font-medium text-sm sm:text-base text-ink flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-accent" />
                  Live Preview Halaman {currentPage}
                </h3>
                <span className="text-xs text-ink-muted font-mono truncate max-w-[180px] sm:max-w-xs" title={file.name}>
                  {file.name}
                </span>
              </div>

              <PdfPageEditor
                pdfBytes={pdfBytes}
                pageCount={pageCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                mode="preview"
                customOverlayRender={(pageWidth, pageHeight, scale) => {
                  if (wmMode === "text") {
                    if (layout === "single") {
                      return (
                        <div
                          className={`w-full h-full flex items-center pointer-events-none p-8 ${
                            textAlign === "left"
                              ? "justify-start"
                              : textAlign === "right"
                              ? "justify-end"
                              : "justify-center"
                          }`}
                        >
                          <span
                            style={{
                              opacity,
                              color: colorHex,
                              fontFamily:
                                fontFamily === "TimesRoman"
                                  ? "serif"
                                  : fontFamily === "Courier"
                                  ? "monospace"
                                  : "sans-serif",
                              fontSize: `${fontSize * scale}px`,
                              fontWeight: 700,
                              transform: `rotate(-${rotation}deg)`,
                              textAlign,
                              display: "inline-block",
                            }}
                          >
                            {text}
                          </span>
                        </div>
                      );
                    } else {
                      // Tile pattern
                      const cols = 3;
                      const rows = 4;
                      return (
                        <div className="w-full h-full grid grid-cols-3 grid-rows-4 pointer-events-none p-2">
                          {Array.from({ length: cols * rows }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center overflow-hidden ${
                                textAlign === "left"
                                  ? "justify-start pl-2"
                                  : textAlign === "right"
                                  ? "justify-end pr-2"
                                  : "justify-center"
                              }`}
                            >
                              <span
                                style={{
                                  opacity,
                                  color: colorHex,
                                  fontFamily:
                                    fontFamily === "TimesRoman"
                                      ? "serif"
                                      : fontFamily === "Courier"
                                      ? "monospace"
                                      : "sans-serif",
                                  fontSize: `${fontSize * scale * 0.6}px`,
                                  fontWeight: 700,
                                  transform: `rotate(-${rotation}deg)`,
                                  textAlign,
                                  display: "inline-block",
                                }}
                              >
                                {text}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } else if (wmMode === "image" && imageDataUrl) {
                    return (
                      <div className="w-full h-full flex items-center justify-center pointer-events-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageDataUrl}
                          alt="Watermark"
                          style={{
                            opacity,
                            transform: `rotate(${rotation}deg) scale(${imageScale})`,
                            maxWidth: "80%",
                            maxHeight: "80%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </div>

            {/* Right Column: Settings & Controls */}
            <div className="lg:col-span-5 border border-rule bg-surface rounded-lg p-5 space-y-4 shadow-subtle">
              {/* Mode switch */}
              <div className="flex border border-rule rounded-lg p-1 bg-paper">
                <button
                  type="button"
                  onClick={() => setWmMode("text")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
                    wmMode === "text"
                      ? "bg-surface text-ink shadow-xs font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <Type className="w-3.5 h-3.5" /> Text Watermark
                </button>
                <button
                  type="button"
                  onClick={() => setWmMode("image")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
                    wmMode === "image"
                      ? "bg-surface text-ink shadow-xs font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Image / Logo
                </button>
              </div>

              {wmMode === "text" ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      Teks Watermark:
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Contoh: CONFIDENTIAL / DRAFT"
                      className="w-full h-9 px-3 text-xs bg-white text-slate-900 placeholder:text-slate-400 font-sans rounded-md border border-rule focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-ink block mb-1">
                        Font:
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value as any)}
                        className="w-full text-xs h-8 px-2 border border-rule rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="Helvetica">Helvetica (Sans)</option>
                        <option value="TimesRoman">Times New Roman (Serif)</option>
                        <option value="Courier">Courier (Monospace)</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium text-ink mb-1">
                        <span>Ukuran</span>
                        <span className="font-mono text-ink-muted">{fontSize}pt</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-rule accent-[#24406B] rounded cursor-pointer mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-ink block mb-1">
                        Warna:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colorHex}
                          onChange={(e) => setColorHex(e.target.value)}
                          className="w-8 h-8 rounded border border-rule cursor-pointer p-0.5 bg-white shrink-0"
                        />
                        <span className="font-mono text-xs text-ink">{colorHex}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium text-ink mb-1">
                        <span>Opacity</span>
                        <span className="font-mono text-ink-muted">{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="w-full h-2 bg-rule accent-[#24406B] rounded cursor-pointer mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-ink mb-1">
                        <span>Rotasi</span>
                        <span className="font-mono text-ink-muted">{rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full h-2 bg-rule accent-[#24406B] rounded cursor-pointer mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink block mb-1">
                        Pola Penempatan:
                      </label>
                      <div className="flex gap-1.5 p-1 bg-paper rounded-lg border border-rule">
                        <button
                          type="button"
                          onClick={() => setLayout("single")}
                          className={`flex-1 py-1 text-center rounded-md border text-[11px] font-medium transition ${
                            layout === "single"
                              ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                              : "bg-surface text-ink border-rule hover:bg-paper"
                          }`}
                        >
                          Tengah
                        </button>
                        <button
                          type="button"
                          onClick={() => setLayout("tile")}
                          className={`flex-1 py-1 text-center rounded-md border text-[11px] font-medium transition ${
                            layout === "tile"
                              ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                              : "bg-surface text-ink border-rule hover:bg-paper"
                          }`}
                        >
                          Tile (Grid)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">
                      Perataan Teks (Alignment):
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-paper rounded-lg border border-rule">
                      <button
                        type="button"
                        onClick={() => setTextAlign("left")}
                        title="Rata Kiri"
                        className={`py-1.5 px-2 text-center rounded-md border text-[11px] font-medium flex items-center justify-center gap-1.5 transition ${
                          textAlign === "left"
                            ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                            : "bg-surface text-ink border-rule hover:bg-paper"
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>Rata Kiri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign("center")}
                        title="Rata Tengah"
                        className={`py-1.5 px-2 text-center rounded-md border text-[11px] font-medium flex items-center justify-center gap-1.5 transition ${
                          textAlign === "center"
                            ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                            : "bg-surface text-ink border-rule hover:bg-paper"
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                        <span>Tengah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign("right")}
                        title="Rata Kanan"
                        className={`py-1.5 px-2 text-center rounded-md border text-[11px] font-medium flex items-center justify-center gap-1.5 transition ${
                          textAlign === "right"
                            ? "bg-[#24406B] text-white border-[#24406B] font-semibold shadow-xs"
                            : "bg-surface text-ink border-rule hover:bg-paper"
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                        <span>Rata Kanan</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                    <>
                      <div>
                        <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                          Upload Gambar / Logo (PNG, JPG)
                        </label>
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleImageUpload}
                          className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--accent-soft)] file:text-[var(--accent)] hover:file:bg-[var(--accent-soft)]/80"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                            Ukuran ({Math.round(imageScale * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0.2"
                            max="1.5"
                            step="0.05"
                            value={imageScale}
                            onChange={(e) => setImageScale(Number(e.target.value))}
                            className="w-full h-2 bg-[var(--rule)] accent-[var(--accent)] rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                            Opacity ({Math.round(opacity * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0.05"
                            max="1.0"
                            step="0.05"
                            value={opacity}
                            onChange={(e) => setOpacity(Number(e.target.value))}
                            className="w-full h-2 bg-[var(--rule)] accent-[var(--accent)] rounded"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Scope */}
                  <div className="pt-2 border-t border-[var(--rule)]">
                    <label className="text-xs font-medium text-[var(--ink)] block mb-1.5">
                      Terapkan Ke Halaman
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant={pageScope === "all" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => setPageScope("all")}
                      >
                        Semua Halaman ({pageCount})
                      </Button>
                      <Button
                        type="button"
                        variant={pageScope === "custom" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => setPageScope("custom")}
                      >
                        Halaman Tertentu
                      </Button>
                    </div>

                    {pageScope === "custom" && (
                      <Input
                        type="text"
                        value={customPagesText}
                        onChange={(e) => setCustomPagesText(e.target.value)}
                        placeholder="Contoh: 1, 3, 5"
                        className="font-mono text-xs"
                      />
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                      {errorMessage}
                    </div>
                  )}

                  {isProcessing && (
                    <div className="pt-2">
                      <ProgressBar
                        progress={progress}
                        label="Menerapkan Watermark ke PDF..."
                        sublabel="Menyematkan teks / gambar watermark di semua halaman..."
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
                      }}
                      disabled={isProcessing}
                    >
                      Ganti File
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      onClick={handleProcess}
                      disabled={isProcessing || (wmMode === "image" && !imageDataUrl)}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Terapkan Watermark
                    </Button>
                  </div>
            </div>
          </div>
        )}

        {resultBlob && file && (
          <ResultDownloadCard
            filename={`watermarked_${file.name}`}
            blob={resultBlob}
            originalSize={file.size}
            onReset={() => {
              setResultBlob(null);
              setFile(null);
              setPdfBytes(null);
            }}
          />
        )}
      </div>
    </ToolLayout>
  );
}
