"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { renderPageToCanvas } from "@/lib/pdf/pdfCore";
import {
  PdfEditElement,
  TextEditElement,
  ImageEditElement,
  DrawEditElement,
  ShapeEditElement,
  ShapeKind,
} from "@/lib/pdf/editPdf";
import { Button } from "@/components/ui/button";
import {
  MousePointer,
  Move,
  GripVertical,
  Type,
  Image as ImageIcon,
  Pen,
  Square,
  Circle,
  Minus,
  MoveRight,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Bold,
  Palette,
  RotateCw,
  RotateCcw,
  Sliders,
  Shapes,
} from "lucide-react";

type ActiveTool = "select" | "move" | "text" | "image" | "draw" | "shape";

interface PdfInteractiveEditorProps {
  pdfBytes: ArrayBuffer | null;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageEdits: Record<number, PdfEditElement[]>;
  onPageEditsChange: (edits: Record<number, PdfEditElement[]>) => void;
  className?: string;
}

export const PdfInteractiveEditor: React.FC<PdfInteractiveEditorProps> = ({
  pdfBytes,
  pageCount,
  currentPage,
  onPageChange,
  pageEdits,
  onPageEditsChange,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Tool & selection state
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [activeShapeKind, setActiveShapeKind] = useState<ShapeKind>("rectangle");
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState<boolean>(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Property state for creation & active element
  const [currentColor, setCurrentColor] = useState<string>("#24406B");
  const [currentFontSize, setCurrentFontSize] = useState<number>(24);
  const [currentFontFamily, setCurrentFontFamily] = useState<"Helvetica" | "TimesRoman" | "Courier">("Helvetica");
  const [currentIsBold, setCurrentIsBold] = useState<boolean>(false);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(3);
  const [currentFillColor, setCurrentFillColor] = useState<string>("#FFFFFF");
  const [currentHasFill, setCurrentHasFill] = useState<boolean>(false);
  const [currentOpacity, setCurrentOpacity] = useState<number>(1.0);

  // Viewport state
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });
  const [scale, setScale] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<Array<Record<number, PdfEditElement[]>>>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Freehand drawing in-progress state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<Array<{ x: number; y: number }>>([]);

  // Drag & Transform state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e" | "rotate";
    startX: number;
    startY: number;
    initialElement?: PdfEditElement;
  } | null>(null);

  const currentElements = pageEdits[currentPage] || [];
  const selectedElement = currentElements.find((el) => el.id === selectedElementId) || null;

  // Push state to history
  const updateEditsWithHistory = useCallback(
    (newEdits: Record<number, PdfEditElement[]>) => {
      onPageEditsChange(newEdits);
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, newEdits];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex, onPageEditsChange]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onPageEditsChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onPageEditsChange(next);
    }
  };

  // Render current page canvas
  useEffect(() => {
    let isMounted = true;
    if (!pdfBytes) return;

    const render = async () => {
      try {
        setIsLoading(true);
        const canvas = await renderPageToCanvas(pdfBytes, currentPage - 1, 1.5 * zoom);
        if (!isMounted) return;

        const originalWidth = Math.round(canvas.width / (1.5 * zoom));
        const originalHeight = Math.round(canvas.height / (1.5 * zoom));
        setPageDimensions({ width: originalWidth, height: originalHeight });

        if (canvasSlotRef.current) {
          canvasSlotRef.current.innerHTML = "";
          canvas.className = "w-full h-auto block select-none pointer-events-none";
          canvasSlotRef.current.appendChild(canvas);
        }

        if (containerRef.current) {
          const displayWidth = canvasContainerRef.current?.clientWidth || originalWidth;
          setScale(displayWidth / originalWidth);
        }
      } catch (err) {
        console.error("Failed to render page:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [pdfBytes, currentPage, zoom]);

  // Update scale on window resize
  useEffect(() => {
    const updateScale = () => {
      if (canvasContainerRef.current && pageDimensions.width > 0) {
        setScale(canvasContainerRef.current.clientWidth / pageDimensions.width);
      }
    };
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [pageDimensions]);

  // Handle adding elements
  const addTextElement = (clickX?: number, clickY?: number) => {
    const newEl: TextEditElement = {
      id: "text-" + Date.now(),
      type: "text",
      text: "Ketik teks di sini...",
      x: clickX !== undefined ? clickX : Math.round(pageDimensions.width / 4),
      y: clickY !== undefined ? clickY : Math.round(pageDimensions.height / 3),
      width: 180,
      height: 40,
      fontSize: currentFontSize,
      fontFamily: currentFontFamily,
      colorHex: currentColor,
      isBold: currentIsBold,
      opacity: currentOpacity,
    };

    const nextEdits = {
      ...pageEdits,
      [currentPage]: [...currentElements, newEl],
    };
    updateEditsWithHistory(nextEdits);
    setSelectedElementId(newEl.id);
    setActiveTool("select");
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const width = 160;
        const height = width / aspect;

        const newEl: ImageEditElement = {
          id: "img-" + Date.now(),
          type: "image",
          dataUrl,
          x: Math.round((pageDimensions.width - width) / 2),
          y: Math.round((pageDimensions.height - height) / 3),
          width: Math.round(width),
          height: Math.round(height),
          opacity: currentOpacity,
        };

        const nextEdits = {
          ...pageEdits,
          [currentPage]: [...currentElements, newEl],
        };
        updateEditsWithHistory(nextEdits);
        setSelectedElementId(newEl.id);
        setActiveTool("select");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addShapeElement = (shapeKind: ShapeKind, clickX?: number, clickY?: number) => {
    const defaultW = shapeKind === "line" || shapeKind === "arrow" ? 140 : 120;
    const defaultH = shapeKind === "line" || shapeKind === "arrow" ? 20 : 80;

    const newEl: ShapeEditElement = {
      id: "shape-" + Date.now(),
      type: "shape",
      shapeKind,
      x: clickX !== undefined ? clickX : Math.round((pageDimensions.width - defaultW) / 2),
      y: clickY !== undefined ? clickY : Math.round((pageDimensions.height - defaultH) / 3),
      width: defaultW,
      height: defaultH,
      strokeColor: currentColor,
      strokeWidth: currentStrokeWidth,
      fillColor: currentFillColor,
      hasFill: currentHasFill,
      opacity: currentOpacity,
    };

    const nextEdits = {
      ...pageEdits,
      [currentPage]: [...currentElements, newEl],
    };
    updateEditsWithHistory(nextEdits);
    setSelectedElementId(newEl.id);
    setActiveTool("select");
    setIsShapeMenuOpen(false);
  };

  // Delete active element
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const nextList = currentElements.filter((el) => el.id !== selectedElementId);
    updateEditsWithHistory({
      ...pageEdits,
      [currentPage]: nextList,
    });
    setSelectedElementId(null);
  };

  // Update properties of currently selected element
  const updateSelectedElement = (updates: Partial<PdfEditElement>) => {
    if (!selectedElementId) return;
    const nextList = currentElements.map((el) =>
      el.id === selectedElementId ? ({ ...el, ...updates } as PdfEditElement) : el
    );
    updateEditsWithHistory({
      ...pageEdits,
      [currentPage]: nextList,
    });
  };

  // Canvas Click / Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const clickX = Math.round((e.clientX - rect.left) / scale);
    const clickY = Math.round((e.clientY - rect.top) / scale);

    if (activeTool === "text") {
      addTextElement(clickX, clickY);
      return;
    }

    if (activeTool === "shape") {
      addShapeElement(activeShapeKind, clickX, clickY);
      return;
    }

    if (activeTool === "draw") {
      setIsDrawing(true);
      setCurrentDrawPoints([{ x: clickX, y: clickY }]);
      const canvas = drawCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(clickX * scale, clickY * scale);
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = currentStrokeWidth * scale;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalAlpha = currentOpacity;
        }
      }
      return;
    }

    // If in select or move mode and clicked background, deselect
    if (activeTool === "select" || activeTool === "move") {
      setSelectedElementId(null);
    }
  };

  // Freehand Drawing Move & End
  const handleDrawMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || activeTool !== "draw" || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const curX = Math.round((e.clientX - rect.left) / scale);
    const curY = Math.round((e.clientY - rect.top) / scale);

    setCurrentDrawPoints((prev) => [...prev, { x: curX, y: curY }]);

    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(curX * scale, curY * scale);
        ctx.stroke();
      }
    }
  };

  const handleDrawMouseUp = () => {
    if (!isDrawing || activeTool !== "draw") return;
    setIsDrawing(false);

    if (currentDrawPoints.length > 1) {
      // Calculate bounding box
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      currentDrawPoints.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });

      const pad = currentStrokeWidth + 4;
      const bX = Math.max(0, Math.round(minX - pad));
      const bY = Math.max(0, Math.round(minY - pad));
      const bW = Math.max(20, Math.round(maxX - minX + pad * 2));
      const bH = Math.max(20, Math.round(maxY - minY + pad * 2));

      // Capture stroke as clean PNG data url
      let canvasDataUrl: string | undefined;
      const canvas = drawCanvasRef.current;
      if (canvas) {
        canvasDataUrl = canvas.toDataURL("image/png");
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const newEl: DrawEditElement = {
        id: "draw-" + Date.now(),
        type: "draw",
        points: currentDrawPoints,
        strokeColor: currentColor,
        strokeWidth: currentStrokeWidth,
        x: bX,
        y: bY,
        width: bW,
        height: bH,
        opacity: currentOpacity,
        canvasDataUrl,
      };

      const nextEdits = {
        ...pageEdits,
        [currentPage]: [...currentElements, newEl],
      };
      updateEditsWithHistory(nextEdits);
      setSelectedElementId(newEl.id);
      setActiveTool("select");
    }

    setCurrentDrawPoints([]);
  };

  // Element Drag & Transform Start
  const handleElementDragStart = (
    e: React.MouseEvent,
    elem: PdfEditElement,
    type: "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e" | "rotate"
  ) => {
    e.stopPropagation();
    setSelectedElementId(elem.id);

    setDragState({
      isDragging: true,
      dragType: type,
      startX: e.clientX,
      startY: e.clientY,
      initialElement: { ...elem },
    });
  };

  // Global Drag Move & End
  const handleGlobalDragMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !dragState.isDragging || !dragState.initialElement) return;

      const deltaX = (e.clientX - dragState.startX) / scale;
      const deltaY = (e.clientY - dragState.startY) / scale;
      const init = dragState.initialElement;

      let { x, y, width, height } = init;
      let rotation = init.rotation || 0;

      if (dragState.dragType === "rotate") {
        if (canvasContainerRef.current) {
          const rect = canvasContainerRef.current.getBoundingClientRect();
          const currentMouseX = (e.clientX - rect.left) / scale;
          const currentMouseY = (e.clientY - rect.top) / scale;
          const cx = init.x + init.width / 2;
          const cy = init.y + init.height / 2;
          const rad = Math.atan2(currentMouseY - cy, currentMouseX - cx);
          let deg = Math.round((rad * 180) / Math.PI) + 90; // +90 because handle is on top (0 deg = up)
          if (deg < 0) deg += 360;
          deg = deg % 360;

          // Snapping to cardinal/diagonal angles within 5 degrees
          const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
          for (const s of snapAngles) {
            if (Math.abs(deg - s) <= 5) {
              deg = s === 360 ? 0 : s;
              break;
            }
          }
          rotation = deg;
        }
      } else if (dragState.dragType === "move") {
        x = Math.max(0, Math.min(pageDimensions.width - width, init.x + deltaX));
        y = Math.max(0, Math.min(pageDimensions.height - height, init.y + deltaY));
      } else if (dragState.dragType === "se") {
        width = Math.max(20, Math.min(pageDimensions.width - init.x, init.width + deltaX));
        height = Math.max(15, Math.min(pageDimensions.height - init.y, init.height + deltaY));
      } else if (dragState.dragType === "sw") {
        const potX = init.x + deltaX;
        const potW = init.width - deltaX;
        if (potW >= 20 && potX >= 0) {
          x = potX;
          width = potW;
        }
        height = Math.max(15, Math.min(pageDimensions.height - init.y, init.height + deltaY));
      } else if (dragState.dragType === "ne") {
        width = Math.max(20, Math.min(pageDimensions.width - init.x, init.width + deltaX));
        const potY = init.y + deltaY;
        const potH = init.height - deltaY;
        if (potH >= 15 && potY >= 0) {
          y = potY;
          height = potH;
        }
      } else if (dragState.dragType === "nw") {
        const potX = init.x + deltaX;
        const potW = init.width - deltaX;
        const potY = init.y + deltaY;
        const potH = init.height - deltaY;
        if (potW >= 20 && potX >= 0) {
          x = potX;
          width = potW;
        }
        if (potH >= 15 && potY >= 0) {
          y = potY;
          height = potH;
        }
      }

      const updated = currentElements.map((el) =>
        el.id === init.id
          ? ({
              ...el,
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(width),
              height: Math.round(height),
              rotation,
            } as PdfEditElement)
          : el
      );

      onPageEditsChange({
        ...pageEdits,
        [currentPage]: updated,
      });
    },
    [dragState, scale, pageDimensions, currentElements, onPageEditsChange, pageEdits, currentPage]
  );

  const handleGlobalDragEnd = useCallback(() => {
    if (dragState) {
      setDragState(null);
    }
  }, [dragState]);

  const handleGlobalTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleGlobalDragMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
      }
    },
    [handleGlobalDragMove]
  );

  useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", handleGlobalDragMove);
      window.addEventListener("mouseup", handleGlobalDragEnd);
      window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      window.addEventListener("touchend", handleGlobalDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleGlobalDragMove);
        window.removeEventListener("mouseup", handleGlobalDragEnd);
        window.removeEventListener("touchmove", handleGlobalTouchMove);
        window.removeEventListener("touchend", handleGlobalDragEnd);
      };
    }
  }, [dragState, handleGlobalDragMove, handleGlobalDragEnd, handleGlobalTouchMove]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`} ref={containerRef}>
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Main Interactive Header Toolbar - Icon Only with Tooltips */}
      <div className="w-full flex items-center justify-between p-2 bg-surface border border-rule rounded-t-lg shadow-subtle flex-wrap gap-2">
        {/* Left: Element Creation Icons */}
        <div className="flex items-center gap-1 bg-paper p-1 rounded-md border border-rule">
          <button
            type="button"
            onClick={() => setActiveTool("move")}
            title="Geser / Pindahkan Elemen (Move / Drag Tool)"
            className={`p-2 rounded-md transition ${
              activeTool === "move"
                ? "bg-[#24406B] text-white shadow-xs"
                : "text-ink hover:bg-surface"
            }`}
          >
            <Move className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool("select")}
            title="Pilih Elemen (Select Tool)"
            className={`p-2 rounded-md transition ${
              activeTool === "select"
                ? "bg-[#24406B] text-white shadow-xs"
                : "text-ink hover:bg-surface"
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool("text");
              setSelectedElementId(null);
            }}
            title="Tambah Teks (Add Text)"
            className={`p-2 rounded-md transition ${
              activeTool === "text"
                ? "bg-[#24406B] text-white shadow-xs"
                : "text-ink hover:bg-surface"
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            title="Sisipkan Gambar (Add Image)"
            className="p-2 rounded-md text-ink hover:bg-surface transition"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool("draw");
              setSelectedElementId(null);
            }}
            title="Menggambar Bebas (Draw / Pen)"
            className={`p-2 rounded-md transition ${
              activeTool === "draw"
                ? "bg-[#24406B] text-white shadow-xs"
                : "text-ink hover:bg-surface"
            }`}
          >
            <Pen className="w-4 h-4" />
          </button>

          {/* Shapes Picker Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsShapeMenuOpen((o) => !o)}
              title="Tambah Bentuk (Shapes: Kotak, Lingkaran, Garis, Panah)"
              className={`p-2 rounded-md flex items-center gap-1 transition ${
                activeTool === "shape"
                  ? "bg-[#24406B] text-white shadow-xs"
                  : "text-ink hover:bg-surface"
              }`}
            >
              {activeShapeKind === "rectangle" && <Square className="w-4 h-4" />}
              {activeShapeKind === "circle" && <Circle className="w-4 h-4" />}
              {activeShapeKind === "line" && <Minus className="w-4 h-4" />}
              {activeShapeKind === "arrow" && <MoveRight className="w-4 h-4" />}
            </button>

            {isShapeMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 p-1 bg-surface border border-rule rounded-lg shadow-lg z-50 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveShapeKind("rectangle");
                    setActiveTool("shape");
                    setIsShapeMenuOpen(false);
                  }}
                  title="Kotak (Rectangle)"
                  className="p-2 rounded hover:bg-paper text-ink transition"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveShapeKind("circle");
                    setActiveTool("shape");
                    setIsShapeMenuOpen(false);
                  }}
                  title="Lingkaran (Circle)"
                  className="p-2 rounded hover:bg-paper text-ink transition"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveShapeKind("line");
                    setActiveTool("shape");
                    setIsShapeMenuOpen(false);
                  }}
                  title="Garis (Line)"
                  className="p-2 rounded hover:bg-paper text-ink transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveShapeKind("arrow");
                    setActiveTool("shape");
                    setIsShapeMenuOpen(false);
                  }}
                  title="Panah (Arrow)"
                  className="p-2 rounded hover:bg-paper text-ink transition"
                >
                  <MoveRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: History & Action Icons */}
        <div className="flex items-center gap-1 bg-paper p-1 rounded-md border border-rule">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Urungkan)"
            className="p-2 rounded-md text-ink hover:bg-surface disabled:opacity-40 transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ulangi)"
            className="p-2 rounded-md text-ink hover:bg-surface disabled:opacity-40 transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          {selectedElementId && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              title="Hapus Elemen Terpilih"
              className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Zoom & Page Controls */}
        <div className="flex items-center gap-2">
          {pageCount > 1 && (
            <div className="flex items-center gap-1 bg-paper p-1 rounded-md border border-rule text-xs">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-1 rounded text-ink hover:bg-surface disabled:opacity-40 transition"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono px-1 text-ink text-[11px]">
                {currentPage} / {pageCount}
              </span>
              <button
                type="button"
                disabled={currentPage >= pageCount}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-1 rounded text-ink hover:bg-surface disabled:opacity-40 transition"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-paper p-1 rounded-md border border-rule">
            <button
              type="button"
              disabled={zoom <= 0.6}
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              className="p-1 rounded text-ink hover:bg-surface disabled:opacity-40 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] px-1 text-ink-muted">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              disabled={zoom >= 2.0}
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
              className="p-1 rounded text-ink hover:bg-surface disabled:opacity-40 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Property Inspector Toolbar (Appears contextually) */}
      <div className="w-full flex items-center gap-3 px-3 py-2 bg-surface/80 border-x border-b border-rule text-xs flex-wrap">
        {/* Text properties */}
        {(activeTool === "text" || (selectedElement && selectedElement.type === "text")) && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={
                selectedElement?.type === "text"
                  ? selectedElement.fontFamily
                  : currentFontFamily
              }
              onChange={(e) => {
                const val = e.target.value as any;
                setCurrentFontFamily(val);
                if (selectedElement?.type === "text") updateSelectedElement({ fontFamily: val });
              }}
              className="h-7 px-2 border border-rule rounded bg-white text-[11px] text-ink"
            >
              <option value="Helvetica">Helvetica</option>
              <option value="TimesRoman">Times Roman</option>
              <option value="Courier">Courier</option>
            </select>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-ink-muted">Ukuran:</span>
              <input
                type="number"
                min="10"
                max="96"
                value={
                  selectedElement?.type === "text"
                    ? selectedElement.fontSize
                    : currentFontSize
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentFontSize(val);
                  if (selectedElement?.type === "text") updateSelectedElement({ fontSize: val });
                }}
                className="w-12 h-7 px-1 text-center font-mono border border-rule rounded bg-white text-[11px] text-ink"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const nextBold = selectedElement?.type === "text" ? !selectedElement.isBold : !currentIsBold;
                setCurrentIsBold(nextBold);
                if (selectedElement?.type === "text") updateSelectedElement({ isBold: nextBold });
              }}
              className={`p-1.5 border rounded transition ${
                (selectedElement?.type === "text" ? selectedElement.isBold : currentIsBold)
                  ? "bg-[#24406B] text-white border-[#24406B]"
                  : "border-rule bg-white text-ink"
              }`}
              title="Tebal (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={
                  selectedElement?.type === "text"
                    ? selectedElement.colorHex
                    : currentColor
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentColor(val);
                  if (selectedElement?.type === "text") updateSelectedElement({ colorHex: val });
                }}
                className="w-6 h-6 rounded border border-rule cursor-pointer p-0 bg-white"
                title="Warna Teks"
              />
            </div>

            {selectedElement?.type === "text" && (
              <div className="flex items-center gap-1 border-l border-rule pl-2">
                <span className="text-[11px] text-ink-muted">Teks:</span>
                <input
                  type="text"
                  value={selectedElement.text}
                  onChange={(e) => updateSelectedElement({ text: e.target.value })}
                  className="h-7 px-2 border border-rule rounded bg-white text-[11px] text-ink w-32 md:w-44 focus:border-[#24406B] outline-none"
                  placeholder="Ketik teks..."
                />
              </div>
            )}
          </div>
        )}

        {/* Freehand Draw & Shape stroke properties */}
        {(activeTool === "draw" ||
          activeTool === "shape" ||
          (selectedElement &&
            (selectedElement.type === "shape" || selectedElement.type === "draw"))) && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-ink-muted">Garis:</span>
              <input
                type="color"
                value={
                  selectedElement && "strokeColor" in selectedElement
                    ? (selectedElement as any).strokeColor
                    : currentColor
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentColor(val);
                  if (selectedElement && "strokeColor" in selectedElement) {
                    updateSelectedElement({ strokeColor: val });
                  }
                }}
                className="w-6 h-6 rounded border border-rule cursor-pointer p-0 bg-white"
                title="Warna Garis / Coretan"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-ink-muted">Tebal:</span>
              <input
                type="range"
                min="1"
                max="16"
                value={
                  selectedElement && "strokeWidth" in selectedElement
                    ? (selectedElement as any).strokeWidth
                    : currentStrokeWidth
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentStrokeWidth(val);
                  if (selectedElement && "strokeWidth" in selectedElement) {
                    updateSelectedElement({ strokeWidth: val });
                  }
                }}
                className="w-16 h-1.5 bg-rule accent-[#24406B] rounded cursor-pointer"
              />
            </div>

            {/* Fill color for shapes */}
            {(activeTool === "shape" || (selectedElement && selectedElement.type === "shape")) && (
              <div className="flex items-center gap-1.5">
                <label className="flex items-center gap-1 cursor-pointer text-[11px] text-ink">
                  <input
                    type="checkbox"
                    checked={
                      selectedElement?.type === "shape"
                        ? !!selectedElement.hasFill
                        : currentHasFill
                    }
                    onChange={(e) => {
                      const val = e.target.checked;
                      setCurrentHasFill(val);
                      if (selectedElement?.type === "shape") updateSelectedElement({ hasFill: val });
                    }}
                    className="rounded text-[#24406B]"
                  />
                  Fill:
                </label>
                <input
                  type="color"
                  value={
                    selectedElement?.type === "shape" && selectedElement.fillColor
                      ? selectedElement.fillColor
                      : currentFillColor
                  }
                  disabled={selectedElement?.type === "shape" ? !selectedElement.hasFill : !currentHasFill}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentFillColor(val);
                    if (selectedElement?.type === "shape") updateSelectedElement({ fillColor: val });
                  }}
                  className="w-6 h-6 rounded border border-rule cursor-pointer p-0 bg-white disabled:opacity-30"
                  title="Warna Isian (Fill)"
                />
              </div>
            )}
          </div>
        )}

        {/* Rotation & Opacity for selected item */}
        {selectedElement && (
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {/* Rotation Controls */}
            <div className="flex items-center gap-1 border-r border-rule pr-2">
              <span className="text-[11px] text-ink-muted">Rotasi:</span>
              <button
                type="button"
                onClick={() => {
                  const cur = selectedElement.rotation || 0;
                  const nextRot = (cur + 90) % 360;
                  updateSelectedElement({ rotation: nextRot });
                }}
                className="p-1 border border-rule rounded bg-white hover:bg-surface text-ink transition"
                title="Putar 90° Searah Jarum Jam (+90°)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const cur = selectedElement.rotation || 0;
                  const nextRot = (cur - 90 + 360) % 360;
                  updateSelectedElement({ rotation: nextRot });
                }}
                className="p-1 border border-rule rounded bg-white hover:bg-surface text-ink transition"
                title="Putar 90° Berlawanan Arah Jarum Jam (-90°)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateSelectedElement({ rotation: 0 })}
                className="text-[10px] font-mono px-1.5 py-0.5 border border-rule rounded bg-white hover:bg-surface text-ink transition"
                title="Reset Sudut Rotasi ke 0°"
              >
                {selectedElement.rotation || 0}°
              </button>
            </div>

            {/* Opacity Control */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-ink-muted">Transparansi:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1.0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateSelectedElement({ opacity: val });
                }}
                className="w-16 h-1.5 bg-rule accent-[#24406B] rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Canvas + Overlays Viewport */}
      <div
        className="w-full relative max-w-full overflow-auto p-4 bg-paper-muted border-x border-b border-rule rounded-b-lg flex justify-center items-center min-h-[440px]"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleDrawMouseMove}
        onMouseUp={handleDrawMouseUp}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-30 flex items-center justify-center text-xs font-mono text-ink-muted">
            Memuat preview halaman...
          </div>
        )}

        <div
          ref={canvasContainerRef}
          className="relative max-w-full shadow-md border border-rule bg-white select-none"
          style={{ width: `${pageDimensions.width * zoom * (scale || 1)}px` }}
        >
          {/* Underlying PDF Canvas */}
          <div ref={canvasSlotRef} className="w-full h-auto block select-none pointer-events-none" />

          {/* Active Freehand Drawing Canvas Layer */}
          <canvas
            ref={drawCanvasRef}
            width={pageDimensions.width * scale}
            height={pageDimensions.height * scale}
            className={`absolute inset-0 z-20 pointer-events-none ${
              activeTool === "draw" ? "cursor-crosshair" : ""
            }`}
          />

          {/* Render All Elements on Active Page */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {currentElements.map((elem) => {
              const isSelected = elem.id === selectedElementId;

              return (
                <div
                  key={elem.id}
                  className={`absolute pointer-events-auto cursor-move group transition-shadow ${
                    isSelected
                      ? "ring-2 ring-[#24406B] ring-offset-1 shadow-md"
                      : "hover:ring-1 hover:ring-black/30"
                  }`}
                  style={{
                    left: `${elem.x * scale}px`,
                    top: `${elem.y * scale}px`,
                    width: `${elem.width * scale}px`,
                    height: `${elem.height * scale}px`,
                    transform: `rotate(${elem.rotation || 0}deg)`,
                    transformOrigin: "center center",
                    opacity: elem.opacity !== undefined ? elem.opacity : 1,
                  }}
                  onMouseDown={(e) => handleElementDragStart(e, elem, "move")}
                  onTouchStart={(e) => {
                    if (e.touches.length > 0) {
                      const touch = e.touches[0];
                      handleElementDragStart(
                        { clientX: touch.clientX, clientY: touch.clientY, stopPropagation: () => e.stopPropagation() } as any,
                        elem,
                        "move"
                      );
                    }
                  }}
                >
                  {/* Text Element Content */}
                  {elem.type === "text" && (
                    <textarea
                      value={elem.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateSelectedElement({ text: val });
                      }}
                      onMouseDown={(e) => {
                        if (activeTool === "move") {
                          // Allow parent container to handle drag-to-move immediately
                          return;
                        }
                        e.stopPropagation();
                      }}
                      readOnly={activeTool === "move"}
                      style={{
                        color: elem.colorHex,
                        fontSize: `${elem.fontSize * scale}px`,
                        fontFamily:
                          elem.fontFamily === "TimesRoman"
                            ? "serif"
                            : elem.fontFamily === "Courier"
                            ? "monospace"
                            : "sans-serif",
                        fontWeight: elem.isBold ? 700 : 400,
                        lineHeight: 1.2,
                        pointerEvents: activeTool === "move" ? "none" : "auto",
                      }}
                      className={`w-full h-full bg-transparent resize-none border-none outline-none p-0 overflow-hidden font-medium ${
                        activeTool === "move" ? "pointer-events-none select-none cursor-move" : "cursor-text"
                      }`}
                    />
                  )}

                  {/* Image Element Content */}
                  {elem.type === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={elem.dataUrl}
                      alt="Pasted item"
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  )}

                  {/* Freehand Drawing Element Content */}
                  {elem.type === "draw" && (
                    <div className="w-full h-full pointer-events-none">
                      {elem.canvasDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={elem.canvasDataUrl}
                          alt="Drawing"
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <svg className="w-full h-full overflow-visible">
                          <polyline
                            points={elem.points
                              .map((p) => `${(p.x - elem.x) * scale},${(p.y - elem.y) * scale}`)
                              .join(" ")}
                            fill="none"
                            stroke={elem.strokeColor}
                            strokeWidth={elem.strokeWidth * scale}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Shape Element Content */}
                  {elem.type === "shape" && (
                    <div className="w-full h-full pointer-events-none">
                      {elem.shapeKind === "rectangle" && (
                        <div
                          className="w-full h-full"
                          style={{
                            border: `${elem.strokeWidth * scale}px solid ${elem.strokeColor}`,
                            backgroundColor: elem.hasFill ? elem.fillColor : "transparent",
                          }}
                        />
                      )}
                      {elem.shapeKind === "circle" && (
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            border: `${elem.strokeWidth * scale}px solid ${elem.strokeColor}`,
                            backgroundColor: elem.hasFill ? elem.fillColor : "transparent",
                          }}
                        />
                      )}
                      {elem.shapeKind === "line" && (
                        <svg className="w-full h-full overflow-visible">
                          <line
                            x1="0"
                            y1="0"
                            x2={elem.width * scale}
                            y2={elem.height * scale}
                            stroke={elem.strokeColor}
                            strokeWidth={elem.strokeWidth * scale}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                      {elem.shapeKind === "arrow" && (
                        <svg className="w-full h-full overflow-visible">
                          <defs>
                            <marker
                              id={`arrow-${elem.id}`}
                              viewBox="0 0 10 10"
                              refX="6"
                              refY="5"
                              markerWidth="6"
                              markerHeight="6"
                              orient="auto-start-reverse"
                            >
                              <path d="M 0 0 L 10 5 L 0 10 z" fill={elem.strokeColor} />
                            </marker>
                          </defs>
                          <line
                            x1="0"
                            y1="0"
                            x2={elem.width * scale}
                            y2={elem.height * scale}
                            stroke={elem.strokeColor}
                            strokeWidth={elem.strokeWidth * scale}
                            markerEnd={`url(#arrow-${elem.id})`}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Interactive Rotation Knob & Stem Handle atop selected element */}
                  {isSelected && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto select-none z-30">
                      <div
                        className="w-5 h-5 bg-white border-2 border-[#24406B] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition active:scale-95"
                        onMouseDown={(e) => handleElementDragStart(e, elem, "rotate")}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            const touch = e.touches[0];
                            handleElementDragStart(
                              { clientX: touch.clientX, clientY: touch.clientY, stopPropagation: () => e.stopPropagation() } as any,
                              elem,
                              "rotate"
                            );
                          }
                        }}
                        title="Tahan & putar untuk mengubah sudut rotasi (Rotate Handle)"
                      >
                        <RotateCw className="w-3 h-3 text-[#24406B]" />
                      </div>
                      <div className="w-[1.5px] h-3 bg-[#24406B]" />
                    </div>
                  )}

                  {/* Drag / Move Pill Handle atop selected element */}
                  {isSelected && (
                    <div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#24406B] text-white px-2 py-0.5 rounded-full text-[10px] font-sans font-medium cursor-move shadow-md pointer-events-auto select-none z-30 transition hover:bg-[#1d3356] active:scale-95"
                      onMouseDown={(e) => handleElementDragStart(e, elem, "move")}
                      onTouchStart={(e) => {
                        if (e.touches.length > 0) {
                          const touch = e.touches[0];
                          handleElementDragStart(
                            { clientX: touch.clientX, clientY: touch.clientY, stopPropagation: () => e.stopPropagation() } as any,
                            elem,
                            "move"
                          );
                        }
                      }}
                      title="Tahan & geser untuk memindahkan elemen (Drag / Move)"
                    >
                      <Move className="w-3 h-3" />
                      <span className="leading-none">Geser</span>
                    </div>
                  )}

                  {/* 4 Corner Resize Handles when Selected */}
                  {isSelected && (
                    <>
                      <div
                        className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 bg-white border-2 border-[#24406B] rounded-full cursor-nw-resize shadow-sm"
                        onMouseDown={(e) => handleElementDragStart(e, elem, "nw")}
                      />
                      <div
                        className="absolute -right-1.5 -top-1.5 w-3.5 h-3.5 bg-white border-2 border-[#24406B] rounded-full cursor-ne-resize shadow-sm"
                        onMouseDown={(e) => handleElementDragStart(e, elem, "ne")}
                      />
                      <div
                        className="absolute -left-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-[#24406B] rounded-full cursor-sw-resize shadow-sm"
                        onMouseDown={(e) => handleElementDragStart(e, elem, "sw")}
                      />
                      <div
                        className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-[#24406B] rounded-full cursor-se-resize shadow-sm"
                        onMouseDown={(e) => handleElementDragStart(e, elem, "se")}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
