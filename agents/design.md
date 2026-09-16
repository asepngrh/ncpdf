# design.md — Design System ncpdf

> Prinsip utama: **sederhana, elegan, profesional**. Ini alat kerja (tool), bukan produk
> konsumer yang harus terlihat "seru". Terinspirasi dari dunia dokumen & kertas kerja —
> bukan dari template SaaS generik. Dokumen ini adalah acuan tunggal untuk visual; jangan
> improvisasi di luar ini tanpa persetujuan user.

## 0. Konsep

**Nama konsep: "The Index"** — seperti daftar isi/ledger dokumen kerja yang rapi: baris-baris
tenang dipisah garis tipis, tipografi yang terasa seperti kop surat/dokumen resmi, tanpa
hiasan berlebihan. Kesan yang ingin dibangun: *"alat yang dipakai orang yang serius bekerja
dengan dokumen"* — bukan aplikasi flashy.

Ini juga alasan kenapa homepage **tidak** memakai grid kartu seragam dengan shadow (pola
"SaaS card kit" yang terlihat generik/AI) — sebagai gantinya memakai **layout daftar/indeks**
yang justru lebih relevan secara tematik dengan produk "dokumen".

## 1. Warna

| Token | Hex | Kegunaan |
|---|---|---|
| `paper` | `#F6F5F2` | Background utama (warna kertas, bukan putih pucat/cream klise) |
| `ink` | `#1E2024` | Teks utama, hampir hitam tapi tidak pure black |
| `ink-muted` | `#6B6862` | Teks sekunder, deskripsi, caption, placeholder |
| `rule` | `#DDD9D0` | Garis pembatas/divider, border input, border dropzone |
| `accent` | `#24406B` | Warna aksen tunggal — tombol utama, link aktif, state terpilih (seperti tinta pena) |
| `accent-soft` | `#E7ECF2` | Background halus untuk hover/state aktif ringan dari accent |
| `success` | `#3F6B4A` | Konfirmasi berhasil (hijau tua, tidak neon) |
| `warning` | `#A6541E` | Peringatan (dipakai sangat jarang, hanya untuk alert penting) |
| `surface` | `#FFFFFF` | Panel/kartu kerja tempat file di-upload/diproses (bukan background utama) |

**Aturan pemakaian:**
- `accent` hanya untuk 1 elemen fokus per layar (tombol aksi utama, link aktif). Jangan
  dipakai untuk semua ikon/border sekaligus — itu yang membuat desain terasa berisik.
- Tidak ada gradient dekoratif. Tidak ada glow/shadow warna-warni.
- Shadow (jika perlu, mis. untuk modal) memakai satu nilai konsisten dan sangat halus:
  `0 1px 2px rgba(30,32,36,0.06)` — bukan shadow abu-abu tebal khas kartu SaaS.

## 2. Tipografi

| Token | Font | Kegunaan |
|---|---|---|
| `font-display` | **Newsreader** (serif, Google Fonts) | Headline besar (H1 homepage, judul tool di halaman kerja) — memberi kesan dokumen/editorial |
| `font-ui` | **IBM Plex Sans** | Semua UI: body text, tombol, label, navigasi, form |
| `font-mono` (opsional) | **IBM Plex Mono** | HANYA untuk menampilkan angka teknis presisi (ukuran file "2.4 MB", progress "%"), bukan untuk label dekoratif |

**Skala tipografi (berbasis 1.25 ratio, base 16px):**
- H1 (display): 40px / line-height 1.15 / `font-display` Regular atau Medium (bukan Bold tebal)
- H2 (section): 28px / 1.2 / `font-display`
- H3 (tool title di halaman kerja): 22px / 1.3 / `font-ui` Medium
- Body: 16px / 1.6 / `font-ui` Regular
- Small/caption: 14px / 1.5 / `font-ui` Regular, warna `ink-muted`

**Aturan:**
- Line length body text maksimal ~72 karakter.
- Jangan gunakan ALL CAPS untuk label kategori/eyebrow. Gunakan sentence case biasa,
  dipisahkan garis tipis (`rule`) di bawahnya jika perlu penekanan struktural.
- Jangan menebalkan/mewarnai satu kata saja di tengah headline untuk "aksen" — itu ciri
  khas desain generik AI.
- Hindari heading yang diberi label eyebrow tracked-out di atasnya ("FEATURES", "TOOLS").
  Cukup heading + subheading biasa.

## 3. Layout

### 3.1 Homepage — Layout "Indeks", bukan grid kartu

Alih-alih grid kartu 3-4 kolom dengan shadow seragam, gunakan **daftar bertingkat**
dikelompokkan per kategori, dipisah garis tipis (`rule`), dengan search bar di atas untuk
filter cepat.

```
┌─────────────────────────────────────────────┐
│  ncpdf                                       │  <- logo kecil, kiri
│                                               │
│  Free PDF Tools                              │  <- H1 (font-display)
│  Compress, convert, and edit PDFs             │  <- subheading, ink-muted
│  in your browser — nothing uploaded.          │
│                                               │
│  [ Search tools...                    ]      │  <- search bar, border tipis
│                                               │
│  Compress                                    │  <- section label (H2 kecil, bukan ALL CAPS)
│  ─────────────────────────────────────────   │
│  Compress PDF          Shrink file size,      │  <- 1 baris = 1 tool
│                         keep text selectable  │     icon kiri kecil, judul + deskripsi
│  ─────────────────────────────────────────   │     satu baris, klik area = link ke tool
│  Resize to KB           Hit an exact KB target│
│  ─────────────────────────────────────────   │
│  ...                                          │
│                                               │
│  Organize                                    │
│  ─────────────────────────────────────────   │
│  Merge PDFs             Combine files in order│
│  ─────────────────────────────────────────   │
│  ...                                          │
└─────────────────────────────────────────────┘
```

