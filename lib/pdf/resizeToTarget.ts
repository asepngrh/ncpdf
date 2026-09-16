import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError, formatBytes } from "@/lib/utils/fileHelpers";

export interface ResizeTargetResult {
  pdfBytes: Uint8Array;
  achievedBytes: number;
  targetBytes: number;
  attempts: number;
  isApproximated: boolean;
  warningNote?: string;
}

/**
 * Iteratively compresses PDF images to hit a specific target size in bytes.
 * Uses binary search across image quality and scale factors.
 */
export async function resizeToTarget(
  fileBuffer: ArrayBuffer,
  targetBytes: number,
  onProgress?: (statusText: string, percent?: number) => void
): Promise<ResizeTargetResult> {
  const originalSize = fileBuffer.byteLength;

  if (originalSize <= targetBytes) {
    return {
      pdfBytes: new Uint8Array(fileBuffer),
      achievedBytes: originalSize,
      targetBytes,
      attempts: 0,
      isApproximated: false,
    };
  }

  try {
    const srcDoc = await loadPdfDocument(fileBuffer);
    const numPages = srcDoc.getPageCount();

    const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;

    let minQuality = 0.1;
    let maxQuality = 0.95;
    let bestResult: Uint8Array | null = null;
    let bestDiff = Infinity;
    let bestAchieved = originalSize;
    const maxAttempts = 6;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const quality = (minQuality + maxQuality) / 2;
      const scale = quality > 0.6 ? 1.3 : quality > 0.3 ? 1.0 : 0.8;

      if (onProgress) {
        onProgress(
          `Attempt ${attempt} of ${maxAttempts}: testing quality ${Math.round(quality * 100)}%...`,
          Math.round((attempt / maxAttempts) * 90)
        );
      }

      const newDoc = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;

          const imgDataUrl = canvas.toDataURL("image/jpeg", quality);
          const imgBytes = await fetch(imgDataUrl).then((r) => r.arrayBuffer());
          const embeddedImg = await newDoc.embedJpg(imgBytes);

          const newPage = newDoc.addPage([
            page.view[2] - page.view[0],
            page.view[3] - page.view[1],
          ]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: newPage.getWidth(),
            height: newPage.getHeight(),
          });
        }
      }

      const currentBytes = await newDoc.save({ useObjectStreams: true });
      const currentSize = currentBytes.byteLength;
      const diff = Math.abs(currentSize - targetBytes);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestResult = currentBytes;
        bestAchieved = currentSize;
      }

      // Check if within 10% tolerance of target
      if (diff / targetBytes <= 0.10) {
        return {
          pdfBytes: currentBytes,
          achievedBytes: currentSize,
          targetBytes,
          attempts: attempt,
          isApproximated: false,
        };
      }

      if (currentSize > targetBytes) {
        maxQuality = quality;
      } else {
        minQuality = quality;
      }
    }

    // Best effort result
    const isUnderTarget = bestAchieved <= targetBytes * 1.15;
    let warningNote: string | undefined;

    if (!isUnderTarget) {
      warningNote = `Closest achievable size is ~${formatBytes(bestAchieved)}. Text elements and page structure cannot be compressed further without removing content.`;
    }

    return {
      pdfBytes: bestResult || new Uint8Array(fileBuffer),
      achievedBytes: bestAchieved,
      targetBytes,
      attempts: maxAttempts,
      isApproximated: true,
      warningNote,
    };
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to resize PDF to target size.",
      "RESIZE_TARGET_ERROR"
    );
  }
}
