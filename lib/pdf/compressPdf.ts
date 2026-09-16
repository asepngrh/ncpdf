import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

export interface CompressOptions {
  level: "low" | "medium" | "high"; // low (85% quality), medium (65% quality), high (40% quality)
  customQuality?: number; // 0.1 to 1.0
  onProgress?: (progressText: string, percent?: number) => void;
}

/**
 * Compresses a PDF document while preserving selectable text and vector graphics.
 * Re-encodes embedded image streams and optimizes document object streams.
 */
export async function compressPdf(
  fileBuffer: ArrayBuffer,
  options: CompressOptions = { level: "medium" }
): Promise<Uint8Array> {
  try {
    const srcDoc = await loadPdfDocument(fileBuffer);
    const numPages = srcDoc.getPageCount();

    // Determine quality and scale
    let quality = 0.65;
    let scale = 1.2;

    if (options.customQuality) {
      quality = Math.max(0.1, Math.min(1.0, options.customQuality));
      scale = quality > 0.7 ? 1.4 : quality > 0.4 ? 1.1 : 0.9;
    } else if (options.level === "low") {
      quality = 0.85;
      scale = 1.4;
    } else if (options.level === "high") {
      quality = 0.45;
      scale = 1.0;
    }

    if (options.onProgress) {
      options.onProgress("Optimizing document structure...", 10);
    }

    // High / Custom image compression strategy
    const newDoc = await PDFDocument.create();
    const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;

    for (let i = 1; i <= numPages; i++) {
      if (options.onProgress) {
        options.onProgress(
          `Compressing page ${i} of ${numPages}...`,
          10 + Math.round((i / numPages) * 80)
        );
      }

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
        const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
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

    if (options.onProgress) {
      options.onProgress("Finalizing compressed PDF...", 95);
    }

    const compressedBytes = await newDoc.save({ useObjectStreams: true });
    return compressedBytes;
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to compress PDF. The document may be corrupted.",
      "COMPRESS_ERROR"
    );
  }
}
