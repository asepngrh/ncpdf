import { PDFDocument, StandardFonts } from "pdf-lib";
import { PdfToolError } from "../utils/fileHelpers";
import { hexToRgb } from "./watermarkPdf";

export type PageNumberPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface PageNumberOptions {
  position?: PageNumberPosition;
  format?: string; // e.g. "Page {page} of {total}" or "{page}"
  fontFamily?: "Helvetica" | "TimesRoman" | "Courier";
  fontSize?: number;
  colorHex?: string;
  margin?: number; // points
  startPageNumber?: number; // numbering starts from this number (e.g. 1)
  firstPageToNumber?: number; // 1-indexed page where numbering begins (e.g. skip cover page = 2)
}

export async function addPageNumbersToPdf(
  pdfBuffer: ArrayBuffer,
  options: PageNumberOptions = {},
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (totalPages === 0) {
      throw new PdfToolError("PDF document has no pages.", "PDF tidak memiliki halaman.");
    }

    const font = await pdfDoc.embedFont(
      options.fontFamily === "TimesRoman"
        ? StandardFonts.TimesRoman
        : options.fontFamily === "Courier"
        ? StandardFonts.Courier
        : StandardFonts.Helvetica
    );

    const position = options.position || "bottom-center";
    const format = options.format || "Page {page} of {total}";
    const fontSize = options.fontSize || 10;
    const color = hexToRgb(options.colorHex || "#333333");
    const margin = options.margin !== undefined ? options.margin : 28;
    const startPageNumber = options.startPageNumber || 1;
    const firstPageToNumber = options.firstPageToNumber || 1;

    for (let i = 0; i < totalPages; i++) {
      const pageIndex = i + 1;
      if (pageIndex < firstPageToNumber) {
        continue;
      }

      const page = pages[i];
      const { width, height } = page.getSize();

      const currentNumber = startPageNumber + (pageIndex - firstPageToNumber);
      const effectiveTotal = totalPages - firstPageToNumber + 1;

      const pageText = format
        .replace(/{page}/g, String(currentNumber))
        .replace(/{total}/g, String(effectiveTotal));

      const textWidth = font.widthOfTextAtSize(pageText, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      let x = margin;
      let y = margin;

      // Calculate X coordinate
      if (position.includes("left")) {
        x = margin;
      } else if (position.includes("center")) {
        x = (width - textWidth) / 2;
      } else if (position.includes("right")) {
        x = width - margin - textWidth;
      }

      // Calculate Y coordinate
      if (position.startsWith("top")) {
        y = height - margin - textHeight;
      } else if (position.startsWith("bottom")) {
        y = margin;
      }

      page.drawText(pageText, {
        x,
        y,
        size: fontSize,
        font,
        color,
      });

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalPages) * 100));
      }
    }

    return await pdfDoc.save();
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to add page numbers: ${(error as Error).message}`,
      "Gagal menambahkan nomor halaman pada PDF."
    );
  }
}
