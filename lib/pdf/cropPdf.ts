import { PDFDocument } from "pdf-lib";
import { PdfToolError } from "../utils/fileHelpers";
import { CropBox } from "@/components/shared/PdfPageEditor";

export interface CropPdfOptions {
  cropBox: CropBox;
  pageScope?: "all" | "current" | "custom";
  targetPage?: number; // 1-indexed
  customPages?: number[];
}

export async function cropPdf(
  pdfBuffer: ArrayBuffer,
  options: CropPdfOptions,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (totalPages === 0) {
      throw new PdfToolError("PDF document has no pages.", "PDF tidak memiliki halaman.");
    }

    const { cropBox } = options;

    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      if (options.pageScope === "current" && pageNum !== (options.targetPage || 1)) {
        continue;
      }
      if (options.pageScope === "custom" && options.customPages && !options.customPages.includes(pageNum)) {
        continue;
      }

      const page = pages[i];
      const { height: pageHeight, width: pageWidth } = page.getSize();

      // Convert top-left UI crop coords to bottom-left PDF coords
      const pdfX = Math.max(0, Math.min(pageWidth, cropBox.x));
      const pdfWidth = Math.max(20, Math.min(pageWidth - pdfX, cropBox.width));
      const pdfY = Math.max(0, Math.min(pageHeight, pageHeight - cropBox.y - cropBox.height));
      const pdfHeight = Math.max(20, Math.min(pageHeight - pdfY, cropBox.height));

      page.setCropBox(pdfX, pdfY, pdfWidth, pdfHeight);
      page.setMediaBox(pdfX, pdfY, pdfWidth, pdfHeight);

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalPages) * 100));
      }
    }

    return await pdfDoc.save();
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to crop PDF: ${(error as Error).message}`,
      "Gagal memotong (crop) dokumen PDF."
    );
  }
}
