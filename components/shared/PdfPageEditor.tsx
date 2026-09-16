"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { renderPageToCanvas } from "@/lib/pdf/pdfCore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Trash2 } from "lucide-react";

export interface OverlayElement {
  id: string;
  x: number; // in PDF points (72 DPI)
  y: number; // in PDF points (72 DPI) - from top-left of page for UI consistency, translated in pdf-lib
  width: number; // in PDF points
  height: number; // in PDF points
  rotation?: number; // degrees
  opacity?: number;
  content?: string | HTMLImageElement; // image src or text
  type?: "image" | "text" | "signature" | "highlight";
  color?: string; // for highlight
}

export interface CropBox {
  x: number; // PDF points
  y: number; // PDF points
  width: number;
  height: number;
}

interface PdfPageEditorProps {
  pdfBytes: ArrayBuffer | null;
  pageCount: number;
  currentPage: number; // 1-indexed
  onPageChange?: (page: number) => void;
  mode?: "preview" | "crop" | "overlay" | "highlight";
  
  // Crop mode props
  cropBox?: CropBox;
  onCropChange?: (box: CropBox) => void;
  
  // Overlay element mode props (single element placement like signature / image)
  overlayElement?: OverlayElement | null;
  onOverlayChange?: (element: OverlayElement) => void;
  
  // Highlight mode props (multiple highlight rectangles)
  highlights?: OverlayElement[];
  onHighlightsChange?: (highlights: OverlayElement[]) => void;
  currentHighlightColor?: string;
  currentHighlightOpacity?: number;

  // Page dimensions notification
  onPageDimensionsChange?: (dims: { width: number; height: number }) => void;

  // Custom preview render function (e.g. for watermark text or page number preview)
  customOverlayRender?: (pageWidth: number, pageHeight: number, scale: number) => React.ReactNode;
  
  className?: string;
}

