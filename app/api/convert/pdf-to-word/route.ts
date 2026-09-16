import { NextRequest, NextResponse } from "next/server";
import { convertPdfToDocx } from "@/lib/convert/pdfToWord";
import { getBaseFileName, PdfToolError } from "@/lib/utils/fileHelpers";
import { checkRateLimit } from "@/lib/utils/rateLimiter";
import { MAX_FILE_SIZE_SERVER } from "@/lib/utils/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan konversi dalam waktu singkat. Harap tunggu beberapa saat." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Berkas tidak ditemukan dalam permintaan." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_SERVER) {
      return NextResponse.json(
        { error: "Ukuran berkas melebihi batas maksimum 20MB." },
        { status: 400 }
      );
    }

    const filename = file.name || "document.pdf";
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      return NextResponse.json(
        { error: "Format berkas tidak didukung. Harap unggah berkas PDF (.pdf)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const resultBuffer = await convertPdfToDocx(arrayBuffer, filename);

    const outputName = `${getBaseFileName(filename)}.docx`;

    return new NextResponse(resultBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputName}"`,
      },
    });
  } catch (error: unknown) {
    console.error("PDF to Word API error:", error);
    const message =
      error instanceof PdfToolError ? error.userMessage : "Terjadi kesalahan internal saat mengonversi dokumen.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
