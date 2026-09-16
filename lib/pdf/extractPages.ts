import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

/**
 * Extracts specified page indices into a single new PDF document.
 */
export async function extractPagesToSinglePdf(
  pdfBuffer: ArrayBuffer,
  pageIndicesToExtract: number[]
): Promise<Uint8Array> {
  if (pageIndicesToExtract.length === 0) {
    throw new PdfToolError(
      "No pages selected",
      "Please select at least one page to extract.",
      "NO_PAGES_SELECTED"
    );
  }

  try {
    const srcDoc = await loadPdfDocument(pdfBuffer);
    const newDoc = await PDFDocument.create();

    const sortedIndices = [...pageIndicesToExtract].sort((a, b) => a - b);
    const copiedPages = await newDoc.copyPages(srcDoc, sortedIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    return await newDoc.save();
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to extract selected pages.",
      "EXTRACT_ERROR"
    );
  }
}

/**
 * Extracts specified page indices into separate individual PDF files bundled in a ZIP.
 */
export async function extractPagesToZip(
  pdfBuffer: ArrayBuffer,
  pageIndicesToExtract: number[],
  baseName = "extracted_page"
): Promise<Blob> {
  if (pageIndicesToExtract.length === 0) {
    throw new PdfToolError(
      "No pages selected",
      "Please select at least one page to extract.",
      "NO_PAGES_SELECTED"
    );
  }

  try {
    const srcDoc = await loadPdfDocument(pdfBuffer);
    const zip = new JSZip();

    for (const pageIdx of pageIndicesToExtract) {
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIdx]);
      newDoc.addPage(copiedPage);
      const pageBytes = await newDoc.save();
      const pageNumStr = String(pageIdx + 1).padStart(3, "0");
      zip.file(`${baseName}_page_${pageNumStr}.pdf`, pageBytes);
    }

    return await zip.generateAsync({ type: "blob" });
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to package extracted pages into ZIP.",
      "EXTRACT_ZIP_ERROR"
    );
  }
}
