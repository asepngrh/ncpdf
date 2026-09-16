import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

/**
 * Parses user range string (e.g. "1-3, 5, 7-9") into 0-based page indices.
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(",").map((p) => p.trim());

  for (const part of parts) {
    if (!part) continue;
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          pages.add(i - 1);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pages.add(page - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Splits PDF by custom range into a single PDF document.
 */
export async function splitPdfByRange(
  pdfBuffer: ArrayBuffer,
  rangeStr: string
): Promise<Uint8Array> {
  const srcDoc = await loadPdfDocument(pdfBuffer);
  const totalPages = srcDoc.getPageCount();
  const selectedIndices = parsePageRange(rangeStr, totalPages);

  if (selectedIndices.length === 0) {
    throw new PdfToolError(
      "Invalid page range",
      `Please enter a valid page range between 1 and ${totalPages}.`,
      "INVALID_PAGE_RANGE"
    );
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  return await newDoc.save();
}

/**
 * Splits every page into individual PDF documents and bundles them in a ZIP archive.
 */
export async function splitPdfToZip(
  pdfBuffer: ArrayBuffer,
  baseName = "page"
): Promise<Blob> {
  const srcDoc = await loadPdfDocument(pdfBuffer);
  const totalPages = srcDoc.getPageCount();
  const zip = new JSZip();

  for (let i = 0; i < totalPages; i++) {
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(copiedPage);
    const pageBytes = await newDoc.save();
    const pageNumStr = String(i + 1).padStart(3, "0");
    zip.file(`${baseName}_${pageNumStr}.pdf`, pageBytes);
  }

  return await zip.generateAsync({ type: "blob" });
}
