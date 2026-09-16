# architecture.md — Referensi Teknis ncpdf

> Dokumen ini adalah rujukan teknis yang berdiri sendiri — bisa dibuka tanpa perlu baca
> ulang PRD lengkap tiap kali mulai fase baru. Kalau ada perbedaan detail dengan PRD,
> dokumen ini yang lebih rinci soal "bagaimana", PRD soal "apa & kenapa".

## 1. Stack

- Next.js 14+, App Router, TypeScript (strict mode)
- Tailwind CSS + shadcn/ui (styling di-override sesuai `design.md`, jangan pakai tema
  default shadcn apa adanya)
- `pdf-lib` — semua manipulasi struktur PDF (merge, split, watermark, dst)
- `pdfjs-dist` — rendering halaman PDF ke `<canvas>` (thumbnail, preview, PDF→JPG)
- `jszip` — bundling banyak file hasil (mis. split jadi banyak file, PDF→JPG banyak halaman)
- `react-dropzone` — komponen upload file
- Web Worker native (bukan library tambahan) untuk operasi berat
- Gotenberg (Docker container) — HANYA untuk konversi Office ↔ PDF

## 2. Prinsip Pembagian Client vs Server

```
┌───────────────────────────────┐        ┌──────────────────────────┐
│         BROWSER (Client)       │        │      SERVER (Next.js)     │
│                                 │        │                            │
│ pdf-lib + pdfjs-dist            │        │ API routes (app/api/*)    │
│ - merge, split, organize        │        │ - hanya proxy ke Gotenberg│
│ - compress, resize (KB/MB)      │  HTTP  │ - validasi file            │
│ - watermark, sign, crop,        │──jika──│ - hapus file temp setelah  │
│   page number, highlight        │ perlu  │   selesai (try/finally)   │
│ - PDF → JPG (render ke canvas)  │  saja  │                            │
│                                 │        │            │               │
│ File TIDAK PERNAH keluar        │        │            ▼               │
│ dari browser untuk tool ini     │        │      Gotenberg (Docker)   │
└───────────────────────────────┘        │   Word/Excel/PPT ↔ PDF    │
                                           └──────────────────────────┘
```

Aturan keras: kalau ragu apakah sebuah tool baru harus client atau server, defaultnya
**client-side**, kecuali benar-benar butuh engine yang tidak ada equivalent-nya di
browser (seperti rendering dokumen Office asli).

## 3. Kontrak API (untuk tool convert)

Semua endpoint di `app/api/convert/*` mengikuti kontrak yang sama:

**Request:** `POST`, `multipart/form-data`, field `file` (binary).

**Response sukses:** `200`, `Content-Type: application/octet-stream`,
header `Content-Disposition: attachment; filename="hasil.pdf"` (atau ekstensi sesuai
target), body = binary file hasil.

**Response gagal:** JSON `{ "error": string, "code": string }` dengan status code sesuai:
- `400` — file tidak valid/format salah/melebihi batas ukuran
- `422` — file valid tapi gagal diproses Gotenberg (mis. file corrupt)
- `504` — timeout ke Gotenberg
- `500` — error tak terduga

**Daftar endpoint & arah konversi:**

| Endpoint | Input | Output | Engine |
|---|---|---|---|
| `/api/convert/word-to-pdf` | .docx/.doc/.odt/.rtf | .pdf | Gotenberg (LibreOffice route) |
| `/api/convert/excel-to-pdf` | .xlsx/.xls/.ods | .pdf | Gotenberg (LibreOffice route) |
| `/api/convert/ppt-to-pdf` | .pptx/.ppt/.odp | .pdf | Gotenberg (LibreOffice route) |
| `/api/convert/pdf-to-word` | .pdf | .docx | Gotenberg (convert ke .odt lalu ke .docx, ATAU endpoint LibreOffice langsung jika tersedia di versi Gotenberg yang dipakai — cek dokumentasi versi terkini saat implementasi) |
| `/api/convert/pdf-to-excel` | .pdf | .xlsx | Sama seperti di atas, arah PDF→spreadsheet; jika hasil dari LibreOffice kurang baik untuk tabel kompleks, catat sebagai known limitation di progress-tracker, jangan dipaksakan sempurna di MVP |

> Catatan implementasi: kapabilitas Gotenberg untuk arah PDF→Office (bukan Office→PDF)
> tergantung versi & route yang dipakai. Saat Fase 5 dikerjakan, cek dulu dokumentasi
> Gotenberg versi yang di-install; kalau ternyata arah ini tidak didukung dengan baik,
> laporkan ke user sebelum melanjutkan, jangan diam-diam menurunkan kualitas fitur.

## 4. Batasan Ukuran & Rate Limit

- `MAX_FILE_SIZE_CLIENT = 50MB` (tool client-side)
- `MAX_FILE_SIZE_SERVER = 20MB` (tool yang lewat Gotenberg)
- Rate limit API convert: maksimum 10 request/menit per IP (sesuaikan saat load testing)
- Timeout request ke Gotenberg: 60 detik, tampilkan pesan jelas jika timeout

## 5. Environment Variables

```
GOTENBERG_URL=http://localhost:3000       # dev
GOTENBERG_URL=https://gotenberg.internal  # production, isi sesuai URL container terdeploy
NEXT_PUBLIC_MAX_FILE_SIZE_CLIENT_MB=50
MAX_FILE_SIZE_SERVER_MB=20
```

Simpan contoh di `.env.example` dan `.env.production.example`, JANGAN commit `.env` asli.

## 6. Keamanan & Privasi

- Validasi MIME type file di client DAN server (jangan percaya ekstensi file saja).
- Untuk file yang masuk ke server: simpan di temp directory, proses, kirim response,
  lalu hapus file di blok `finally` — pastikan terhapus walau proses gagal di tengah.
- Jangan log isi file atau nama file asli ke sistem log persisten.
- Sertakan header keamanan standar Next.js (CSP dasar, X-Content-Type-Options, dst) di
  `next.config.js`.
- Gotenberg container tidak perlu expose ke publik — hanya diakses dari Next.js API
  routes lewat internal network (jika dideploy di platform yang sama) atau URL private.

## 7. Error Handling Convention

Semua fungsi di `lib/pdf/*` dan `lib/convert/*` melempar error dengan bentuk konsisten:

```ts
class PdfToolError extends Error {
  constructor(
    message: string,           // pesan teknis untuk log
    public userMessage: string, // pesan yang ditampilkan ke user, harus jelas & actionable
    public code: string         // mis. "ENCRYPTED_PDF", "FILE_TOO_LARGE", "CORRUPT_FILE"
  ) { super(message) }
}
```

UI selalu menampilkan `error.userMessage`, tidak pernah menampilkan stack trace mentah
ke user.

## 8. Struktur Folder

(Detail lengkap ada di PRD.md bagian 1.6 — tidak diulang di sini agar tidak ada dua
sumber kebenaran yang bisa berbeda. Selalu rujuk PRD.md untuk struktur folder terbaru.)

## 9. Testing Minimum per Fase

Sebelum sebuah fase dianggap selesai:

- Build production (`next build`) berhasil tanpa error
- Setiap tool baru dicoba manual dengan: file normal, file kosong/invalid, file di atas
  batas ukuran, dan (khusus PDF) file yang di-password
- Cek tampilan di lebar layar 375px (mobile) dan 1280px (desktop)
