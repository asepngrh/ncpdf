import { PdfToolError } from "../utils/fileHelpers";

const TIMEOUT_MS = 60000; // 60 seconds

export interface ConvertOptions {
  filename: string;
  buffer: Buffer | Uint8Array | ArrayBuffer;
  targetExtension?: string; // e.g. "pdf", "docx", "xlsx"
}

/**
 * Returns all configured Gotenberg URLs in order of priority (Primary -> Secondary/Fallback).
 * Supports comma-separated list in GOTENBERG_URL or explicit GOTENBERG_FALLBACK_URL.
 */
export function getGotenbergEndpoints(): string[] {
  const envUrl = process.env.GOTENBERG_URL || "";
  const fallbackUrl = process.env.GOTENBERG_FALLBACK_URL || "";

  const rawList: string[] = [];

  if (envUrl) {
    rawList.push(...envUrl.split(",").map((u) => u.trim()).filter(Boolean));
  }

  if (fallbackUrl) {
    rawList.push(...fallbackUrl.split(",").map((u) => u.trim()).filter(Boolean));
  }

  const normalized = Array.from(new Set(rawList)).map((u) => {
    const withProto = u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
    return withProto.replace(/\/+$/, "");
  });

  return normalized.length > 0 ? normalized : ["http://localhost:3000"];
}

/**
 * Converts Office/Document files with automatic failover across multiple Gotenberg instances.
 * If the primary server (e.g. Railway) fails, it automatically retries with the fallback server (e.g. Koyeb).
 */
export async function convertWithGotenberg(options: ConvertOptions): Promise<Buffer> {
  const endpoints = getGotenbergEndpoints();
  let lastError: Error | null = null;

  for (let i = 0; i < endpoints.length; i++) {
    const baseUrl = endpoints[i];
    const isFallback = i > 0;
    const endpoint = `${baseUrl}/forms/libreoffice/convert`;

    if (isFallback) {
      console.warn(`[Gotenberg Failover] Mengalihkan konversi ke server cadangan (${i + 1}/${endpoints.length}): ${baseUrl}`);
    }

    const formData = new FormData();
    const uint8Array =
      options.buffer instanceof Buffer
        ? options.buffer
        : options.buffer instanceof Uint8Array
        ? options.buffer
        : new Uint8Array(options.buffer);

    const fileBlob = new Blob([uint8Array as unknown as BlobPart]);
    formData.append("files", fileBlob, options.filename);

    if (options.targetExtension && options.targetExtension.toLowerCase() !== "pdf") {
      formData.append("exportFileFormat", options.targetExtension);
    }

    const controller = new AbortController();
    // If multiple endpoints exist and this is not the last one, failover after 25s
    const timeoutMs = endpoints.length > 1 && i < endpoints.length - 1 ? 25000 : TIMEOUT_MS;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      lastError = err as Error;
      console.warn(`[Gotenberg Warning] Server ${baseUrl} tidak merespons: ${(err as Error).message}`);
      // Try next server in list...
    }
  }

  // All configured endpoints failed
  console.error("[Gotenberg Error] Semua server konversi Gotenberg gagal dihubungi.");
  throw new PdfToolError(
    `Semua server Gotenberg gagal dihubungi: ${lastError?.message}`,
    "Server konversi dokumen sedang sibuk atau tidak dapat dihubungi. Silakan coba beberapa saat lagi."
  );
}
