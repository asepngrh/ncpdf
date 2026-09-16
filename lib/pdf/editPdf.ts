import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { PdfToolError } from "../utils/fileHelpers";
import { hexToRgb } from "./watermarkPdf";

export type EditElementType = "text" | "image" | "draw" | "shape";
export type ShapeKind = "rectangle" | "circle" | "line" | "arrow";

export interface BaseEditElement {
  id: string;
  type: EditElementType;
  x: number; // in PDF points (72 DPI) from top-left
  y: number; // in PDF points (72 DPI) from top-left
  width: number;
  height: number;
  rotation?: number; // degrees
  opacity?: number; // 0 to 1
}

export interface TextEditElement extends BaseEditElement {
  type: "text";
  text: string;
  fontFamily: "Helvetica" | "TimesRoman" | "Courier";
  fontSize: number;
  colorHex: string;
  isBold?: boolean;
  isItalic?: boolean;
}

export interface ImageEditElement extends BaseEditElement {
  type: "image";
  dataUrl: string;
}

export interface DrawEditElement extends BaseEditElement {
  type: "draw";
  points: Array<{ x: number; y: number }>;
  strokeColor: string;
  strokeWidth: number;
  canvasDataUrl?: string; // High-res rasterized stroke snapshot
}

export interface ShapeEditElement extends BaseEditElement {
  type: "shape";
  shapeKind: ShapeKind;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string; // null / transparent if undefined
  hasFill?: boolean;
}

export type PdfEditElement =
  | TextEditElement
  | ImageEditElement
  | DrawEditElement
  | ShapeEditElement;

/**
 * Convert data URL to Uint8Array and determine MIME type
 */
