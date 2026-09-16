import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

/**
 * Removes specified page indices from a PDF document.
 */
export async function deletePages(
  pdfBuffer: ArrayBuffer,
  pageIndicesToDelete: number[]
): Promise<Uint8Array> {
  const deleteSet = new Set(pageIndicesToDelete);

  if (deleteSet.size === 0) {
    throw new PdfToolError(
      "No pages selected",
      "Please select at least one page to delete.",
      "NO_PAGES_SELECTED"
    );
  }

  try {
    const srcDoc = await loadPdfDocument(pdfBuffer);
    const totalPages = srcDoc.getPageCount();

    const remainingIndices: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (!deleteSet.has(i)) {
        remainingIndices.push(i);
      }
    }

    if (remainingIndices.length === 0) {
      throw new PdfToolError(
        "Cannot delete all pages",
        "A PDF document must have at least one page remaining.",
        "CANNOT_DELETE_ALL_PAGES"
      );
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, remainingIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    return await newDoc.save();
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to delete selected pages.",
      "DELETE_PAGES_ERROR"
    );
  }
}
