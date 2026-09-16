# PRD.md — Product Requirements Document (ncpdf)

## 1.1 Ringkasan Produk
- **Nama produk**: ncpdf
- **Tagline**: Free PDF Tools — Compress, Convert and Edit PDFs
- **Deskripsi**: Web app yang menyediakan tool-tool PDF gratis (compress, merge, split, convert, edit) yang berjalan secepat mungkin, sebagian besar diproses langsung di browser pengguna (client-side) demi privasi, tanpa watermark, tanpa perlu login.

## 1.2 Target Pengguna
1. Pelajar/mahasiswa yang perlu compress PDF untuk upload tugas/portal (batas KB tertentu).
2. Pekerja kantoran yang perlu convert Word/Excel/PPT ↔ PDF dengan cepat.
3. HR/admin yang perlu merge, watermark, atau tanda tangan dokumen.
4. Siapa pun yang butuh tool PDF cepat tanpa install software.

## 1.3 Tujuan Bisnis
- MVP yang stabil, cepat, dan bisa dipakai publik dalam 1 repo (mono-folder Next.js).
- Prioritaskan privasi (proses di browser bila memungkinkan) sebagai pembeda.
- Struktur mudah diperluas ke tool-tool lain (OCR, Security, dst) di fase berikutnya.

## 1.4 Scope MVP (Fase 1)

| Kategori | Tool | Eksekusi |
|---|---|---|
| **Compress & Resize** | Compress PDF (keep text), Resize PDF ke KB spesifik, Resize PDF ke MB spesifik, Increase PDF size | Client-side |
| **Merge/Split/Organize** | Merge PDF, Split PDF, Rearrange pages, Delete pages, Extract pages, Rotate PDF | Client-side |
| **Convert** | Word→PDF, PDF→Word, Excel→PDF, PDF→Excel, PPT→PDF, PDF→JPG | PDF→JPG: client-side (pdf.js render ke canvas). Sisanya (Office↔PDF): server-side via LibreOffice/Gotenberg |
| **Edit** | Watermark PDF, Add Page Number, Add Image to PDF, Crop PDF, Sign PDF (draw/type/upload), Highlight PDF | Client-side |

*Di luar scope MVP (masuk backlog Fase 2)*: Security (Protect/Unlock password), OCR PDF, Redact PDF, Bates Numbering, Label Cropper, PDF Editor full WYSIWYG, PDF↔EPUB, Verify Signature.

## 1.5 Keputusan Arsitektur
- **Framework**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Prinsip Utama**: Client-first. Tool ringan (compress, merge, split, organize, watermark, sign, dst) 100% diproses di browser pakai `pdf-lib` + `pdf.js`. File pengguna tidak pernah diupload untuk tool-tool ini.
- **Server**: HANYA untuk konversi Office (Word/Excel/PPT ↔ PDF) via microservice Gotenberg (Docker, berbasis LibreOffice) yang dipanggil dari Next.js API route. File yang diupload untuk fitur ini wajib dihapus otomatis setelah diproses (auto-delete).
- **Deployment**: Frontend + API ringan → Vercel (atau VPS). Gotenberg container → VPS/Railway/Fly.io terpisah.

## 1.6 Struktur Folder (1 repo/folder)
```
ncpdf/
├─ app/
│  ├─ page.tsx                     # Homepage: daftar semua tool (The Index)
│  ├─ layout.tsx
│  ├─ tools/
│  │  ├─ compress-pdf/page.tsx
│  │  ├─ resize-pdf-kb/page.tsx
│  │  ├─ resize-pdf-mb/page.tsx
│  │  ├─ increase-pdf-size/page.tsx
│  │  ├─ merge-pdf/page.tsx
│  │  ├─ split-pdf/page.tsx
│  │  ├─ rearrange-pdf/page.tsx
│  │  ├─ delete-pages/page.tsx
│  │  ├─ extract-pages/page.tsx
│  │  ├─ rotate-pdf/page.tsx
│  │  ├─ word-to-pdf/page.tsx
│  │  ├─ pdf-to-word/page.tsx
│  │  ├─ excel-to-pdf/page.tsx
│  │  ├─ pdf-to-excel/page.tsx
│  │  ├─ ppt-to-pdf/page.tsx
│  │  ├─ pdf-to-jpg/page.tsx
│  │  ├─ watermark-pdf/page.tsx
│  │  ├─ add-page-number/page.tsx
│  │  ├─ add-image-to-pdf/page.tsx
│  │  ├─ crop-pdf/page.tsx
│  │  ├─ sign-pdf/page.tsx
│  │  └─ highlight-pdf/page.tsx
│  └─ api/
│     ├─ convert/word-to-pdf/route.ts
│     ├─ convert/pdf-to-word/route.ts
│     ├─ convert/excel-to-pdf/route.ts
│     ├─ convert/pdf-to-excel/route.ts
│     ├─ convert/ppt-to-pdf/route.ts
│     └─ health/route.ts
├─ components/
│  ├─ ui/                          # shadcn components
│  ├─ shared/ToolLayout.tsx
│  ├─ shared/FileDropzone.tsx
│  ├─ shared/PdfThumbnailGrid.tsx
│  ├─ shared/ProgressBar.tsx
│  └─ shared/ResultDownloadCard.tsx
├─ lib/
│  ├─ pdf/mergePdf.ts
│  ├─ pdf/splitPdf.ts
│  ├─ pdf/compressPdf.ts
│  ├─ pdf/rotatePdf.ts
│  ├─ pdf/deletePages.ts
│  ├─ pdf/extractPages.ts
│  ├─ pdf/rearrangePages.ts
│  ├─ pdf/watermarkPdf.ts
│  ├─ pdf/addPageNumber.ts
│  ├─ pdf/addImageToPdf.ts
│  ├─ pdf/cropPdf.ts
│  ├─ pdf/signPdf.ts
│  ├─ pdf/highlightPdf.ts
│  ├─ pdf/pdfToJpg.ts
│  ├─ convert/gotenbergClient.ts
│  └─ utils/fileHelpers.ts
├─ docker/
│  └─ docker-compose.yml           # service Gotenberg
├─ public/
├─ types/
└─ package.json
```

