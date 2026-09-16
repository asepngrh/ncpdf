import { NextRequest, NextResponse } from "next/server";
import { convertWithGotenberg } from "@/lib/convert/gotenbergClient";
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

    const filename = file.name || "presentation.pptx";
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext || !["ppt", "pptx", "odp"].includes(ext)) {
      return NextResponse.json(
        { error: "Format berkas tidak didukung. Harap unggah presentasi PowerPoint (.ppt, .pptx, .odp)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const resultBuffer = await convertWithGotenberg({
      filename,
      buffer: arrayBuffer,
      targetExtension: "pdf",
    });

    const outputName = `${getBaseFileName(filename)}.pdf`;

    return new NextResponse(resultBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputName}"`,
      },
    });
  } catch (error: unknown) {
    console.error("PPT to PDF API error:", error);
    const message =
      error instanceof PdfToolError ? error.userMessage : "Terjadi kesalahan internal saat mengonversi dokumen.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
