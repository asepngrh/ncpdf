"use client";

import React, { useRef, useState, useEffect } from "react";
import { Pen, Type, Upload, RotateCcw, Check } from "lucide-react";

interface SignaturePadProps {
  onSignatureReady: (dataUrl: string) => void;
}

export function SignaturePad({ onSignatureReady }: SignaturePadProps) {
  const [tab, setTab] = useState<"draw" | "type" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type signature state
  const [typedName, setTypedName] = useState("");
  const [fontFamily, setFontFamily] = useState("cursive");
  const [penColor, setPenColor] = useState("#0f172a");

  // Draw setup
  useEffect(() => {
    if (tab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [tab, penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const applyDrawSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSignatureReady(dataUrl);
  };

  const applyTypeSignature = () => {
    if (!typedName) return;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = penColor;
    ctx.font = `italic 64px ${fontFamily}, cursive, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, 300, 100);

    const dataUrl = canvas.toDataURL("image/png");
    onSignatureReady(dataUrl);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onSignatureReady(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setTab("draw")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
            tab === "draw"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Pen className="w-4 h-4" />
          Gambar Tangan
        </button>

        <button
          type="button"
          onClick={() => setTab("type")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
            tab === "type"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Type className="w-4 h-4" />
          Ketik Nama
        </button>

        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-all ${
            tab === "upload"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Gambar
        </button>
      </div>

      {/* Color Selector */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-slate-500">Warna Tinta:</span>
        {[
          { label: "Black", color: "#0f172a" },
          { label: "Blue", color: "#2563eb" },
          { label: "Red", color: "#dc2626" },
        ].map((c) => (
          <button
            key={c.color}
            type="button"
            onClick={() => setPenColor(c.color)}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              penColor === c.color ? "scale-125 border-indigo-500 shadow-md" : "border-transparent"
            }`}
            style={{ backgroundColor: c.color }}
          />
        ))}
      </div>

      {/* TAB: DRAW */}
      {tab === "draw" && (
        <div>
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/40">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-48 cursor-crosshair touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400">
                Goreskan tanda tangan Anda di sini
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={clearCanvas}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Hapus / Ulangi
            </button>

            <button
              type="button"
              disabled={!hasDrawn}
              onClick={applyDrawSignature}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              Gunakan Tanda Tangan Ini
            </button>
          </div>
        </div>
      )}

      {/* TAB: TYPE */}
      {tab === "type" && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ketik nama lengkap Anda..."
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          {typedName && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center">
              <span
                style={{
                  color: penColor,
                  fontFamily: fontFamily,
                  fontSize: "36px",
                  fontStyle: "italic",
                }}
              >
                {typedName}
              </span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!typedName}
              onClick={applyTypeSignature}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              Gunakan Tanda Tangan Ini
            </button>
          </div>
        </div>
      )}

      {/* TAB: UPLOAD */}
      {tab === "upload" && (
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500 bg-slate-50 dark:bg-slate-950/40">
            <Upload className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih file gambar tanda tangan (PNG transparan atau JPG)
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleUploadImage}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
