import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "@/lib/pdf/pdfCore";
import { PdfToolError } from "@/lib/utils/fileHelpers";

/**
 * Increases PDF file size to hit a minimum target bytes requirement (e.g. for portal upload).
 * Preserves visual appearance while adding safe compliant metadata padding.
 */
export async function increasePdfSize(
  fileBuffer: ArrayBuffer,
  targetBytes: number
): Promise<Uint8Array> {
  const originalSize = fileBuffer.byteLength;

  if (originalSize >= targetBytes) {
    return new Uint8Array(fileBuffer);
  }

  try {
    const doc = await loadPdfDocument(fileBuffer);
    const paddingNeeded = targetBytes - originalSize;

    // Inject safe metadata keyword padding
    const chunkLength = Math.min(paddingNeeded, 10 * 1024 * 1024); // max 10MB chunk
    const paddingData = "NCPDF_PAD_DATA_".repeat(Math.ceil(chunkLength / 15)).slice(0, chunkLength);

    doc.setKeywords([`ncpdf_padding_${Date.now()}`, paddingData]);
    const saved = await doc.save();

    if (saved.byteLength < targetBytes) {
      const remainingDiff = targetBytes - saved.byteLength;
      if (remainingDiff > 0) {
        // Safe standard PDF trailing comment block
        const paddingComment = `\n% ncpdf-padding: ` + "A".repeat(Math.max(0, remainingDiff - 22)) + `\n%%EOF`;
        const encoder = new TextEncoder();
        const commentBytes = encoder.encode(paddingComment);

        const combined = new Uint8Array(saved.byteLength + commentBytes.byteLength);
        combined.set(saved, 0);
        combined.set(commentBytes, saved.byteLength);
        return combined;
      }
    }

    return saved;
  } catch (err: any) {
    if (err instanceof PdfToolError) throw err;
    throw new PdfToolError(
      err.message,
      "Failed to increase PDF size.",
      "INCREASE_SIZE_ERROR"
    );
  }
}
