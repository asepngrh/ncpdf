import { PDFDocument, degrees } from "pdf-lib";
import { PdfToolError } from "../utils/fileHelpers";

export interface AddImageOptions {
  imageDataUrl: string;
  mode: "overlay" | "new-page";
  // Overlay positioning (in PDF points, from top-left)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number; // degrees
  opacity?: number;
  pageScope?: "current" | "all" | "custom";
  targetPage?: number; // 1-indexed
  customPages?: number[];
  // New page placement
  newPagePosition?: "start" | "end" | "after-page";
}

function dataUrlToUint8Array(dataUrl: string): { bytes: Uint8Array; format: "png" | "jpg" } {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const binaryString = atob(parts[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return {
    bytes,
    format: mime.includes("png") ? "png" : "jpg",
  };
}

export async function addImageToPdf(
  pdfBuffer: ArrayBuffer,
  options: AddImageOptions,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const { bytes, format } = dataUrlToUint8Array(options.imageDataUrl);
    const embeddedImage = format === "png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    if (options.mode === "new-page") {
      // Create new page sized to image
      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      // Fit into standard A4 or image aspect ratio
      const newPage = pdfDoc.addPage([imgWidth, imgHeight]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
      });

      // Reorder page if needed
      if (options.newPagePosition === "start") {
        pdfDoc.removePage(totalPages);
        pdfDoc.insertPage(0, newPage);
      } else if (options.newPagePosition === "after-page" && options.targetPage) {
        const insertIdx = Math.min(totalPages, Math.max(0, options.targetPage));
        pdfDoc.removePage(totalPages);
        pdfDoc.insertPage(insertIdx, newPage);
      }
    } else {
      // Overlay mode
      const opacity = options.opacity !== undefined ? options.opacity : 1;
      const rotationDeg = options.rotation || 0;
      const imgWidth = options.width || 150;
      const imgHeight = options.height || 100;
      const imgX = options.x || 50;
      const imgY = options.y || 50;

      for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        if (options.pageScope === "current" && pageNum !== (options.targetPage || 1)) {
          continue;
        }
        if (options.pageScope === "custom" && options.customPages && !options.customPages.includes(pageNum)) {
          continue;
        }

        const page = pages[i];
        const { height: pageHeight } = page.getSize();

        // Translate top-left (UI) coordinates to bottom-left (PDF) coordinates
        const pdfY = pageHeight - imgY - imgHeight;

        page.drawImage(embeddedImage, {
          x: imgX,
          y: Math.max(0, pdfY),
          width: imgWidth,
          height: imgHeight,
          opacity,
          rotate: degrees(rotationDeg),
        });

        if (onProgress) {
          onProgress(Math.round(((i + 1) / totalPages) * 100));
        }
      }
    }

    return await pdfDoc.save();
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to add image to PDF: ${(error as Error).message}`,
      "Gagal menyisipkan gambar ke dalam PDF."
    );
  }
}
