import { PDFDocument } from "pdf-lib";
import { PdfToolError } from "../utils/fileHelpers";
import { hexToRgb } from "./watermarkPdf";
import { OverlayElement } from "@/components/shared/PdfPageEditor";

export interface HighlightItem extends OverlayElement {
  pageNumber: number; // 1-indexed
}

export async function highlightPdf(
  pdfBuffer: ArrayBuffer,
  highlights: HighlightItem[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (totalPages === 0) {
      throw new PdfToolError("PDF document has no pages.", "PDF tidak memiliki halaman.");
    }

    if (highlights.length === 0) {
      throw new PdfToolError("No highlights provided.", "Tidak ada area highlight yang ditandai.");
    }

    const totalHighlights = highlights.length;

    highlights.forEach((hl, idx) => {
      const pageIndex = Math.max(0, Math.min(totalPages - 1, hl.pageNumber - 1));
      const page = pages[pageIndex];
      const { height: pageHeight } = page.getSize();

      const color = hexToRgb(hl.color || "#FFEB3B");
      const opacity = hl.opacity !== undefined ? hl.opacity : 0.4;
      const pdfX = Math.max(0, hl.x);
      const pdfY = pageHeight - hl.y - hl.height;

      page.drawRectangle({
        x: pdfX,
        y: Math.max(0, pdfY),
        width: hl.width,
        height: hl.height,
        color,
        opacity,
      });

      if (onProgress) {
        onProgress(Math.round(((idx + 1) / totalHighlights) * 100));
      }
    });

    return await pdfDoc.save();
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to highlight PDF: ${(error as Error).message}`,
      "Gagal membubuhkan highlight pada PDF."
    );
  }
}
