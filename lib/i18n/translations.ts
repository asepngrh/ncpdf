export type Language = "id" | "en";

export interface ToolTranslation {
  title: string;
  description: string;
}

export const TRANSLATIONS = {
  id: {
    // Header & Navbar
    brandTitle: "ncpdf",
    language: "Bahasa",
    indonesian: "Bahasa Indonesia",
    english: "English",

    // Home Page Hero
    heroTitle: "Alat PDF Gratis & Cepat",
    heroSubtitle: "Kompres, konversi, dan edit dokumen PDF langsung di browser Anda — tanpa upload & aman.",
    privacyPill: "100% Privasi — Diproses di Perangkat Anda",
    searchPlaceholder: "Cari alat PDF (misal: compress, merge, word, sign)...",
    noToolsFound: "Tidak ada alat yang cocok dengan pencarian Anda.",
    showingToolsCount: "Menampilkan {count} dari {total} alat PDF",
    clearSearch: "Hapus Pencarian",

    // Categories
    catAll: "Semua",
    catCompress: "Compress",
    catOrganize: "Organisir",
    catConvert: "Konversi",
    catEdit: "Edit & Tanda Tangan",

    // Footer
    footerTools: "Alat",
    footerNoFiles: "Tanpa penyimpanan berkas",

    // Breadcrumb
    breadcrumbHome: "Beranda",

    // Common Buttons & Messages
    selectFiles: "Pilih File",
    changeFile: "Ganti File",
    downloadResult: "Unduh File",
    processing: "Sedang Memproses...",
    success: "Selesai & Berhasil!",
  },
  en: {
    // Header & Navbar
    brandTitle: "ncpdf",
    language: "Language",
    indonesian: "Bahasa Indonesia",
    english: "English",

    // Home Page Hero
    heroTitle: "Free & Fast PDF Tools",
    heroSubtitle: "Compress, convert, and edit PDF documents directly in your browser — zero uploads & private.",
    privacyPill: "100% Private — Processed in your browser",
    searchPlaceholder: "Search PDF tools (e.g. compress, merge, word, sign)...",
    noToolsFound: "No tools found matching your search.",
    showingToolsCount: "Showing {count} of {total} PDF tools",
    clearSearch: "Clear Search",

    // Categories
    catAll: "All",
    catCompress: "Compress",
    catOrganize: "Organize",
    catConvert: "Convert",
    catEdit: "Edit & Sign",

    // Footer
    footerTools: "Tools",
    footerNoFiles: "No files stored",

    // Breadcrumb
    breadcrumbHome: "Home",

    // Common Buttons & Messages
    selectFiles: "Select Files",
    changeFile: "Change File",
    downloadResult: "Download File",
    processing: "Processing...",
    success: "Completed & Ready!",
  },
};

