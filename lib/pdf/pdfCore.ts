import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { PdfToolError } from "@/lib/utils/fileHelpers";

// Configure pdf.js worker with cross-origin Blob URL workaround for 100% browser compatibility
if (typeof window !== "undefined") {
  const version = pdfjsLib.version || "3.11.174";
  const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
  try {
    const blob = new Blob([`importScripts("${workerSrc}");`], {
      type: "application/javascript",
    });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }
}

/**
 * Loads a PDFDocument instance using pdf-lib.
 * Throws clean PdfToolError on corrupt or encrypted files.
 */
export async function loadPdfDocument(bytes: ArrayBuffer): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes.slice(0), { ignoreEncryption: false });
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes("encrypted")) {
      throw new PdfToolError(
        err.message,
        "Dokumen PDF ini memiliki kata sandi (password). Silakan buka kuncinya terlebih dahulu.",
        "ENCRYPTED_PDF"
      );
    }
    throw new PdfToolError(
      err.message,
      "Gagal membaca file PDF. File mungkin rusak atau format tidak didukung.",
      "CORRUPT_PDF"
    );
  }
}

/**
 * Returns the total number of pages in a PDF document.
 * Uses pure JS pdf-lib first for instant parsing, then falls back to pdfjs-dist.
 */
export async function getPageCount(bytes: ArrayBuffer): Promise<number> {
  // 1. Primary method: pdf-lib (Synchronous pure JS, super fast & reliable)
  try {
    const doc = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });
    const count = doc.getPageCount();
    if (count > 0) return count;
  } catch {
    // Fall back to pdfjs-dist
  }

  // 2. Fallback method: pdfjs-dist
  try {
    const dataCopy = new Uint8Array(bytes.slice(0));
    const loadingTask = pdfjsLib.getDocument({
      data: dataCopy,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "3.11.174"}/cmaps/`,
      cMapPacked: true,
    });
    const pdf = await loadingTask.promise;
    return pdf.numPages;
  } catch (err: any) {
    if (err.name === "PasswordException") {
      throw new PdfToolError(
        err.message,
        "Dokumen PDF ini memiliki kata sandi (password).",
        "ENCRYPTED_PDF"
      );
    }
    return 1;
  }
}

/**
 * Returns the width and height in points of a given page in the PDF.
 */
export async function getPageDimensions(
  bytes: ArrayBuffer,
  pageIndex = 0
): Promise<{ width: number; height: number }> {
  try {
    const doc = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });
    const pages = doc.getPages();
    if (pages.length > 0) {
      const targetPage = pages[Math.min(pageIndex, pages.length - 1)];
      const { width, height } = targetPage.getSize();
      return { width: Math.round(width), height: Math.round(height) };
    }
  } catch {
    // fallback
  }
  return { width: 595, height: 842 };
}

/**
 * Renders a specific page of a PDF document to an HTMLCanvasElement using pdfjs-dist.
 * @param bytes ArrayBuffer of the PDF file
 * @param pageIndex 0-based page index (e.g. 0 for page 1)
 * @param scale zoom/resolution scale (default 0.5 for thumbnails)
 */
export async function renderPageToCanvas(
  bytes: ArrayBuffer,
  pageIndex: number,
  scale = 0.5
): Promise<HTMLCanvasElement> {
  try {
    const dataCopy = new Uint8Array(bytes.slice(0));
    const loadingTask = pdfjsLib.getDocument({
      data: dataCopy,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "3.11.174"}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "3.11.174"}/standard_fonts/`,
    });

    const pdf = await loadingTask.promise;
    const pageNumber = Math.min(Math.max(1, pageIndex + 1), pdf.numPages);
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Gagal menginisialisasi canvas context 2d");
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    // Draw clean white background for PDF page
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas;
  } catch (err: any) {
    console.warn(`Render canvas error for page ${pageIndex + 1}:`, err);
    throw new PdfToolError(
      err.message,
      `Gagal merender halaman ${pageIndex + 1}.`,
      "RENDER_PAGE_ERROR"
    );
  }
}
