import JSZip from "jszip";
import { PdfToolError } from "../utils/fileHelpers";

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Helper to escape XML characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper to convert column index (0-based) to Excel column name (A, B, ..., Z, AA, AB, ...)
function getColumnName(colIndex: number): string {
  let temp = colIndex;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Extracts structured tabular text from a PDF ArrayBuffer using pdfjs-dist
 * and builds a valid, native Microsoft Excel OpenXML (.xlsx) workbook.
 */
export async function convertPdfToExcel(
  pdfBuffer: ArrayBuffer,
  onProgress?: (progress: number, status: string) => void
): Promise<Uint8Array> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    
    // Set worker if needed
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    if (onProgress) onProgress(15, "Membaca struktur PDF...");

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
      disableFontFace: false,
    });

    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    if (totalPages === 0) {
      throw new PdfToolError("PDF has no pages.", "PDF tidak memiliki halaman.", "NO_PAGES");
    }

    const allPagesRows: string[][][] = []; // [page][row][col]

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (onProgress) {
        onProgress(
          Math.round(20 + (pageNum / totalPages) * 50),
          `Mengekstrak tabel halaman ${pageNum} dari ${totalPages}...`
        );
      }

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items: TextItem[] = [];

      for (const item of textContent.items as any[]) {
        if (!item.str || !item.str.trim()) continue;
        const transform = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
        items.push({
          str: item.str,
          x: Math.round(transform[4]),
          y: Math.round(transform[5]),
          width: Math.round(item.width || 0),
          height: Math.round(item.height || 0),
        });
      }

      // Group text items by Y coordinate (rows) with vertical tolerance
      const rowTolerance = 4; // points
      const rowsMap: { y: number; items: TextItem[] }[] = [];

      // Sort items top-to-bottom (higher Y in PDF coordinate system means higher on page)
      items.sort((a, b) => b.y - a.y);

      for (const item of items) {
        const existingRow = rowsMap.find((r) => Math.abs(r.y - item.y) <= rowTolerance);
        if (existingRow) {
          existingRow.items.push(item);
        } else {
          rowsMap.push({ y: item.y, items: [item] });
        }
      }

      // Sort rows top to bottom
      rowsMap.sort((a, b) => b.y - a.y);

      // In each row, sort items horizontally left to right (X) and detect column spacing
      const pageRows: string[][] = [];

      for (const row of rowsMap) {
        row.items.sort((a, b) => a.x - b.x);

        const rowCells: string[] = [];
        let currentCell = "";
        let lastX = -1;
        let lastWidth = 0;

        for (const it of row.items) {
          // If distance between words is large, split into next column
          if (lastX >= 0 && it.x - (lastX + lastWidth) > 14) {
            if (currentCell.trim()) {
              rowCells.push(currentCell.trim());
            }
            currentCell = it.str;
          } else {
            currentCell += (currentCell ? " " : "") + it.str;
          }
          lastX = it.x;
          lastWidth = it.width;
        }

        if (currentCell.trim()) {
          rowCells.push(currentCell.trim());
        }

        if (rowCells.length > 0) {
          pageRows.push(rowCells);
        }
      }

      allPagesRows.push(pageRows);
    }

    if (onProgress) onProgress(80, "Menyusun spreadsheet Excel (.xlsx)...");

    // Build the OpenXML Spreadsheet (.xlsx) package using JSZip
    const zip = new JSZip();

    // 1. [Content_Types].xml
    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
    );

    // 2. _rels/.rels
    zip.file(
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    );

    // 3. xl/_rels/workbook.xml.rels
    zip.file(
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    );

    // 4. xl/styles.xml
    zip.file(
      "xl/styles.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1">
    <font>
      <sz val="11"/>
      <color theme="1"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
</styleSheet>`
    );

    // 5. xl/workbook.xml
    zip.file(
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
    );

    // 6. xl/worksheets/sheet1.xml (Contains all rows across all pages)
    let sheetDataXml = "";
    let rowIndex = 1;

    allPagesRows.forEach((pageRows, pageIdx) => {
      // Optional header separator if document has multiple pages
      if (totalPages > 1 && pageIdx > 0) {
        rowIndex++; // leave empty row between pages
      }

      pageRows.forEach((row) => {
        let rowCellsXml = "";
        row.forEach((cellVal, colIdx) => {
          const colName = getColumnName(colIdx);
          const cellRef = `${colName}${rowIndex}`;
          const isNumeric = /^-?\d+(\.\d+)?$/.test(cellVal.trim()) && !cellVal.trim().startsWith("0") && cellVal.trim().length < 12;

          if (isNumeric) {
            rowCellsXml += `<c r="${cellRef}"><v>${cellVal.trim()}</v></c>`;
          } else {
            rowCellsXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(cellVal)}</t></is></c>`;
          }
        });

        if (rowCellsXml) {
          sheetDataXml += `<row r="${rowIndex}">${rowCellsXml}</row>`;
          rowIndex++;
        }
      });
    });

    zip.file(
      "xl/worksheets/sheet1.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${sheetDataXml}
  </sheetData>
</worksheet>`
    );

    if (onProgress) onProgress(95, "Menghasilkan file Excel (.xlsx)...");

    const xlsxBuffer = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return xlsxBuffer;
  } catch (error: unknown) {
    if (error instanceof PdfToolError) throw error;
    throw new PdfToolError(
      `Failed to convert PDF to Excel: ${(error as Error).message}`,
      "Gagal mengonversi struktur PDF ke format Excel.",
      "CONVERT_FAILED"
    );
  }
}
