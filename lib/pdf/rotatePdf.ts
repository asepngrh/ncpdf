import { PDFDocument, degrees } from "pdf-lib";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

export interface PageRotation {
  pageIndex: number; // 0-based
  rotation: number; // 0, 90, 180, 270
}

/**
 * Rotates specific pages in a PDF document.
 */
export async function rotatePdf(
  pdfBuffer: ArrayBuffer,
  rotations: PageRotation[]
): Promise<Uint8Array> {
  try {
    const doc = await loadPdfDocument(pdfBuffer);
    const pages = doc.getPages();

    const rotMap = new Map<number, number>();
    for (const r of rotations) {
      rotMap.set(r.pageIndex, r.rotation);
    }

    pages.forEach((page, idx) => {
      if (rotMap.has(idx)) {
        const addedRot = rotMap.get(idx)!;
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + addedRot) % 360));
      }
    });

    return await doc.save();
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to rotate PDF document.",
      "ROTATE_ERROR"
    );
  }
}

/**
 * Rotates all pages in a PDF document by a specified degree.
 */
export async function rotateAllPages(
  pdfBuffer: ArrayBuffer,
  addedDegrees: number
): Promise<Uint8Array> {
  try {
    const doc = await loadPdfDocument(pdfBuffer);
    const pages = doc.getPages();

    pages.forEach((page) => {
      const currentRot = page.getRotation().angle;
      page.setRotation(degrees((currentRot + addedDegrees) % 360));
    });

    return await doc.save();
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to rotate all pages in PDF document.",
      "ROTATE_ALL_ERROR"
    );
  }
}