export const TOOLS_TRANSLATIONS: Record<string, Record<Language, ToolTranslation>> = {
  "compress-pdf": {
    id: {
      title: "Compress PDF",
      description: "Kecilkan ukuran file PDF tanpa mengurangi kualitas teks (vektor tetap tajam).",
    },
    en: {
      title: "Compress PDF",
      description: "Reduce PDF file size while keeping crisp vector text and sharp graphics.",
    },
  },
  "compress-to-size": {
    id: {
      title: "Compress PDF ke Ukuran Kustom",
      description: "Kompres PDF ke ukuran target persis yang Anda inginkan (misal: < 100 KB, < 500 KB, < 1 MB).",
    },
    en: {
      title: "Compress PDF to Target Size",
      description: "Compress PDF to an exact target file size (e.g. < 100 KB, < 500 KB, < 1 MB or custom KB).",
    },
  },
  "increase-pdf-size": {
    id: {
      title: "Increase PDF Size",
      description: "Tambahkan ukuran file PDF untuk memenuhi syarat minimum upload portal.",
    },
    en: {
      title: "Increase PDF Size",
      description: "Safely increase PDF file size to satisfy minimum portal upload requirements.",
    },
  },
  "merge-pdf": {
    id: {
      title: "Merge PDF",
      description: "Gabungkan beberapa file PDF menjadi satu dokumen berurutan dengan mudah.",
    },
    en: {
      title: "Merge PDF",
      description: "Combine multiple PDF files into one single organized document with ease.",
    },
  },
  "split-pdf": {
    id: {
      title: "Split PDF",
      description: "Pisahkan halaman PDF berdasarkan rentang nomor halaman atau jadikan file ZIP per halaman.",
    },
    en: {
      title: "Split PDF",
      description: "Extract specific page ranges or split each page into separate files in a ZIP archive.",
    },
  },
  "rearrange-pdf": {
    id: {
      title: "Rearrange Pages",
      description: "Atur ulang urutan halaman PDF secara visual dengan drag and drop thumbnail.",
    },
    en: {
      title: "Rearrange Pages",
      description: "Reorder and reorganize PDF pages visually by dragging and dropping page thumbnails.",
    },
  },
  "delete-pages": {
    id: {
      title: "Delete Pages",
      description: "Pilih dan hapus halaman yang tidak diinginkan dari file PDF Anda.",
    },
    en: {
      title: "Delete Pages",
      description: "Select and remove unwanted pages from your PDF document instantly.",
    },
  },
  "extract-pages": {
    id: {
      title: "Extract Pages",
      description: "Ekstrak halaman tertentu dari PDF menjadi file PDF baru atau arsip ZIP.",
    },
    en: {
      title: "Extract Pages",
      description: "Extract selected pages from your PDF into a brand new PDF or ZIP archive.",
    },
  },
  "rotate-pdf": {
    id: {
      title: "Rotate PDF",
      description: "Putar rotasi halaman PDF 90°, 180°, atau 270° per halaman atau semua sekaligus.",
    },
    en: {
      title: "Rotate PDF",
      description: "Rotate PDF pages 90°, 180°, or 270° clockwise or counter-clockwise permanently.",
    },
  },
  "word-to-pdf": {
    id: {
      title: "Word ke PDF",
      description: "Ubah dokumen Word (.doc, .docx, .odt) menjadi format PDF berkualitas tinggi.",
    },
    en: {
      title: "Word to PDF",
      description: "Convert Word documents (.doc, .docx, .odt) into high-quality standardized PDF files.",
    },
  },
  "excel-to-pdf": {
    id: {
      title: "Excel ke PDF",
      description: "Ubah spreadsheet Excel (.xls, .xlsx, .csv) menjadi dokumen PDF yang rapi.",
    },
    en: {
      title: "Excel to PDF",
      description: "Convert Excel spreadsheets (.xls, .xlsx, .csv) into clean, printable PDF documents.",
    },
  },
  "ppt-to-pdf": {
    id: {
      title: "PPT ke PDF",
      description: "Ubah slide PowerPoint (.ppt, .pptx) menjadi dokumen presentasi PDF.",
    },
    en: {
      title: "PowerPoint to PDF",
      description: "Convert PowerPoint slide presentations (.ppt, .pptx) into crisp, viewable PDF files.",
    },
  },
  "pdf-to-word": {
    id: {
      title: "PDF ke Word",
      description: "Ekstrak teks dan tata letak PDF menjadi dokumen Word (.docx) yang dapat diedit.",
    },
    en: {
      title: "PDF to Word",
      description: "Convert PDF text and structure into clean, fully editable Microsoft Word (.docx) documents.",
    },
  },
  "pdf-to-excel": {
    id: {
      title: "PDF ke Excel",
      description: "Ekstrak data tabel dari PDF menjadi lembar kerja spreadsheet Excel (.xlsx).",
    },
    en: {
      title: "PDF to Excel",
      description: "Extract tables and structured data from PDF into editable Excel (.xlsx) spreadsheets.",
    },
  },
  "pdf-to-jpg": {
    id: {
      title: "PDF ke Gambar (JPG/PNG)",
      description: "Ubah setiap halaman dokumen PDF menjadi gambar resolusi tinggi (JPG atau PNG).",
    },
    en: {
      title: "PDF to JPG/PNG",
      description: "Convert each page of your PDF into high-resolution JPG or PNG images.",
    },
  },
  "watermark-pdf": {
    id: {
      title: "Watermark PDF",
      description: "Tambahkan cap air teks atau logo gambar dengan rotasi, transparansi, dan posisi fleksibel.",
    },
    en: {
      title: "Watermark PDF",
      description: "Add customizable text or image watermark stamps with opacity, rotation, and custom positioning.",
    },
  },
  "sign-pdf": {
    id: {
      title: "Sign PDF",
      description: "Bubuhkan tanda tangan digital langsung pada halaman PDF Anda dengan aman.",
    },
    en: {
      title: "Sign PDF",
      description: "Draw, type, or upload digital signatures and place them anywhere on your PDF.",
    },
  },
  "add-page-number": {
    id: {
      title: "Add Page Number",
      description: "Beri nomor halaman otomatis pada PDF dengan berbagai pilihan posisi dan format.",
    },
    en: {
      title: "Add Page Numbers",
      description: "Insert customizable page numbering across your PDF with flexible positions and styles.",
    },
  },
  "crop-pdf": {
    id: {
      title: "Crop PDF",
      description: "Pangkas margin atau area halaman PDF secara visual dengan live preview.",
    },
    en: {
      title: "Crop PDF",
      description: "Trim margins and crop PDF page dimensions visually with real-time interactive preview.",
    },
  },
  "add-image-to-pdf": {
    id: {
      title: "Add Image to PDF",
      description: "Sisipkan foto, stempel, atau gambar ke dalam halaman PDF pada posisi yang diinginkan.",
    },
    en: {
      title: "Add Image to PDF",
      description: "Insert photos, logos, or stamps into any PDF page with customizable scale and opacity.",
    },
  },
  "highlight-pdf": {
    id: {
      title: "Highlight PDF",
      description: "Beri stabilo atau sorotan warna transparan pada teks dan area penting PDF.",
    },
    en: {
      title: "Highlight PDF",
      description: "Highlight text sections and key areas with translucent colorful markers.",
    },
  },
  "edit-pdf": {
    id: {
      title: "Edit PDF",
      description: "Tambahkan teks, gambar, bentuk geometris, dan gambar bebas dengan rotasi & geser.",
    },
    en: {
      title: "Edit PDF",
      description: "Add text, images, geometric shapes, and freehand drawings with rotate & drag tools.",
    },
  },
  "resize-pdf-kb": {
    id: {
      title: "Resize PDF ke Target KB",
      description: "Sesuaikan ukuran file PDF ke target Kilobyte (KB) spesifik (misal: 200 KB, 300 KB, 500 KB).",
    },
    en: {
      title: "Resize PDF to KB",
      description: "Resize and adjust PDF file size to a specific Kilobyte target (e.g. 200 KB, 300 KB, 500 KB).",
    },
  },
  "resize-pdf-mb": {
    id: {
      title: "Resize PDF ke Target MB",
      description: "Sesuaikan ukuran file PDF ke target Megabyte (MB) spesifik (misal: 1 MB, 2 MB, 5 MB).",
    },
    en: {
      title: "Resize PDF to MB",
      description: "Resize and adjust PDF file size to a specific Megabyte target (e.g. 1 MB, 2 MB, 5 MB).",
    },
  },
};
