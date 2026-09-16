export type ToolCategory = "compress" | "organize" | "convert" | "edit";

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  badge?: string;
  isClientSide: boolean;
  icon: string;
  popular?: boolean;
}

export interface PdfPageThumbnail {
  pageNumber: number;
  originalIndex: number;
  dataUrl: string;
  rotation: number;
  selected?: boolean;
}

export interface ProcessResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  newSize: number;
  fileCount?: number;
}