export const PdfPageEditor: React.FC<PdfPageEditorProps> = ({
  pdfBytes,
  pageCount,
  currentPage,
  onPageChange,
  mode = "preview",
  cropBox,
  onCropChange,
  overlayElement,
  onOverlayChange,
  highlights = [],
  onHighlightsChange,
  currentHighlightColor = "#FFEB3B",
  currentHighlightOpacity = 0.45,
  onPageDimensionsChange,
  customOverlayRender,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [scale, setScale] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: "move" | "resize" | "highlight-draw" | "crop-nw" | "crop-ne" | "crop-sw" | "crop-se" | "crop-move";
    startX: number;
    startY: number;
    initialBox?: CropBox | OverlayElement;
  } | null>(null);

  // Render current page
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
        if (onPageDimensionsChange) {
          onPageDimensionsChange({ width: originalWidth, height: originalHeight });
        }

        if (canvasSlotRef.current) {
          canvasSlotRef.current.innerHTML = "";
          canvas.className = "w-full h-auto block select-none pointer-events-none";
          canvasSlotRef.current.appendChild(canvas);
        }

        // Calculate scale factor relative to container
        if (containerRef.current) {
          const displayWidth = canvasContainerRef.current?.clientWidth || originalWidth;
          setScale(displayWidth / originalWidth);
        }
      } catch (err) {
        console.error("Failed to render page in PdfPageEditor:", err);
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

  // Handle Drag & Resize for Crop Box
  const handleCropStart = (
    coords: { clientX: number; clientY: number },
    type: "crop-move" | "crop-nw" | "crop-ne" | "crop-sw" | "crop-se"
  ) => {
    if (!cropBox) return;
    setDragState({
      isDragging: true,
      dragType: type,
      startX: coords.clientX,
      startY: coords.clientY,
      initialBox: { ...cropBox },
    });
  };

  // Handle Drag & Resize for Overlay Element
  const handleOverlayStart = (
    coords: { clientX: number; clientY: number },
    type: "move" | "resize"
  ) => {
    if (!overlayElement) return;
    setDragState({
      isDragging: true,
      dragType: type,
      startX: coords.clientX,
      startY: coords.clientY,
      initialBox: { ...overlayElement },
    });
  };

  // Handle Highlight Drawing Start
  const handleEditorStart = (coords: { clientX: number; clientY: number }) => {
    if (mode === "highlight" && canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const clickX = (coords.clientX - rect.left) / scale;
      const clickY = (coords.clientY - rect.top) / scale;

      const newHighlight: OverlayElement = {
        id: "hl-" + Date.now(),
        x: Math.max(0, Math.min(pageDimensions.width, clickX)),
        y: Math.max(0, Math.min(pageDimensions.height, clickY)),
        width: 1,
        height: 1,
        color: currentHighlightColor,
        opacity: currentHighlightOpacity,
        type: "highlight",
      };

      setDragState({
        isDragging: true,
        dragType: "highlight-draw",
        startX: coords.clientX,
        startY: coords.clientY,
        initialBox: newHighlight,
      });

      if (onHighlightsChange) {
        onHighlightsChange([...highlights, newHighlight]);
      }
    }
  };

  // Global mouse/touch move
  const handleDragMove = useCallback(
    (coords: { clientX: number; clientY: number }) => {
      if (!dragState || !dragState.isDragging || !dragState.initialBox) return;

      const deltaX = (coords.clientX - dragState.startX) / scale;
      const deltaY = (coords.clientY - dragState.startY) / scale;

      if (dragState.dragType === "move" && overlayElement && onOverlayChange) {
        const init = dragState.initialBox as OverlayElement;
        const newX = Math.max(
          0,
          Math.min(pageDimensions.width - init.width, init.x + deltaX)
        );
        const newY = Math.max(
          0,
          Math.min(pageDimensions.height - init.height, init.y + deltaY)
        );
        onOverlayChange({
          ...overlayElement,
          x: Math.round(newX),
          y: Math.round(newY),
        });
      } else if (
        dragState.dragType === "resize" &&
        overlayElement &&
        onOverlayChange
      ) {
        const init = dragState.initialBox as OverlayElement;
        const newWidth = Math.max(
          20,
          Math.min(pageDimensions.width - init.x, init.width + deltaX)
        );
        const aspectRatio = init.width / init.height;
        const newHeight = newWidth / aspectRatio;
        onOverlayChange({
          ...overlayElement,
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
      } else if (
        dragState.dragType.startsWith("crop-") &&
        cropBox &&
        onCropChange
      ) {
        const init = dragState.initialBox as CropBox;
        let { x, y, width, height } = init;

        if (dragState.dragType === "crop-move") {
          x = Math.max(0, Math.min(pageDimensions.width - width, init.x + deltaX));
          y = Math.max(0, Math.min(pageDimensions.height - height, init.y + deltaY));
        } else if (dragState.dragType === "crop-se") {
          width = Math.max(
            30,
            Math.min(pageDimensions.width - init.x, init.width + deltaX)
          );
          height = Math.max(
            30,
            Math.min(pageDimensions.height - init.y, init.height + deltaY)
          );
        } else if (dragState.dragType === "crop-sw") {
          const potentialX = init.x + deltaX;
          const potentialW = init.width - deltaX;
          if (potentialW >= 30 && potentialX >= 0) {
            x = potentialX;
            width = potentialW;
          }
          height = Math.max(
            30,
            Math.min(pageDimensions.height - init.y, init.height + deltaY)
          );
        } else if (dragState.dragType === "crop-ne") {
          width = Math.max(
            30,
            Math.min(pageDimensions.width - init.x, init.width + deltaX)
          );
          const potentialY = init.y + deltaY;
          const potentialH = init.height - deltaY;
          if (potentialH >= 30 && potentialY >= 0) {
            y = potentialY;
            height = potentialH;
          }
        } else if (dragState.dragType === "crop-nw") {
          const potentialX = init.x + deltaX;
          const potentialW = init.width - deltaX;
          const potentialY = init.y + deltaY;
          const potentialH = init.height - deltaY;
          if (potentialW >= 30 && potentialX >= 0) {
            x = potentialX;
            width = potentialW;
          }
          if (potentialH >= 30 && potentialY >= 0) {
            y = potentialY;
            height = potentialH;
          }
        } else if (dragState.dragType === "crop-n") {
          const potentialY = init.y + deltaY;
          const potentialH = init.height - deltaY;
          if (potentialH >= 30 && potentialY >= 0) {
            y = potentialY;
            height = potentialH;
          }
        } else if (dragState.dragType === "crop-s") {
          height = Math.max(30, Math.min(pageDimensions.height - init.y, init.height + deltaY));
        } else if (dragState.dragType === "crop-w") {
          const potentialX = init.x + deltaX;
          const potentialW = init.width - deltaX;
          if (potentialW >= 30 && potentialX >= 0) {
            x = potentialX;
            width = potentialW;
          }
        } else if (dragState.dragType === "crop-e") {
          width = Math.max(30, Math.min(pageDimensions.width - init.x, init.width + deltaX));
        }

        onCropChange({
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        });
      } else if (
        dragState.dragType === "highlight-draw" &&
        highlights.length > 0 &&
        onHighlightsChange
      ) {
        const init = dragState.initialBox as OverlayElement;
        const currentHl = highlights[highlights.length - 1];

        let newX = init.x;
        let newY = init.y;
        let newWidth = Math.abs(deltaX);
        let newHeight = Math.abs(deltaY);

        if (deltaX < 0) {
          newX = Math.max(0, init.x + deltaX);
        }
        if (deltaY < 0) {
          newY = Math.max(0, init.y + deltaY);
        }

        newWidth = Math.min(pageDimensions.width - newX, Math.max(4, newWidth));
        newHeight = Math.min(pageDimensions.height - newY, Math.max(4, newHeight));

        const updated = [
          ...highlights.slice(0, -1),
          {
            ...currentHl,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          },
        ];
        onHighlightsChange(updated);
      }
    },
    [
      dragState,
      scale,
      overlayElement,
      onOverlayChange,
      cropBox,
      onCropChange,
      highlights,
      onHighlightsChange,
      pageDimensions,
    ]
  );

  const handleDragEnd = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      const onMouseMove = (e: MouseEvent) => {
        handleDragMove({ clientX: e.clientX, clientY: e.clientY });
      };

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          handleDragMove({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
          });
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [dragState, handleDragMove, handleDragEnd]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`} ref={containerRef}>
      {/* Top Toolbar */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[var(--rule)] text-sm text-[var(--ink-muted)]">
        <div className="flex items-center gap-2">
          {pageCount > 1 && onPageChange && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="font-mono text-xs px-2 text-[var(--ink)]">
                {currentPage} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage >= pageCount}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
          {pageCount === 1 && (
            <span className="font-mono text-xs text-[var(--ink-muted)]">Page 1 of 1</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={zoom <= 0.6}
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="font-mono text-xs px-1">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={zoom >= 2.0}
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas + Overlay Container */}
      <div
        className="relative max-w-full overflow-auto p-4 bg-[var(--paper-muted)] rounded border border-[var(--rule)] flex justify-center items-center min-h-[360px]"
        onMouseDown={(e) => handleEditorStart({ clientX: e.clientX, clientY: e.clientY })}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleEditorStart({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
          }
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-30 flex items-center justify-center text-xs font-mono text-[var(--ink-muted)]">
            Loading preview...
          </div>
        )}

        <div
          ref={canvasContainerRef}
          className="relative max-w-full overflow-hidden shadow-md border border-[var(--rule)] bg-white select-none"
          style={{ width: `${pageDimensions.width * zoom * (scale || 1)}px` }}
        >
          {/* Isolated slot for PDF Canvas - never overwritten by React state changes */}
          <div ref={canvasSlotRef} className="w-full h-auto block select-none pointer-events-none" />

          {/* Custom Overlay (e.g. Watermark / Page Number) */}
          {customOverlayRender && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              {customOverlayRender(pageDimensions.width, pageDimensions.height, scale)}
            </div>
          )}

          {/* Overlay Element (Image / Signature / Text) */}
          {mode === "overlay" && overlayElement && (
            <div
              className="absolute z-20 cursor-move border-2 border-dashed border-[var(--accent)] bg-[var(--accent-soft)]/20 transition-shadow hover:shadow-lg group"
              style={{
                left: `${overlayElement.x * scale}px`,
                top: `${overlayElement.y * scale}px`,
                width: `${overlayElement.width * scale}px`,
                height: `${overlayElement.height * scale}px`,
                transform: overlayElement.rotation ? `rotate(${overlayElement.rotation}deg)` : undefined,
                opacity: overlayElement.opacity !== undefined ? overlayElement.opacity : 1,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleOverlayStart({ clientX: e.clientX, clientY: e.clientY }, "move");
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (e.touches.length > 0) {
                  handleOverlayStart(
                    { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                    "move"
                  );
                }
              }}
            >
              {/* Content rendering */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
                {typeof overlayElement.content === "string" ? (
                  overlayElement.content.startsWith("data:image") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={overlayElement.content}
                      alt="Overlay content"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs font-mono text-[var(--accent)] p-1 text-center select-none">
                      {overlayElement.content || "Element"}
                    </span>
                  )
                ) : overlayElement.content instanceof HTMLImageElement ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={overlayElement.content.src}
                    alt="Overlay content"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-mono text-[var(--accent)] p-1 text-center select-none">
                    Element
                  </span>
                )}
              </div>

              {/* Resize Handle (Bottom Right) */}
              <div
                className="absolute -right-2 -bottom-2 w-5 h-5 bg-[var(--accent)] border-2 border-white rounded-full cursor-se-resize shadow"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleOverlayStart({ clientX: e.clientX, clientY: e.clientY }, "resize");
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (e.touches.length > 0) {
                    handleOverlayStart(
                      { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                      "resize"
                    );
                  }
                }}
              />
            </div>
          )}

          {/* Highlights Mode */}
          {mode === "highlight" && (
            <div className="absolute inset-0 z-20 cursor-crosshair">
              {highlights.map((hl) => (
                <div
                  key={hl.id}
                  className="absolute pointer-events-auto group border border-transparent hover:border-black/30"
                  style={{
                    left: `${hl.x * scale}px`,
                    top: `${hl.y * scale}px`,
                    width: `${hl.width * scale}px`,
                    height: `${hl.height * scale}px`,
                    backgroundColor: hl.color || currentHighlightColor,
                    opacity: hl.opacity !== undefined ? hl.opacity : currentHighlightOpacity,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onHighlightsChange) {
                        onHighlightsChange(highlights.filter((h) => h.id !== hl.id));
                      }
                    }}
                    className="absolute -top-3 -right-3 hidden group-hover:flex w-5 h-5 bg-red-600 text-white rounded-full items-center justify-center text-[10px] shadow hover:bg-red-700"
                    title="Delete highlight"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Real-time Crop Mode Overlay */}
          {mode === "crop" && cropBox && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {/* Interactive Crop Box with Dimmed Outer Box Shadow Mask */}
              <div
                className="absolute pointer-events-auto border-2 border-dashed border-[#24406B] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] cursor-move"
                style={{
                  left: `${cropBox.x * scale}px`,
                  top: `${cropBox.y * scale}px`,
                  width: `${cropBox.width * scale}px`,
                  height: `${cropBox.height * scale}px`,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-move");
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (e.touches.length > 0) {
                    handleCropStart(
                      { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                      "crop-move"
                    );
                  }
                }}
              >
                {/* 3x3 Grid Lines */}
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>

                {/* Dimension Pill */}
                <div className="absolute top-2 left-2 bg-[#24406B]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none select-none">
                  {cropBox.width} × {cropBox.height} pt
                </div>

                {/* Corner Handles */}
                <div
                  className="absolute -left-2 -top-2 w-4 h-4 bg-white border-2 border-[#24406B] rounded-full shadow cursor-nw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-nw");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-nw"
                      );
                    }
                  }}
                />
                <div
                  className="absolute -right-2 -top-2 w-4 h-4 bg-white border-2 border-[#24406B] rounded-full shadow cursor-ne-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-ne");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-ne"
                      );
                    }
                  }}
                />
                <div
                  className="absolute -left-2 -bottom-2 w-4 h-4 bg-white border-2 border-[#24406B] rounded-full shadow cursor-sw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-sw");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-sw"
                      );
                    }
                  }}
                />
                <div
                  className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border-2 border-[#24406B] rounded-full shadow cursor-se-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-se");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-se"
                      );
                    }
                  }}
                />

                {/* Edge Midpoint Handles */}
                <div
                  className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-5 h-3 bg-white border-2 border-[#24406B] rounded-sm shadow cursor-n-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-n");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-n"
                      );
                    }
                  }}
                />
                <div
                  className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-5 h-3 bg-white border-2 border-[#24406B] rounded-sm shadow cursor-s-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-s");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-s"
                      );
                    }
                  }}
                />
                <div
                  className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-5 bg-white border-2 border-[#24406B] rounded-sm shadow cursor-w-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-w");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-w"
                      );
                    }
                  }}
                />
                <div
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-5 bg-white border-2 border-[#24406B] rounded-sm shadow cursor-e-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCropStart({ clientX: e.clientX, clientY: e.clientY }, "crop-e");
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCropStart(
                        { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY },
                        "crop-e"
                      );
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
