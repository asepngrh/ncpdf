import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

export async function resizePdfToTargetSize(
  fileBuffer: ArrayBuffer,
  targetBytes: number,
  toleranceRatio = 0.15
): Promise<Uint8Array> {
  const originalSize = fileBuffer.byteLength;
  
  if (originalSize <= targetBytes) {
    // Already smaller or equal
    return new Uint8Array(fileBuffer);
  }

  const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // Binary search / iterative approximation on image quality & scale
  let minQuality = 0.2;
  let maxQuality = 0.9;
  let bestBytes: Uint8Array | null = null;
  let bestDiff = Infinity;

  for (let attempt = 0; attempt < 4; attempt++) {
    const quality = (minQuality + maxQuality) / 2;
    const scale = quality > 0.6 ? 1.4 : 1.0;

    const newDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        const imgDataUrl = canvas.toDataURL("image/jpeg", quality);
        const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
        const embeddedImg = await newDoc.embedJpg(imgBytes);

        const newPage = newDoc.addPage([page.view[2] - page.view[0], page.view[3] - page.view[1]]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });
      }
    }

    const result = await newDoc.save({ useObjectStreams: true });
    const currentSize = result.byteLength;
    const diff = Math.abs(currentSize - targetBytes);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestBytes = result;
    }

    if (currentSize > targetBytes) {
      maxQuality = quality;
    } else {
      minQuality = quality;
    }

    if (diff / targetBytes <= toleranceRatio) {
      break;
    }
  }

  return bestBytes || new Uint8Array(fileBuffer);
}