function parseDataUrl(dataUrl: string): { bytes: Uint8Array; format: "png" | "jpg" } {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const binaryString = atob(parts[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return {
    bytes,
    format: mime.includes("png") ? "png" : "jpg",
  };
}

/**
 * Applies all user additions (texts, images, drawings, shapes) across all PDF pages.
 */
export async function applyPdfEdits(
  pdfBuffer: ArrayBuffer,
  pageEdits: Record<number, PdfEditElement[]>, // 1-indexed page number -> elements
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (totalPages === 0) {
      throw new PdfToolError("PDF document has no pages.", "Dokumen PDF kosong.");
    }

    // Pre-embed standard fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);
    const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      const page = pages[i];
      const { height: pageHeight, width: pageWidth } = page.getSize();
      const elements = pageEdits[pageNum] || [];

      for (const elem of elements) {
        const opacity = elem.opacity !== undefined ? elem.opacity : 1.0;
        const rotation = elem.rotation || 0;

        // Convert UI coordinate (origin at top-left) to PDF coordinate (origin at bottom-left)
        // PDF Y = pageHeight - elem.y - elem.height
        const pdfX = elem.x;
        const pdfY = pageHeight - elem.y - elem.height;

        if (elem.type === "text") {
          const font =
            elem.fontFamily === "TimesRoman"
              ? elem.isBold
                ? timesRomanBold
                : timesRoman
              : elem.fontFamily === "Courier"
              ? elem.isBold
                ? courierBold
                : courier
              : elem.isBold
              ? helveticaBold
              : helvetica;

          const color = hexToRgb(elem.colorHex || "#000000");

          // Text lines support
          const lines = elem.text.split("\n");
          const lineHeight = elem.fontSize * 1.2;

          for (let l = 0; l < lines.length; l++) {
            const line = lines[l];
            if (!line) continue;
            const lineY = pageHeight - elem.y - elem.fontSize - l * lineHeight;

            page.drawText(line, {
              x: pdfX,
              y: lineY,
              size: elem.fontSize,
              font,
              color,
              opacity,
              rotate: degrees(rotation),
            });
          }
        } else if (elem.type === "image") {
          if (elem.dataUrl) {
            const { bytes, format } = parseDataUrl(elem.dataUrl);
            const embedded =
              format === "png"
                ? await pdfDoc.embedPng(bytes)
                : await pdfDoc.embedJpg(bytes);

            page.drawImage(embedded, {
              x: pdfX,
              y: pdfY,
              width: elem.width,
              height: elem.height,
              opacity,
              rotate: degrees(rotation),
            });
          }
        } else if (elem.type === "draw") {
          // If a high-res rasterized stroke snapshot exists, embed as transparent PNG
          if (elem.canvasDataUrl) {
            const { bytes } = parseDataUrl(elem.canvasDataUrl);
            const embedded = await pdfDoc.embedPng(bytes);
            page.drawImage(embedded, {
              x: pdfX,
              y: pdfY,
              width: elem.width,
              height: elem.height,
              opacity,
              rotate: degrees(rotation),
            });
          } else if (elem.points && elem.points.length > 1) {
            // Draw vector lines between consecutive points
            const strokeColor = hexToRgb(elem.strokeColor || "#000000");
            const thickness = elem.strokeWidth || 2;

            for (let p = 0; p < elem.points.length - 1; p++) {
              const p1 = elem.points[p];
              const p2 = elem.points[p + 1];

              page.drawLine({
                start: { x: p1.x, y: pageHeight - p1.y },
                end: { x: p2.x, y: pageHeight - p2.y },
                thickness,
                color: strokeColor,
                opacity,
              });
            }
          }
        } else if (elem.type === "shape") {
          const strokeColor = hexToRgb(elem.strokeColor || "#000000");
          const borderWidth = elem.strokeWidth || 2;
          const fillColor =
            elem.hasFill && elem.fillColor ? hexToRgb(elem.fillColor) : undefined;

          if (elem.shapeKind === "rectangle") {
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: elem.width,
              height: elem.height,
              borderColor: strokeColor,
              borderWidth,
              color: fillColor,
              opacity,
              rotate: degrees(rotation),
            });
          } else if (elem.shapeKind === "circle") {
            const xRadius = elem.width / 2;
            const yRadius = elem.height / 2;
            page.drawEllipse({
              x: pdfX + xRadius,
              y: pdfY + yRadius,
              xScale: xRadius,
              yScale: yRadius,
              borderColor: strokeColor,
              borderWidth,
              color: fillColor,
              opacity,
              rotate: degrees(rotation),
            });
          } else if (elem.shapeKind === "line") {
            page.drawLine({
              start: { x: pdfX, y: pageHeight - elem.y },
              end: { x: pdfX + elem.width, y: pdfY },
              thickness: borderWidth,
              color: strokeColor,
              opacity,
            });
          } else if (elem.shapeKind === "arrow") {
            const startX = pdfX;
            const startY = pageHeight - elem.y;
            const endX = pdfX + elem.width;
            const endY = pdfY;

            // Main line
            page.drawLine({
              start: { x: startX, y: startY },
              end: { x: endX, y: endY },
              thickness: borderWidth,
              color: strokeColor,
              opacity,
            });

            // Arrow head
            const angle = Math.atan2(endY - startY, endX - startX);
            const headLen = Math.max(10, borderWidth * 3.5);

            page.drawLine({
              start: { x: endX, y: endY },
              end: {
                x: endX - headLen * Math.cos(angle - Math.PI / 6),
                y: endY - headLen * Math.sin(angle - Math.PI / 6),
              },
              thickness: borderWidth,
              color: strokeColor,
              opacity,
            });

            page.drawLine({
              start: { x: endX, y: endY },
              end: {
                x: endX - headLen * Math.cos(angle + Math.PI / 6),
                y: endY - headLen * Math.sin(angle + Math.PI / 6),
              },
              thickness: borderWidth,
              color: strokeColor,
              opacity,
            });
          }
        }
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalPages) * 100));
      }
    }

    return await pdfDoc.save();
  } catch (err: unknown) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      `Gagal menyimpan perubahan PDF: ${(err as Error).message}`,
      "Gagal memproses dan menyimpan hasil editan PDF."
    );
  }
}
