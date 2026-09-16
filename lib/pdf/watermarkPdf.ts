import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { PdfToolError } from "../utils/fileHelpers";

export interface TextWatermarkOptions {
  type: "text";
  text: string;
  fontFamily?: "Helvetica" | "TimesRoman" | "Courier";
  fontSize?: number;
  colorHex?: string;
  opacity?: number;
  rotation?: number; // in degrees
  layout?: "single" | "tile";
  textAlign?: "left" | "center" | "right";
  pageScope?: "all" | "custom";
  customPages?: number[]; // 1-indexed
}

export interface ImageWatermarkOptions {
  type: "image";
  imageDataUrl: string; // base64 / data url
  opacity?: number;
  scale?: number; // 0.1 to 2.0
  pageScope?: "all" | "custom";
  customPages?: number[]; // 1-indexed
}

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

// Helper to convert hex to rgb (0-1)
export function hexToRgb(hex: string) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
}

// Convert data URL to Uint8Array
function dataUrlToUint8Array(dataUrl: string): { bytes: Uint8Array; format: "png" | "jpg" } {
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

export async function watermarkPdf(
  pdfBuffer: ArrayBuffer,
  options: WatermarkOptions,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (totalPages === 0) {
      throw new PdfToolError("PDF document has no pages.", "PDF tidak memiliki halaman.");
    }

    if (options.type === "text") {
      const font = await pdfDoc.embedFont(
        options.fontFamily === "TimesRoman"
          ? StandardFonts.TimesRomanBold
          : options.fontFamily === "Courier"
          ? StandardFonts.CourierBold
          : StandardFonts.HelveticaBold
      );

      const fontSize = options.fontSize || 42;
      const color = hexToRgb(options.colorHex || "#666666");
      const opacity = options.opacity !== undefined ? options.opacity : 0.35;
      const rotDeg = options.rotation !== undefined ? options.rotation : 45;
      const rotation = degrees(rotDeg);
      const rotRad = rotDeg * (Math.PI / 180);
      const layout = options.layout || "single";
      const textAlign = options.textAlign || "center";
      const text = options.text || "WATERMARK";

      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        if (options.pageScope === "custom" && options.customPages && !options.customPages.includes(pageNum)) {
          continue;
        }

        const page = pages[i];
        const { width, height } = page.getSize();

        if (layout === "single") {
          let x: number;
          let y: number;

          if (textAlign === "left") {
            const marginX = 40;
            const centerY = height / 2;
            x = marginX;
            y = centerY - (textHeight / 2) * Math.cos(rotRad);
          } else if (textAlign === "right") {
            const marginX = 40;
            const centerY = height / 2;
            x = width - marginX - textWidth * Math.cos(rotRad);
            y = centerY - textWidth * Math.sin(rotRad) - (textHeight / 2) * Math.cos(rotRad);
          } else {
            // Center alignment
            x = width / 2 - (textWidth / 2) * Math.cos(rotRad) + (textHeight / 4) * Math.sin(rotRad);
            y = height / 2 - (textWidth / 2) * Math.sin(rotRad) - (textHeight / 4) * Math.cos(rotRad);
          }

          page.drawText(text, {
            x: Math.max(10, Math.min(width - 10, x)),
            y: Math.max(10, Math.min(height - 10, y)),
            size: fontSize,
            font,
            color,
            opacity,
            rotate: rotation,
          });
        } else {
          // Tile layout across page
          const stepX = Math.max(160, textWidth + 60);
          const stepY = Math.max(120, textHeight + 80);
          const offsetX = textAlign === "left" ? -80 : textAlign === "right" ? 0 : -40;

          for (let tx = offsetX; tx < width + 100; tx += stepX) {
            for (let ty = -50; ty < height + 100; ty += stepY) {
              page.drawText(text, {
                x: tx,
                y: ty,
                size: fontSize,
                font,
                color,
                opacity,
                rotate: rotation,
              });
            }
          }
        }

        if (onProgress) {
          onProgress(Math.round(((i + 1) / totalPages) * 100));
        }
      }
    } else {
      // Image watermark
      const { bytes, format } = dataUrlToUint8Array(options.imageDataUrl);
      const embeddedImage = format === "png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

      const opacity = options.opacity !== undefined ? options.opacity : 0.4;
      const scaleMultiplier = options.scale || 0.6;

      for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        if (options.pageScope === "custom" && options.customPages && !options.customPages.includes(pageNum)) {
          continue;
        }

        const page = pages[i];
        const { width, height } = page.getSize();

        // Fit image nicely into page
        const imgDims = embeddedImage.scale(scaleMultiplier);
        const drawWidth = Math.min(width * 0.8, imgDims.width);
        const drawHeight = (drawWidth / imgDims.width) * imgDims.height;
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
          opacity,
        });

        if (onProgress) {
          onProgress(Math.round(((i + 1) / totalPages) * 100));
        }
      }
    }

    return await pdfDoc.save();
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to apply watermark: ${(error as Error).message}`,
      "Gagal membubuhkan watermark pada PDF. Format dokumen mungkin tidak valid."
    );
  }
}
