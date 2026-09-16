import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import { getPageCount } from "./pdfCore";
import { PdfToolError } from "../utils/fileHelpers";

export interface ConvertedJpgPage {
  pageNumber: number; // 1-indexed
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  format: "jpg" | "png";
}

export interface PdfToJpgOptions {
  format?: "jpg" | "png"; // default "jpg"
  scale?: number; // default 2.0 (high resolution)
  quality?: number; // 0.1 to 1.0 (default 0.92 for JPG)
}

/**
 * Converts all pages of a PDF document into high-resolution JPG or PNG images.
 * Loads the document once for maximum speed and accurate page extraction.
 */
export async function convertPdfToJpgPages(
  pdfBuffer: ArrayBuffer,
  options: PdfToJpgOptions = {},
  onProgress?: (progress: number, currentPage: number, totalPages: number) => void
): Promise<ConvertedJpgPage[]> {
  try {
    const dataCopy = new Uint8Array(pdfBuffer.slice(0));
    const loadingTask = pdfjsLib.getDocument({
      data: dataCopy,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "3.11.174"}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "3.11.174"}/standard_fonts/`,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    if (totalPages === 0) {
      throw new PdfToolError("PDF document has no pages.", "PDF tidak memiliki halaman.", "NO_PAGES");
    }

    const format = options.format || "jpg";
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const scale = options.scale || 2.0;
    const quality = options.quality !== undefined ? options.quality : 0.92;
    const results: ConvertedJpgPage[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("Gagal menginisialisasi context canvas 2d");
      }

      // Fill white background (crucial for PDFs with transparent background converted to JPG)
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const blobPromise = new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error(`Gagal mengekspor halaman ${i} ke ${format.toUpperCase()} blob.`));
          },
          mimeType,
          format === "jpg" ? quality : undefined
        );
      });

      const blob = await blobPromise;
      const dataUrl = canvas.toDataURL(mimeType, format === "jpg" ? quality : undefined);

      results.push({
        pageNumber: i,
        blob,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        format,
      });

      if (onProgress) {
        onProgress(Math.round((i / totalPages) * 100), i, totalPages);
      }
    }

    return results;
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to convert PDF to image: ${(error as Error).message}`,
      "Gagal mengonversi halaman PDF menjadi gambar. Pastikan file tidak terenkripsi.",
      "CONVERT_FAILED"
    );
  }
}

/**
 * Packages converted images into a single image or ZIP archive for multiple pages.
 */
export async function packageJpgResults(
  pages: ConvertedJpgPage[],
  baseFilename: string
): Promise<{ blob: Blob; filename: string; isZip: boolean }> {
  if (pages.length === 0) {
    throw new PdfToolError("No pages to package.", "Tidak ada halaman gambar untuk diunduh.", "NO_PAGES");
  }

  const format = pages[0].format || "jpg";
  const ext = format === "png" ? "png" : "jpg";

  // If single page, download directly as single image file
  if (pages.length === 1) {
    return {
      blob: pages[0].blob,
      filename: `${baseFilename}_hal1.${ext}`,
      isZip: false,
    };
  }

  // If multiple pages, package all into a structured ZIP file
  const zip = new JSZip();
  const folder = zip.folder(baseFilename) || zip;

  pages.forEach((page) => {
    folder.file(`${baseFilename}_hal_${page.pageNumber}.${ext}`, page.blob);
  });

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return {
    blob: zipBlob,
    filename: `${baseFilename}_semua_halaman.zip`,
    isZip: true,
  };
}
