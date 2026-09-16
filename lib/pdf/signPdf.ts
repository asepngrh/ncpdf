import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PdfToolError } from "../utils/fileHelpers";

export interface SignPdfOptions {
  signatureDataUrl: string; // PNG data url
  x: number; // PDF points from top-left
  y: number;
  width: number;
  height: number;
  targetPage: number; // 1-indexed
  dateText?: string; // e.g. "15/09/2026"
  datePosition?: "below" | "right";
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(",");
  const binaryString = atob(parts[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function signPdf(
  pdfBuffer: ArrayBuffer,
  options: SignPdfOptions,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (totalPages === 0) {
      throw new PdfToolError("PDF document has no pages.", "PDF tidak memiliki halaman.");
    }

    const targetIdx = Math.max(0, Math.min(totalPages - 1, options.targetPage - 1));
    const page = pages[targetIdx];
    const { height: pageHeight } = page.getSize();

    if (onProgress) onProgress(25);

    const imageBytes = dataUrlToUint8Array(options.signatureDataUrl);
    const signatureImage = await pdfDoc.embedPng(imageBytes);

    if (onProgress) onProgress(50);

    const sigWidth = options.width || 140;
    const sigHeight = options.height || 60;
    const sigX = Math.max(0, options.x || 50);
    const pdfY = pageHeight - options.y - sigHeight;

    page.drawImage(signatureImage, {
      x: sigX,
      y: Math.max(0, pdfY),
      width: sigWidth,
      height: sigHeight,
    });

    // Draw date if provided
    if (options.dateText && options.dateText.trim()) {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 9;
      const dateStr = options.dateText.trim();
      const dateWidth = font.widthOfTextAtSize(dateStr, fontSize);

      if (options.datePosition === "right") {
        page.drawText(dateStr, {
          x: sigX + sigWidth + 10,
          y: Math.max(0, pdfY + sigHeight / 2 - 4),
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      } else {
        // Below
        page.drawText(dateStr, {
          x: sigX + (sigWidth - dateWidth) / 2,
          y: Math.max(0, pdfY - 12),
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
    }

    if (onProgress) onProgress(90);

    return await pdfDoc.save();
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to sign PDF: ${(error as Error).message}`,
      "Gagal membubuhkan tanda tangan pada PDF."
    );
  }
}
