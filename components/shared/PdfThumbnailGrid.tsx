"use client";

import React, { useEffect, useState } from "react";
import { RotateCw, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { renderPageToCanvas, getPageCount } from "@/lib/pdf/pdfCore";

export interface PageThumbnailItem {
  pageIndex: number; // 0-based index
  pageNumber: number; // 1-based display number
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
  selected?: boolean;
}

interface PdfThumbnailGridProps {
  pdfBytes: ArrayBuffer | null;
  pages?: PageThumbnailItem[];
  selectable?: boolean;
  canRotate?: boolean;
  canDelete?: boolean;
  canReorder?: boolean;
  scale?: number;
  onPagesChange?: (pages: PageThumbnailItem[]) => void;
  onPageSelect?: (pageIndex: number) => void;
}

export function PdfThumbnailGrid({
  pdfBytes,
  pages: externalPages,
  selectable = false,
  canRotate = false,
  canDelete = false,
  canReorder = false,
  scale = 0.4,
  onPagesChange,
  onPageSelect,
}: PdfThumbnailGridProps) {
  const [internalPages, setInternalPages] = useState<PageThumbnailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const pages = externalPages || internalPages;

  useEffect(() => {
    if (!pdfBytes || externalPages) return;

    let isCancelled = false;
    setLoading(true);

    async function loadThumbnails() {
      try {
        const count = await getPageCount(pdfBytes!);
        const items: PageThumbnailItem[] = [];

        for (let i = 0; i < count; i++) {
          if (isCancelled) return;
          const canvas = await renderPageToCanvas(pdfBytes!, i, scale);
          items.push({
            pageIndex: i,
            pageNumber: i + 1,
            dataUrl: canvas.toDataURL("image/jpeg", 0.75),
            rotation: 0,
            selected: false,
          });
        }

        if (!isCancelled) {
          setInternalPages(items);
          if (onPagesChange) onPagesChange(items);
        }
      } catch (err) {
        console.error("Failed to render PDF page thumbnails:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadThumbnails();

    return () => {
      isCancelled = true;
    };
  }, [pdfBytes]);

  const handleToggleSelect = (pageIndex: number) => {
    if (!selectable) return;
    const updated = pages.map((p) =>
      p.pageIndex === pageIndex ? { ...p, selected: !p.selected } : p
    );
    if (!externalPages) setInternalPages(updated);
    if (onPagesChange) onPagesChange(updated);
    if (onPageSelect) onPageSelect(pageIndex);
  };

  const handleRotatePage = (pageIndex: number) => {
    const updated = pages.map((p) =>
      p.pageIndex === pageIndex
        ? { ...p, rotation: (p.rotation + 90) % 360 }
        : p
    );
    if (!externalPages) setInternalPages(updated);
    if (onPagesChange) onPagesChange(updated);
  };

  const handleDeletePage = (pageIndex: number) => {
    const updated = pages.filter((p) => p.pageIndex !== pageIndex);
    if (!externalPages) setInternalPages(updated);
    if (onPagesChange) onPagesChange(updated);
  };

  const handleMovePage = (currentIndex: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const updated = [...pages];
    const temp = updated[currentIndex];
    updated[currentIndex] = updated[targetIndex];
    updated[targetIndex] = temp;

    if (!externalPages) setInternalPages(updated);
    if (onPagesChange) onPagesChange(updated);
  };

  // Native HTML5 Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!canReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!canReorder || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!canReorder || draggedIndex === null || draggedIndex === dropIndex) return;
    e.preventDefault();

    const updated = [...pages];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    setDraggedIndex(null);
    if (!externalPages) setInternalPages(updated);
    if (onPagesChange) onPagesChange(updated);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-ink-muted">
        Loading page thumbnails...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {pages.map((page, index) => {
        const isSelected = !!page.selected;

        return (
          <div
            key={`${page.pageIndex}-${index}`}
            draggable={canReorder}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`group relative flex flex-col p-2 rounded-md bg-surface border transition-colors duration-120 ${
              selectable && isSelected
                ? "border-accent ring-2 ring-accent"
                : "border-rule hover:border-ink-muted"
            } ${canReorder ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            {/* Header: Page number + Checkbox */}
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="font-mono text-[11px] text-ink-muted">
                #{index + 1}
              </span>

              {selectable && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleSelect(page.pageIndex)}
                  className="w-3.5 h-3.5 rounded border-rule text-accent focus:ring-accent accent-accent cursor-pointer"
                />
              )}
            </div>

            {/* Thumbnail Canvas Preview */}
            <div
              onClick={() => selectable && handleToggleSelect(page.pageIndex)}
              className="w-full aspect-[3/4] bg-paper rounded border border-rule/50 overflow-hidden flex items-center justify-center cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.dataUrl}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-full object-contain transition-transform duration-200"
                style={{
                  transform: `rotate(${page.rotation || 0}deg)`,
                }}
              />
            </div>

            {/* Action buttons (Reorder, Rotate, Delete) */}
            {(canRotate || canDelete || canReorder) && (
              <div className="mt-2 pt-1.5 border-t border-rule flex items-center justify-center gap-1">
                {canReorder && (
                  <>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMovePage(index, "left")}
                      className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-20 hover:bg-paper"
                      title="Move left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === pages.length - 1}
                      onClick={() => handleMovePage(index, "right")}
                      className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-20 hover:bg-paper"
                      title="Move right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {canRotate && (
                  <button
                    type="button"
                    onClick={() => handleRotatePage(page.pageIndex)}
                    className="p-1 rounded text-ink-muted hover:text-accent hover:bg-paper"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeletePage(page.pageIndex)}
                    className="p-1 rounded text-ink-muted hover:text-warning hover:bg-paper"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