Alignment: **left-aligned**, satu kolom di mobile, tetap satu kolom (bukan 2-3 kolom kartu)
di desktop tapi dengan margin kiri-kanan lebar (max-width konten ~720-800px) supaya tetap
terasa seperti membaca daftar isi, bukan dashboard. Icon tool kecil (16-20px), monokrom
`ink`, bukan berwarna-warni.

Hover state per baris: background berubah ke `accent-soft` secara halus, tanpa shadow
muncul, tanpa card "terangkat". Ini satu-satunya micro-interaction di homepage.

### 3.2 Halaman Tool (Workspace)

Satu kolom terpusat, fokus penuh ke area kerja (dropzone/preview), minim chrome.

```
┌─────────────────────────────────────────────┐
│  ncpdf   Home / Compress                     │  <- breadcrumb tipis, ink-muted
│                                               │
│  Compress PDF                                │  <- H3, font-ui Medium
│  Shrink file size while keeping text          │  <- 1 kalimat deskripsi
│  selectable. Processed in your browser.       │  <- badge privasi ditulis sbg kalimat biasa
│                                               │
│  ┌─────────────────────────────────────┐    │
│  │                                       │    │
│  │      Drop your PDF here              │    │  <- dropzone: border dashed rule 1px,
│  │      or click to choose a file        │    │     surface putih, TANPA gradient
│  │                                       │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  [ Compress ]                                │  <- tombol accent, satu-satunya CTA warna
│                                               │
└─────────────────────────────────────────────┘
```

Setelah file diupload/diproses, hasil ditampilkan sebagai panel `surface` sederhana (nama
file, ukuran sebelum→sesudah, satu tombol Download) — bukan kartu dengan border-radius besar
dan shadow tebal.

### 3.3 Thumbnail Grid Halaman PDF (functional, bukan marketing)

Untuk tool yang butuh preview banyak halaman (split, rearrange, delete, rotate, crop),
grid thumbnail TETAP grid — ini pengecualian yang sah karena representasi halaman PDF
memang natural berupa grid, bukan dekorasi. Styling: border tipis `rule`, nomor halaman
kecil di pojok bawah, radius sudut kecil (4px), tanpa shadow berlebih. Saat terpilih:
outline `accent` 2px, bukan checkmark besar mencolok.

## 4. Komponen

| Komponen | Spesifikasi |
|---|---|
| Tombol primer | Background `accent`, teks putih, radius 6px, padding 10px 20px, tanpa ikon panah di akhir teks |
| Tombol sekunder | Border 1px `rule`, teks `ink`, background transparan |
| Input/search | Border 1px `rule`, radius 6px, background `surface`, focus ring `accent` 2px |
| Dropzone | Border dashed 1.5px `rule`, radius 8px, background `surface`, hover: border `accent` |
| Badge privasi | Bukan pill berwarna — cukup teks kecil `ink-muted` dengan ikon titik/kunci kecil di depan |
| Divider section | 1px solid `rule`, tanpa gradient fade |
| Progress bar | Bar tipis 4px, warna `accent`, background track `rule` |

## 5. Motion

- Satu momen animasi yang disengaja: transisi masuk hasil proses (fade + sedikit slide-up,
  200ms) saat `ResultDownloadCard` muncul.
- Hover row di homepage: transisi background 120ms, tanpa transform/scale.
- TIDAK ADA fade-in berurutan di tiap baris/section saat scroll. Semua konten tampil
  langsung.
- Hormati `prefers-reduced-motion`: matikan semua transisi non-esensial jika user
  mengaktifkan setting ini.

## 6. Yang HARUS Dihindari (AI-design tells)

Daftar ini eksplisit — Antigravity harus mengecek ulang hasil kerjanya terhadap daftar ini:

- ❌ Background cream (#F4F1EA) + heading serif kontras tinggi + aksen terracotta (#D97757)
- ❌ Background nyaris hitam + satu aksen hijau-neon/vermilion terang
- ❌ Grid kartu seragam dengan border-radius sama semua + shadow abu-abu lembut identik
- ❌ Eyebrow label ALL CAPS tracked-out di atas heading ("TOOLS", "FEATURES")
- ❌ Meta string dengan titik tengah ("Fast · Free · Private")
- ❌ Tombol/link diakhiri tanda panah "→"
- ❌ Penomoran "01 / 02 / 03" untuk konten yang bukan urutan proses
- ❌ Fade-slide-up di setiap card/section saat scroll
- ❌ Satu kata di headline diberi warna/italic berbeda sebagai "aksen"

## 7. Voice & Copy

- Bahasa Inggris untuk UI (produk ditujukan publik umum/global, konsisten dengan nama
  domain & istilah PDF internasional) kecuali user memutuskan lain.
- Aktif, langsung, tanpa jargon. Tombol bilang persis apa yang terjadi: "Compress" bukan
  "Submit" atau "Process Now!".
- Error message menjelaskan apa yang salah + apa yang bisa dilakukan user, nada netral
  (bukan lucu, bukan minta maaf berlebihan): *"This PDF is password-protected. Remove the
  password first, then try again."*
- Deskripsi tool: satu kalimat, jelas fungsinya, tanpa kata-kata jualan ("amazing",
  "powerful", "best-in-class").
