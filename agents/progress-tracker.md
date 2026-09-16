# progress-tracker.md — Status Pengerjaan ncpdf

> Update file ini di akhir tiap fase / tiap tool selesai. Status: `Not started` /
> `In progress` / `Blocked` / `Done`. Jangan tandai `Done` kalau belum memenuhi
> "Definition of Done" di `rules.md` bagian 7.

## Fase 0 — Setup & Scaffolding
- [x] Init Next.js + TS + Tailwind + shadcn/ui — Status: Done
- [x] Struktur folder sesuai PRD.md 1.6 — Status: Done
- [x] toolsList.ts terisi 22 tool MVP — Status: Done
- [x] Homepage (layout indeks sesuai design.md) — Status: Done
- [x] ToolLayout.tsx — Status: Done
- [x] Navbar & Footer — Status: Done

## Fase 1 — Core PDF Engine & Komponen Bersama
- [x] fileHelpers.ts — Status: Done
- [x] pdfCore.ts (load, getPageCount, renderPageToCanvas) — Status: Done
- [x] FileDropzone.tsx — Status: Done
- [x] PdfThumbnailGrid.tsx (selectable + draggable mode) — Status: Done
- [x] ProgressBar.tsx — Status: Done
- [x] ResultDownloadCard.tsx — Status: Done
- [x] Web Worker generik siap pakai — Status: Done
- [x] Demo halaman validasi (upload → thumbnail tampil) — Status: Done

## Fase 2 — Merge / Split / Organize
| Tool | Status | Catatan |
|---|---|---|
| Merge PDF | Done | Upload multiple files, visual real-time thumbnail preview grid + list, drag & drop reorder, combine |
| Split PDF | Done | Split by range atau every page to ZIP |
| Rearrange Pages | Done | Visual drag & drop thumbnail reorder |
| Delete Pages | Done | Visual multi-select delete with live count |
| Extract Pages | Done | Visual multi-select extract to single PDF / ZIP |
| Rotate PDF | Done | Per-page & bulk 90° rotation |

## Fase 3 — Compress & Resize
| Tool | Status | Catatan |
|---|---|---|
| Compress PDF (keep text) | Done | Re-encode embedded image streams, keep text vector |
| Compress PDF ke Ukuran Kustom | Done | Target ukuran kustom (preset <100KB, <500KB, <1MB atau manual KB/MB input) |
| Increase PDF Size | Done | Safe compliant metadata padding to hit minimum size |

## Fase 4 — Edit Tools
| Tool | Status | Catatan |
|---|---|---|
| Watermark PDF | Done | Text & image watermark, single/tile pattern, custom rotation & opacity |
| Add Page Number | Done | 6 position presets, custom format "{page} of {total}", font & offset controls |
| Add Image to PDF | Done | Visual draggable & resizable overlay, opacity, rotation, new-page append |
| Crop PDF | Done | Interactive visual crop box with handles & point coordinate presets |
| Sign PDF | Done | 3 modes (Draw, Type cursive, Upload PNG), drag placement & auto date stamp |
| Highlight PDF | Done | Canvas drag-to-highlight, 6 color presets, custom opacity, undo/clear |
| PdfPageEditor.tsx (komponen bersama) | Done | Shared interactive canvas editor for preview, crop, overlay & highlight |

## Fase 5 — Convert & PDF→JPG
| Tool | Status | Catatan |
|---|---|---|
| Setup Gotenberg (docker-compose) | Done | Gotenberg 8 container config on port 3001 with 1GB limit |
| Word → PDF | Done | DOC/DOCX/ODT -> PDF via Gotenberg microservice with auto-deletion |
| PDF → Word | Done | PDF -> DOCX via Gotenberg LibreOffice conversion |
| Excel → PDF | Done | XLS/XLSX/ODS/CSV -> PDF via Gotenberg |
| PDF → Excel | Done | PDF -> XLSX via Gotenberg LibreOffice conversion |
| PPT → PDF | Done | PPT/PPTX/ODP -> PDF via Gotenberg |
| PDF → JPG (client-side) | Done | 100% Client-side render to JPG with quality slider & ZIP download |

## Fase 6 — Polish, SEO, Deploy
- [x] generateMetadata() semua 22 halaman tool — Status: Done
- [x] JSON-LD homepage (Schema.org WebApplication) — Status: Done
- [x] Error boundary global (app/error.tsx) & custom 404 (app/not-found.tsx) — Status: Done
- [x] Guardrail ukuran file & rate limit API routes — Status: Done
- [x] Halaman About/Privacy/Terms/Disclaimer/Contact — Status: Done
- [x] Deployment config (vercel.json, .env.production.example, Docker Gotenberg) — Status: Done
- [x] Final build check (22 tools MVP verified) — Status: Done

## Backlog (di luar MVP — Fase 7+)
- [ ] OCR PDF
- [ ] Password Protect / Unlock PDF
- [ ] Redact PDF
- [ ] Bates Numbering
- [ ] PDF ↔ EPUB
- [ ] Verify Signature
- [ ] Label Cropper (Meesho/Flipkart — niche, evaluasi kebutuhan dulu)

## Catatan / Usulan dari Agent
> Diisi agent kalau menemukan hal di luar scope fase saat ini yang menurutnya penting,
> TANPA langsung dikerjakan (lihat rules.md §2).

- **TypeScript Target & MapIterator Build Bug**:
  - *Penyebab*: `tsconfig.json` sebelumnya tidak mendefinisikan `compilerOptions.target` secara eksplisit sehingga fallback ke target lama (< ES2015). Ini menyebabkan iterasi `for (const [k, v] of map.entries())` di `lib/utils/rateLimiter.ts` memicu error build `MapIterator can only be iterated through when using --downlevelIteration or target >= es2015`.
  - *Fix yang diterapkan*: Menambahkan `"target": "ES2017"` pada `compilerOptions` di `tsconfig.json` (mempertahankan `"lib": ["dom", "dom.iterable", "esnext"]`).
- **Observasi Arsitektur Rate Limiter pada Edge Runtime**:
  - Semua API route konversi (`/api/convert/*`) saat ini menggunakan `export const runtime = "edge"`.
  - Rate limiter in-memory (`Map` + `setInterval` di `lib/utils/rateLimiter.ts`) bersifat ephemeral pada Edge Runtime / Cloudflare Pages Functions karena tiap instance/worker di Edge tidak berbagi memori state secara global antar request. Perlu dipertimbangkan arsitektur rate limiter terpusat (misalnya Upstash Redis / Cloudflare KV / beralih ke Node.js runtime) pada iterasi berikutnya.
