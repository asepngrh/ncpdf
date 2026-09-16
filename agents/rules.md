# rules.md — Aturan Kerja untuk AI Agent (ncpdf)

> Dokumen ini WAJIB dibaca ulang setiap kali memulai sesi kerja baru atau memulai fase baru.
> Jika ada instruksi user di chat yang bertentangan dengan dokumen ini, TANYAKAN dulu ke user
> sebelum mengambil keputusan — jangan diam-diam menyimpang.

## 1. Dokumen Acuan (Source of Truth)

Selalu rujuk ke 4 dokumen ini sebelum menulis kode, urut prioritas:

1. `PRD.md` — apa yang dibangun & kenapa (scope, functional requirement)
2. `architecture.md` — bagaimana dibangun (stack, folder structure, kontrak API)
3. `design.md` — bagaimana tampilannya (warna, tipografi, layout, komponen)
4. `progress-tracker.md` — apa yang sudah/belum selesai

Jika ada keraguan, **jangan menebak** — cek dokumen ini dulu, atau tanyakan ke user.

## 2. Disiplin Fase (Scope Lock)

- Kerjakan **satu fase pada satu waktu**, sesuai urutan di roadmap PRD (Fase 0 → 6).
- DILARANG mengerjakan fitur dari fase berikutnya walau terlihat mudah/cepat, kecuali user
  eksplisit meminta ("boleh loncat ke Fase X").
- DILARANG menambah tool/fitur baru yang tidak ada di daftar MVP tanpa persetujuan user.
- Jika saat mengerjakan fase kamu menemukan sesuatu yang menurutmu penting tapi di luar
  scope fase ini — catat di `progress-tracker.md` bagian "Catatan/Usulan", JANGAN langsung
  dikerjakan.
- Di akhir tiap fase, update status di `progress-tracker.md` sebelum lanjut.

## 3. Aturan Arsitektur (Non-negotiable)

- **Client-first**: tool yang menurut PRD/architecture.md dikategorikan client-side TIDAK
  BOLEH mengirim file ke server dengan alasan apapun (termasuk "lebih gampang").
- Server (API routes + Gotenberg) HANYA untuk konversi Office (Word/Excel/PPT ↔ PDF).
- Semua file yang sempat masuk ke server WAJIB dihapus setelah diproses (try/finally, bukan
  cuma optimistic delete).
- Jangan mengganti library inti (pdf-lib, pdfjs-dist, Gotenberg) dengan library lain tanpa
  persetujuan user, walau ada library yang "lebih baru"/"lebih populer".
- Jangan menambah dependency baru yang cukup besar (>500KB bundle, atau butuh native
  binary) tanpa menyebutkan alasannya ke user dan menunggu konfirmasi.

## 4. Konvensi Kode

- TypeScript strict mode aktif — hindari `any`, gunakan tipe eksplisit terutama di lib/pdf/*.
- Penamaan file & folder: kebab-case untuk route (`compress-pdf`), camelCase untuk fungsi
  TS (`compressPdf.ts` isinya `export function compressPdf(...)`).
- Satu file lib = satu tanggung jawab (mis. `mergePdf.ts` hanya berisi logic merge, tidak
  dicampur dengan split).
- Komponen UI reusable HARUS ditaruh di `components/shared/`, bukan diduplikasi di tiap
  halaman tool.
- Operasi berat (>1 detik) WAJIB lewat Web Worker, tidak boleh blocking main thread.
- Setiap fungsi di `lib/pdf/*` dan `lib/convert/*` harus punya try-catch dengan pesan error
  yang jelas untuk user (lihat `architecture.md` bagian error handling), bukan hanya
  `console.error`.
- Tidak ada `TODO` yang dibiarkan tanpa keterangan di kode yang dilaporkan "selesai" —
  kalau memang belum selesai, laporkan sebagai "In progress" di progress-tracker, jangan
  ditandai selesai.

## 5. Konten & Copy

- Semua teks (judul, deskripsi tool, error message, meta description) ditulis **orisinal**.
  Boleh terinspirasi dari daftar fitur pi7.org, tapi kalimat/copy harus tulisan sendiri.
- Tidak ada lorem ipsum atau placeholder text di halaman yang dilaporkan "selesai".
- Ikuti nada tulisan di `design.md` bagian "Voice & Copy" — jelas, aktif, tanpa jualan
  berlebihan.

## 6. Desain (ringkas — detail di design.md)

- Ikuti token warna, tipografi, dan layout di `design.md` secara ketat. Jangan improvisasi
  palet baru di tengah jalan.
- DILARANG memakai pola berikut kecuali diminta eksplisit: grid kartu seragam dengan shadow
  identik di semua card, eyebrow label ALL CAPS di atas heading, tanda panah "→" di akhir
  teks tombol/link, badge bertitik tengah "A · B · C", angka urut "01/02/03" untuk konten
  yang bukan sequence.
- Satu momen animasi boleh terasa "wah", sisanya tenang. Jangan pasang fade-in di semua
  section/card.

## 7. Definition of Done (per tool)

Sebuah tool baru dianggap "Done" hanya jika semua ini terpenuhi:

- [ ] Fungsi inti bekerja sesuai functional requirement di PRD
- [ ] Validasi input (tipe file, ukuran, PDF corrupt/terenkripsi) sudah ada dengan pesan
      error yang jelas
- [ ] UI mengikuti `design.md` (bukan default shadcn tanpa styling)
- [ ] Proses berat tidak nge-freeze UI (sudah pakai Web Worker jika relevan)
- [ ] Ada disclaimer privasi yang benar (client-side vs server-assisted)
- [ ] Responsive di layar mobile (dicek minimal di lebar 375px)
- [ ] Tidak ada file pengguna yang bocor/tersimpan permanen (khusus tool server-side)
- [ ] `progress-tracker.md` sudah diupdate

## 8. Komunikasi dengan User

- Di akhir tiap fase, buat ringkasan singkat: apa yang selesai, apa yang di-skip/ditunda dan
  kenapa, apa yang butuh keputusan user sebelum lanjut.
- Jika sebuah instruksi di prompt fase ambigu, buat asumsi yang masuk akal, sebutkan
  asumsinya secara eksplisit, lalu lanjut kerja — jangan berhenti total hanya karena satu
  detail kurang jelas.
- Jika sebuah requirement teknis ternyata tidak mungkin/tidak disarankan (misalnya
  keterbatasan Gotenberg untuk arah konversi tertentu), laporkan dengan jelas beserta
  alternatif yang disarankan — jangan diam-diam mengganti pendekatan tanpa bilang.