## 1.7 Functional Requirements (ringkas per tool)
- **Compress PDF (keep text)**: Re-encode gambar embedded di PDF (turunkan kualitas/resolusi), teks tetap vector/selectable, tampilkan estimasi ukuran sebelum/sesudah.
- **Resize ke KB/MB spesifik**: User input target ukuran, sistem iteratif menurunkan kualitas gambar sampai mendekati target (dengan toleransi ±10%).
- **Increase PDF size**: Tambah padding/metadata atau naikkan kualitas gambar untuk memenuhi ukuran minimum (use case: portal yang minta ukuran minimum).
- **Merge PDF**: Upload banyak file, drag untuk reorder sebelum digabung, hasil 1 PDF.
- **Split PDF**: Pisah berdasarkan range halaman atau per-halaman jadi file terpisah (zip).
- **Rearrange/Delete/Extract/Rotate pages**: Preview thumbnail semua halaman (pakai pdf.js), user bisa drag-reorder, hapus, ekstrak, atau rotate per halaman.
- **Word/Excel/PPT → PDF & PDF → Word/Excel**: Upload file, kirim ke API route → Gotenberg → hasil PDF/Office dikembalikan, file asal dihapus dari server setelah selesai.
- **PDF → JPG**: Render tiap halaman ke canvas via pdf.js, export sebagai JPG/PNG, bisa download satu-satu atau zip semua.
- **Watermark PDF**: Teks atau gambar, posisi diagonal/tile, atur opacity, warna, rotasi, live preview.
- **Add Page Number**: Posisi (atas/bawah, kiri/tengah/kanan), format custom (mis. "Page {n} of {total}"), font & ukuran.
- **Add Image to PDF**: Upload gambar/logo, drag-resize-rotate di atas halaman, opsi terapkan ke semua halaman.
- **Crop PDF**: Crop margin per halaman atau semua halaman sekaligus, live preview.
- **Sign PDF**: Signature pad (gambar tangan), ketik nama (font kursif), atau upload gambar tanda tangan; drag posisi ke halaman.
- **Highlight PDF**: Drag area di atas teks/scan, pilih warna, opacity.

## 1.8 Non-Functional Requirements
- **Privasi**: Tool client-side tidak pernah mengirim file ke server. Untuk fitur server-side, cantumkan disclaimer jelas + auto-delete file.
- **Performa**: Proses file hingga ~20MB tanpa freeze UI (pakai Web Worker untuk operasi berat).
- **Kompatibilitas**: Chrome, Firefox, Safari, Edge terbaru; responsive mobile.
- **Batasan**: Tampilkan limit ukuran file per tool secara jelas (mis. maks 50MB untuk client-side, maks 20MB untuk server-side).
- **Aksesibilitas & SEO**: Tiap tool punya halaman sendiri dengan title/meta description unik, heading jelas, alt text gambar.
- **Error handling**: Pesan error jelas (format tidak didukung, file corrupt, PDF terenkripsi, dll).

## 1.9 Metrik Sukses
- Tool berhasil diproses tanpa error > 95% dari percobaan valid.
- Waktu proses client-side tool < 5 detik untuk file < 10MB.
- Tidak ada file pengguna yang tersimpan permanen di server.
