import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import { PdfToolError } from "../utils/fileHelpers";

interface TextSpan {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  fontName: string;
}

interface TextLine {
  y: number;
  spans: TextSpan[];
  text: string;
  maxFontSize: number;
  isBold: boolean;
  minX: number;
  maxX: number;
}

interface PageContent {
  pageNumber: number;
  width: number;
  height: number;
  lines: TextLine[];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeText(str: string): string {
  // Remove control characters except Tab (0x09), LF (0x0A), CR (0x0D)
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

/**
 * Extracts structured text, lines, and layout from a PDF document using pdfjs-dist.
 */
async function extractPdfContent(pdfBuffer: ArrayBuffer): Promise<PageContent[]> {
  const dataCopy = new Uint8Array(pdfBuffer.slice(0));
  const loadingTask = pdfjsLib.getDocument({
    data: dataCopy,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: PageContent[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    const spans: TextSpan[] = [];

    for (const item of textContent.items) {
      if (!("str" in item) || !item.str) continue;

      const rawText = sanitizeText(item.str);
      if (!rawText.trim() && rawText !== " ") continue;

      const transform = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
      const fontHeight = Math.sqrt(transform[2] * transform[2] + transform[3] * transform[3]) || item.height || 11;
      const fontSize = Math.round(fontHeight * 10) / 10;
      const x = Math.round(transform[4] * 10) / 10;
      const y = Math.round(transform[5] * 10) / 10; // PDF origin at bottom-left
      const fontName = (item.fontName || "").toLowerCase();
      const isBold = fontName.includes("bold") || fontName.includes("black") || fontName.includes("heavy") || fontName.includes("bld");
      const isItalic = fontName.includes("italic") || fontName.includes("oblique") || fontName.includes("ital");

      spans.push({
        text: rawText,
        x,
        y,
        width: item.width || 0,
        height: fontHeight,
        fontSize,
        isBold,
        isItalic,
        fontName: item.fontName || "",
      });
    }

    // Group spans into lines by vertical Y position (tolerance ~3pt)
    // In PDF coordinates, higher Y means higher up on page.
    spans.sort((a, b) => b.y - a.y || a.x - b.x);

    const lines: TextLine[] = [];
    let currentLineSpans: TextSpan[] = [];
    let currentY = spans.length > 0 ? spans[0].y : 0;

    for (const span of spans) {
      if (Math.abs(span.y - currentY) <= 3.5) {
        currentLineSpans.push(span);
      } else {
        if (currentLineSpans.length > 0) {
          // Sort spans within line left to right
          currentLineSpans.sort((a, b) => a.x - b.x);
          const fullText = currentLineSpans.map((s) => s.text).join(" ");
          const maxFontSize = Math.max(...currentLineSpans.map((s) => s.fontSize));
          const lineIsBold = currentLineSpans.every((s) => s.isBold);
          const minX = Math.min(...currentLineSpans.map((s) => s.x));
          const maxX = Math.max(...currentLineSpans.map((s) => s.x + s.width));

          lines.push({
            y: currentY,
            spans: currentLineSpans,
            text: fullText,
            maxFontSize,
            isBold: lineIsBold,
            minX,
            maxX,
          });
        }
        currentLineSpans = [span];
        currentY = span.y;
      }
    }

    if (currentLineSpans.length > 0) {
      currentLineSpans.sort((a, b) => a.x - b.x);
      const fullText = currentLineSpans.map((s) => s.text).join(" ");
      const maxFontSize = Math.max(...currentLineSpans.map((s) => s.fontSize));
      const lineIsBold = currentLineSpans.every((s) => s.isBold);
      const minX = Math.min(...currentLineSpans.map((s) => s.x));
      const maxX = Math.max(...currentLineSpans.map((s) => s.x + s.width));

      lines.push({
        y: currentY,
        spans: currentLineSpans,
        text: fullText,
        maxFontSize,
        isBold: lineIsBold,
        minX,
        maxX,
      });
    }

    pages.push({
      pageNumber: i,
      width: viewport.width,
      height: viewport.height,
      lines,
    });
  }

  return pages;
}

/**
 * Builds a 100% valid Microsoft Word OpenXML (.docx) file from extracted PDF pages.
 */
export async function convertPdfToDocx(pdfBuffer: ArrayBuffer, filename: string): Promise<Buffer> {
  try {
    const pages = await extractPdfContent(pdfBuffer);
    const zip = new JSZip();

    // 1. [Content_Types].xml
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
    zip.file("[Content_Types].xml", contentTypesXml);

    // 2. _rels/.rels
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
    zip.file("_rels/.rels", rootRelsXml);

    // 3. docProps/core.xml
    const cleanDocTitle = escapeXml(filename.replace(/\.pdf$/i, ""));
    const corePropsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${cleanDocTitle}</dc:title>
  <dc:creator>NCPDF Converter</dc:creator>
  <cp:lastModifiedBy>NCPDF Converter</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;
    zip.file("docProps/core.xml", corePropsXml);

    // 4. docProps/app.xml
    const appPropsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Word</Application>
  <DocSecurity>0</DocSecurity>
  <Pages>${pages.length}</Pages>
  <Company>NCPDF</Company>
  <AppVersion>16.0000</AppVersion>
</Properties>`;
    zip.file("docProps/app.xml", appPropsXml);

    // 5. word/_rels/document.xml.rels
    const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;
    zip.file("word/_rels/document.xml.rels", docRelsXml);

    // 6. word/settings.xml
    const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:zoom w:percent="100"/>
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>`;
    zip.file("word/settings.xml", settingsXml);

    // 7. word/styles.xml
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="id-ID"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
      <w:color w:val="2E74B5"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="180" w:after="90"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
      <w:color w:val="2E74B5"/>
    </w:rPr>
  </w:style>
</w:styles>`;
    zip.file("word/styles.xml", stylesXml);

    // 8. word/document.xml
    let bodyXml = "";

    for (let pIndex = 0; pIndex < pages.length; pIndex++) {
      const page = pages[pIndex];

      if (pIndex > 0) {
        // Page Break between PDF pages
        bodyXml += `
    <w:p>
      <w:r>
        <w:br w:type="page"/>
      </w:r>
    </w:p>`;
      }

      if (page.lines.length === 0) {
        // Blank page
        bodyXml += `
    <w:p>
      <w:r>
        <w:t xml:space="preserve"></w:t>
      </w:r>
    </w:p>`;
        continue;
      }

      for (let lIndex = 0; lIndex < page.lines.length; lIndex++) {
        const line = page.lines[lIndex];
        const isHeading1 = line.maxFontSize >= 18;
        const isHeading2 = line.maxFontSize >= 14 && line.maxFontSize < 18;

        let pPrXml = "";
        if (isHeading1) {
          pPrXml = `<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>`;
        } else if (isHeading2) {
          pPrXml = `<w:pPr><w:pStyle w:val="Heading2"/></w:pPr>`;
        }

        let runsXml = "";
        for (const span of line.spans) {
          const escapedText = escapeXml(span.text);
          const halfPoints = Math.round(span.fontSize * 2);

          let rPrXml = "<w:rPr>";
          if (span.isBold) rPrXml += "<w:b/>";
          if (span.isItalic) rPrXml += "<w:i/>";
          if (halfPoints > 0) rPrXml += `<w:sz w:val="${halfPoints}"/><w:szCs w:val="${halfPoints}"/>`;
          rPrXml += "</w:rPr>";

          runsXml += `
      <w:r>
        ${rPrXml}
        <w:t xml:space="preserve">${escapedText}</w:t>
      </w:r>`;
        }

        bodyXml += `
    <w:p>
      ${pPrXml}
      ${runsXml}
    </w:p>`;
      }
    }

    // Default Section Properties (A4 Size: 11906 x 16838 twips)
    const sectPrXml = `
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>`;

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    ${sectPrXml}
  </w:body>
</w:document>`;

    zip.file("word/document.xml", documentXml);

    const docxUint8 = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return Buffer.from(docxUint8);
  } catch (err: unknown) {
    console.error("convertPdfToDocx error:", err);
    throw new PdfToolError(
      `Gagal mengonversi PDF ke Word: ${(err as Error).message}`,
      "Gagal mengekstrak dan menyusun dokumen Word dari file PDF ini."
    );
  }
}
