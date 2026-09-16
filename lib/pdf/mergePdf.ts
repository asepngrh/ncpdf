import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

/**
 * Merges multiple PDF ArrayBuffers in sequence into a single PDF document.
 */
export async function mergePdf(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  if (pdfBuffers.length < 2) {
    throw new PdfToolError(
      "Insufficient files for merging",
      "Please provide at least 2 PDF files to merge.",
      "MERGE_MIN_FILES"
    );
  }

  try {
    const mergedDoc = await PDFDocument.create();

    for (let i = 0; i < pdfBuffers.length; i++) {
      const buffer = pdfBuffers[i];
      const doc = await loadPdfDocument(buffer);
      const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    return await mergedDoc.save();
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to merge PDF documents. One of the files may be damaged.",
      "MERGE_FAILED"
    );
  }
}
