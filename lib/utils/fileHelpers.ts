/**
 * Generic PDF Tool Error adhering to architecture.md §7.
 */
export class PdfToolError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public code: string = "PDF_ERROR"
  ) {
    super(message);
    this.name = "PdfToolError";
  }
}

/**
 * Triggers a browser download for a Blob object.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats byte size into human-readable format (Bytes, KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Reads a File object into an ArrayBuffer.
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(
        new PdfToolError(
          `Failed to read file ${file.name}`,
          "Failed to read the file. It may be corrupted or inaccessible.",
          "FILE_READ_ERROR"
        )
      );
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Helper to strip file extension.
 */
export function getBaseFileName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
