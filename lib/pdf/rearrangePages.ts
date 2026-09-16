import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

/**
 * Creates a new PDF document with pages ordered according to pageIndicesInNewOrder.
 */
export async function rearrangePages(
  pdfBuffer: ArrayBuffer,
  pageIndicesInNewOrder: number[]
): Promise<Uint8Array> {
  if (pageIndicesInNewOrder.length === 0) {
    throw new PdfToolError(
      "Empty page sequence",
      "No pages specified for rearrangement.",
      "EMPTY_PAGE_SEQUENCE"
    );
  }

  try {
    const srcDoc = await loadPdfDocument(pdfBuffer);
    const newDoc = await PDFDocument.create();

    const copiedPages = await newDoc.copyPages(srcDoc, pageIndicesInNewOrder);
    copiedPages.forEach((page) => newDoc.addPage(page));

    return await newDoc.save();
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to reorder PDF pages.",
      "REARRANGE_ERROR"
    );
  }
}
