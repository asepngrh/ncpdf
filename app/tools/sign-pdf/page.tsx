"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { signPdf } from "@/lib/pdf/signPdf";
import { PenTool, Type, Upload, Eraser, Sparkles, Calendar } from "lucide-react";

export default function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Signature Creation State
  const [sigMode, setSigMode] = useState<"draw" | "type" | "upload">("draw");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [typedName, setTypedName] = useState<string>("");
  const [typedFont, setTypedFont] = useState<string>("cursive");
  const [typedColor, setTypedColor] = useState<string>("#1a1a2e");

  // Date addition
  const [includeDate, setIncludeDate] = useState<boolean>(true);
  const [dateText, setDateText] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  });
  const [datePosition, setDatePosition] = useState<"below" | "right">("below");

  // Overlay Element
  const [overlayElement, setOverlayElement] = useState<OverlayElement | null>(null);

  // Drawing Canvas Ref
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

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

  // Drawing Canvas Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = typedColor;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (drawCanvasRef.current) {
      applySignatureDataUrl(drawCanvasRef.current.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
    setOverlayElement(null);
  };

  // Render Typed Signature to DataURL
  const generateTypedSignature = useCallback((text: string, font: string, color: string) => {
    if (!text.trim()) return;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let fontStyle = "italic 46px 'Brush Script MT', 'Dancing Script', cursive";
    if (font === "formal") {
      fontStyle = "italic 40px 'Lucida Handwriting', 'Segoe Script', cursive";
    } else if (font === "modern") {
      fontStyle = "italic 44px 'Pacifico', 'Caveat', cursive";
    }

    ctx.font = fontStyle;
    ctx.fillText(text, 200, 80);

    const dataUrl = canvas.toDataURL("image/png");
    applySignatureDataUrl(dataUrl);
  }, []);

  useEffect(() => {
    if (sigMode === "type" && typedName.trim()) {
      generateTypedSignature(typedName, typedFont, typedColor);
    }
  }, [sigMode, typedName, typedFont, typedColor, generateTypedSignature]);

  const applySignatureDataUrl = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setOverlayElement({
      id: "sig-overlay",
      x: 60,
      y: 120,
      width: 150,
      height: 65,
      content: dataUrl,
      type: "signature",
    });
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      applySignatureDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!pdfBytes || !file || !signatureDataUrl || !overlayElement) return;

    try {
      setIsProcessing(true);
      setProgress(10);
      setErrorMessage(null);

      const outputBytes = await signPdf(
        pdfBytes,
        {
          signatureDataUrl,
          x: overlayElement.x,
          y: overlayElement.y,
          width: overlayElement.width,
          height: overlayElement.height,
          targetPage: currentPage,
          dateText: includeDate ? dateText : undefined,
          datePosition,
        },
        (p) => setProgress(p)
      );

      const blob = new Blob([outputBytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err: unknown) {
      setErrorMessage(err instanceof PdfToolError ? err.userMessage : "Gagal menandatangani PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Sign PDF"
      description="Tandatangani dokumen PDF secara langsung dengan menggambar, mengetik, atau mengunggah tanda tangan."
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
            title="Pilih atau drop PDF yang ingin ditandatangani"
          />
        )}

        {file && !resultBlob && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Page Placement */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--rule)] rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-base text-[var(--ink)]">
                  {signatureDataUrl ? "Atur Posisi Tanda Tangan" : "Preview Halaman"}
                </h3>
                <span className="text-xs text-[var(--ink-muted)] font-mono">{file.name}</span>
              </div>

              <PdfPageEditor
                pdfBytes={pdfBytes}
                pageCount={pageCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                mode={signatureDataUrl ? "overlay" : "preview"}
                overlayElement={overlayElement}
                onOverlayChange={(elem) => setOverlayElement(elem)}
                customOverlayRender={(pageWidth, pageHeight, scale) => {
                  if (!includeDate || !overlayElement || !signatureDataUrl) return null;

                  const isRight = datePosition === "right";
                  const dateX = isRight ? (overlayElement.x + overlayElement.width + 10) * scale : overlayElement.x * scale;
                  const dateY = isRight
                    ? (overlayElement.y + overlayElement.height / 2 - 6) * scale
                    : (overlayElement.y + overlayElement.height + 6) * scale;

                  return (
                    <div
                      className="absolute font-sans text-[11px] text-[var(--ink-muted)] font-mono pointer-events-none"
                      style={{
                        left: `${dateX}px`,
                        top: `${dateY}px`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dateText}
                    </div>
                  );
                }}
              />

              {signatureDataUrl && (
                <div className="mt-3 p-2.5 bg-[var(--paper-muted)] rounded border border-[var(--rule)] text-xs text-[var(--ink-muted)]">
                  💡 Geser tanda tangan ke posisi yang diinginkan (mis. di atas kolom nama/materai). Tarik sudut kanan bawah untuk mengubah ukuran.
                </div>
              )}
            </div>

            {/* Right Column: Signature Creation & Controls */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-[var(--rule)] bg-[var(--surface)]">
                <CardContent className="p-5 space-y-4">
                  {/* Mode Tabs */}
                  <div className="flex border border-[var(--rule)] rounded p-1 bg-[var(--paper-muted)]">
                    <button
                      type="button"
                      onClick={() => setSigMode("draw")}
                      className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition ${
                        sigMode === "draw"
                          ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm font-semibold"
                          : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" /> Draw
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigMode("type")}
                      className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition ${
                        sigMode === "type"
                          ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm font-semibold"
                          : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" /> Type
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigMode("upload")}
                      className={`flex-1 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition ${
                        sigMode === "upload"
                          ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm font-semibold"
                          : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                  </div>

                  {/* Mode 1: Draw */}
                  {sigMode === "draw" && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-[var(--ink)]">
                          Goreskan tanda tangan Anda:
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px] text-red-600 px-2"
                          onClick={clearCanvas}
                        >
                          <Eraser className="w-3 h-3 mr-1" /> Clear
                        </Button>
                      </div>
                      <div className="border border-[var(--rule)] rounded bg-white overflow-hidden touch-none">
                        <canvas
                          ref={drawCanvasRef}
                          width={360}
                          height={140}
                          className="w-full h-[140px] cursor-crosshair block"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Type */}
                  {sigMode === "type" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                          Nama Anda
                        </label>
                        <Input
                          type="text"
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                          placeholder="Masukkan nama lengkap..."
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "cursive", label: "Cursive" },
                          { id: "formal", label: "Formal" },
                          { id: "modern", label: "Modern" },
                        ].map((font) => (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => setTypedFont(font.id)}
                            className={`py-2 px-1 text-xs rounded border transition ${
                              typedFont === font.id
                                ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--ink)]"
                                : "border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--paper-muted)]"
                            }`}
                          >
                            {font.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Upload */}
                  {sigMode === "upload" && (
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1.5">
                        Upload Berkas Tanda Tangan (PNG Transparan)
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleUploadSignature}
                        className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--accent-soft)] file:text-[var(--accent)] hover:file:bg-[var(--accent-soft)]/80"
                      />
                    </div>
                  )}

                  {/* Color & Ink Options */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--rule)]">
                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Warna Tinta
                      </label>
                      <div className="flex gap-2">
                        {[
                          { color: "#1a1a2e", name: "Hitam" },
                          { color: "#002b80", name: "Biru" },
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setTypedColor(c.color)}
                            className={`flex-1 py-1 text-xs rounded border flex items-center justify-center gap-1.5 ${
                              typedColor === c.color
                                ? "border-[var(--accent)] bg-[var(--accent-soft)] font-medium"
                                : "border-[var(--rule)]"
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[var(--ink)] block mb-1">
                        Halaman Target
                      </label>
                      <span className="font-mono text-xs block py-1 text-[var(--ink)]">
                        Halaman {currentPage} dari {pageCount}
                      </span>
                    </div>
                  </div>

                  {/* Date Stamp Option */}
                  <div className="pt-2 border-t border-[var(--rule)] space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDate}
                        onChange={(e) => setIncludeDate(e.target.checked)}
                        className="rounded border-[var(--rule)] accent-[var(--accent)]"
                      />
                      <span className="text-xs font-medium text-[var(--ink)] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" /> Bubuhkan Tanggal Otomatis
                      </span>
                    </label>

                    {includeDate && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          value={dateText}
                          onChange={(e) => setDateText(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                        <select
                          value={datePosition}
                          onChange={(e) => setDatePosition(e.target.value as any)}
                          className="h-8 text-xs px-2 border border-[var(--rule)] rounded bg-[var(--surface)]"
                        >
                          <option value="below">Di Bawah TTD</option>
                          <option value="right">Di Kanan TTD</option>
                        </select>
                      </div>
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
                        label="Menyematkan Tanda Tangan ke PDF..."
                        sublabel="Memproses tanda tangan digital pada koordinat yang ditentukan..."
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
                        setSignatureDataUrl(null);
                        setOverlayElement(null);
                      }}
                      disabled={isProcessing}
                    >
                      Ganti PDF
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      onClick={handleProcess}
                      disabled={isProcessing || !signatureDataUrl}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Terapkan Tanda Tangan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {resultBlob && file && (
          <ResultDownloadCard
            filename={`signed_${file.name}`}
            blob={resultBlob}
            originalSize={file.size}
            onReset={() => {
              setResultBlob(null);
              setFile(null);
              setPdfBytes(null);
              setSignatureDataUrl(null);
              setOverlayElement(null);
            }}
          />
        )}
      </div>
    </ToolLayout>
  );
}
