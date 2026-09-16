import * as pdfjsLib from "pdfjs-dist";

// Set worker source to reliable unpkg CDN matching pdfjs-dist version
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export async function renderPdfPageToDataUrl(
  pdfBuffer: ArrayBuffer,
  pageNumber: number,
  scale = 0.5
): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create canvas 2d context");
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return canvas.toDataURL("image/jpeg", 0.8);
}

export async function getPdfPageCount(pdfBuffer: ArrayBuffer): Promise<number> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}

export async function renderAllPdfPages(
  pdfBuffer: ArrayBuffer,
  scale = 0.4,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const thumbnails: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      thumbnails.push(canvas.toDataURL("image/jpeg", 0.75));
    }
    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return thumbnails;
}
