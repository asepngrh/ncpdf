<div align="center">

<img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/immich-maintenance.webp" alt="ncpdf Logo" width="80" height="80" />

# ncpdf — Free & Fast PDF Tools

**Private, browser-first PDF processing suite built with Next.js 14, WebAssembly, and TypeScript.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)
[![Cloudflare Ready](https://img.shields.io/badge/Cloudflare_Pages-Ready-orange?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)
[![Dark Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-purple?style=flat-square)](https://ncpdf.org)
[![i18n](https://img.shields.io/badge/Language-EN%20%7C%20ID-blue?style=flat-square)](https://ncpdf.org)

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-tools-catalog">Tools Catalog</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-support--donation">Support & Donate</a> •
  <a href="#-license">License</a>
</p>

</div>

---

## 💖 Support the Project

**ncpdf** is completely free, privacy-first, and open-source without ads. If this tool saves you time or helps your daily workflow, consider supporting the development and server hosting costs:

<div align="center">

<table>
  <thead>
    <tr>
      <th align="center" width="50%">
        <h3>💳 Donate 1 — QRIS (Instant Payment)</h3>
        <p><sub>Supports all Indonesian E-Wallets & Mobile Banking</sub></p>
      </th>
      <th align="center" width="50%">
        <h3>☕ Donate 2 — Sociabuzz (Creator Support)</h3>
        <p><sub>Supports QRIS, E-Wallet & Credit Card / International</sub></p>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <details>
          <summary>
            <img src="https://img.shields.io/badge/Click_to_Open-QRIS_QR_Code-E11D48?style=for-the-badge&logo=cashapp&logoColor=white" alt="Open QRIS QR Code" />
          </summary>
          <br/>
          <img src="public/img/QR%20Nicoopedia.jpeg" alt="Donate 1 - QRIS QR Code" width="280" style="border-radius: 12px; border: 2px solid #E11D48; padding: 4px; background: #ffffff;" />
          <br/><br/>
          <p>
            <img src="https://img.shields.io/badge/GoPay-00AED6?style=flat-square&logo=gopay&logoColor=white" alt="GoPay" />
            <img src="https://img.shields.io/badge/OVO-4C3494?style=flat-square&logoColor=white" alt="OVO" />
            <img src="https://img.shields.io/badge/DANA-118EEA?style=flat-square&logo=cashapp&logoColor=white" alt="DANA" />
            <img src="https://img.shields.io/badge/ShopeePay-EE4D2D?style=flat-square&logo=shopee&logoColor=white" alt="ShopeePay" />
            <img src="https://img.shields.io/badge/BCA%20%2F%20Mandiri%20%2F%20BRI-00529C?style=flat-square" alt="Bank Transfer" />
          </p>
        </details>
      </td>
      <td align="center" valign="top">
        <details>
          <summary>
            <img src="https://img.shields.io/badge/Click_to_Open-Sociabuzz_QR_Code-F59E0B?style=for-the-badge&logo=coffeescript&logoColor=white" alt="Open Sociabuzz QR Code" />
          </summary>
          <br/>
          <img src="public/img/qr-nicoopedia-socialbuzz.png" alt="Donate 2 - Sociabuzz QR Code" width="280" style="border-radius: 12px; border: 2px solid #F59E0B; padding: 4px; background: #ffffff;" />
          <br/><br/>
          <p>
            <a href="https://v1nicoopedia.vercel.app/" target="_blank">
              <img src="https://img.shields.io/badge/Sociabuzz-Support_via_Web-F59E0B?style=flat-square&logo=coffeescript&logoColor=white" alt="Sociabuzz Link" />
            </a>
          </p>
        </details>
      </td>
    </tr>
  </tbody>
</table>

<p><sub>✨ Every contribution helps keep the Gotenberg conversion servers running and free for everyone!</sub></p>

</div>

---

## 🌟 Key Features

- 🔒 **100% Client-Side & Private**: Over 80% of tools run directly in the user's browser using `pdf-lib` and `pdfjs-dist`. Documents never leave your device.
- ⚡ **Zero Queue & Instant**: No upload wait times or server throttling for client-side processing.
- 🌓 **Adaptive Dark & Light Mode**: Built-in, high-contrast eye-comfort theme with instant toggle.
- 🌐 **Bilingual / Internationalization (i18n)**: Automatically detects user browser locale (`English` / `Bahasa Indonesia`) with manual switch support.
- 🚀 **Server-Assisted Office Conversion**: High-fidelity Word, Excel, and PowerPoint conversions powered by Docker Gotenberg microservice (with auto-failover support).
- 📱 **Fully Responsive**: Optimized UI for mobile phones, tablets, and desktop displays.
- 🆓 **100% Free**: No login required, no subscriptions, and zero watermarks added to output files.

---

## 🛠️ Tools Catalog

| Category | Tool | Execution | Description |
|---|---|---|---|
| **Compress** | **Compress PDF** | 🌐 Browser | Reduces PDF file size while keeping crisp vector text. |
| **Compress** | **Compress to Target Size** | 🌐 Browser | Compresses PDF to exact KB/MB target limits (e.g. `< 200 KB`, `< 1 MB`). |
| **Compress** | **Increase PDF Size** | 🌐 Browser | Safely pads file size to satisfy minimum portal upload requirements. |
| **Organize** | **Merge PDF** | 🌐 Browser | Combines multiple PDF files with visual drag-and-drop ordering. |
| **Organize** | **Split PDF** | 🌐 Browser | Splits pages by custom ranges or extracts every page into a ZIP archive. |
| **Organize** | **Rearrange Pages** | 🌐 Browser | Reorders PDF pages interactively with thumbnail cards. |
| **Organize** | **Rotate PDF** | 🌐 Browser | Rotates individual or all pages (90°, 180°, 270°). |
| **Organize** | **Delete Pages** | 🌐 Browser | Selects and removes unwanted pages visually. |
| **Organize** | **Extract Pages** | 🌐 Browser | Extracts specific page selections into a new document. |
| **Convert** | **PDF to JPG / PNG** | 🌐 Browser | High-resolution canvas rendering of PDF pages to image files / ZIP. |
| **Convert** | **PDF to Word (.docx)** | 🌐 Browser / Engine | Converts PDF layout and text into editable Microsoft Word documents. |
| **Convert** | **PDF to Excel (.xlsx)** | 🌐 Engine | Extracts tabular data into Microsoft Excel spreadsheets. |
| **Convert** | **Word to PDF** | ⚙️ Gotenberg | Converts `.doc`, `.docx`, `.odt`, `.rtf` into PDF documents. |
| **Convert** | **Excel to PDF** | ⚙️ Gotenberg | Converts `.xls`, `.xlsx`, `.ods`, `.csv` spreadsheets into PDF. |
| **Convert** | **PowerPoint to PDF** | ⚙️ Gotenberg | Converts `.ppt`, `.pptx`, `.odp` presentations into PDF. |
| **Edit & Sign** | **Edit PDF (Interactive)** | 🌐 Browser | Adds text, images, shapes, drag & move, rotate, and resize elements. |
| **Edit & Sign** | **Sign PDF** | 🌐 Browser | Freehand signature draw, cursive text typing, or signature image upload. |
| **Edit & Sign** | **Watermark PDF** | 🌐 Browser | Custom text or logo watermark with diagonal rotation and tiling. |
| **Edit & Sign** | **Add Page Number** | 🌐 Browser | Inserts customizable header/footer numbering with flexible formatting. |
| **Edit & Sign** | **Add Image to PDF** | 🌐 Browser | Overlays logos, stamps, or photos with opacity and scaling control. |
| **Edit & Sign** | **Crop PDF** | 🌐 Browser | Visual canvas cropper to trim margins and save print space. |
| **Edit & Sign** | **Highlight PDF** | 🌐 Browser | Highlights important paragraphs and tables on PDF pages. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or `v20+`
- **npm**, **yarn**, or **pnpm**
- **Docker** *(Optional, only required for Office ↔ PDF conversions)*

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ncpdf.git
cd ncpdf
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 4. (Optional) Start Gotenberg Microservice
To enable Word, Excel, and PowerPoint conversions locally:
```bash
docker compose -f docker/docker-compose.yml up -d
```
*(Gotenberg will run on port `3000` or `3001` as configured in `.env.local`)*

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

### Deploy to Cloudflare Pages (Recommended)
This repository is configured with `@cloudflare/next-on-pages` and `wrangler.toml`:
1. Connect your repository to **Cloudflare Pages**.
2. **Build command**: `npx @cloudflare/next-on-pages` (or `npm run pages:build`).
3. **Build output directory**: `.vercel/output/static`.
4. **Compatibility flags**: `nodejs_compat`.
5. Set environment variable: `GOTENBERG_URL` *(URL to your Gotenberg instance)*.

### Deploy to Vercel
1. Import the repository in [Vercel Dashboard](https://vercel.com).
2. Framework Preset: **Next.js**.
3. Add Environment Variable: `GOTENBERG_URL`.
4. Click **Deploy**.

### Self-Hosted Gotenberg Server Options
Gotenberg runs anywhere Docker is supported:
- **Local Machine**: `docker run --rm -p 3000:3000 gotenberg/gotenberg:8`
- **Railway**: Deploy image `gotenberg/gotenberg:8` and copy the public URL.
- **Fly.io**: `fly launch --image gotenberg/gotenberg:8`
- **Render / VPS / DigitalOcean / Hetzner**: Run the official container with HTTPS reverse proxy.

---

## 🔐 Privacy & Security Architecture

- **Zero-Retention Guarantee**: Client-side tools never upload data to servers.
- **In-Memory Streaming**: For server-assisted tools (Word/Excel/PPT), files are streamed over encrypted TLS connections, processed purely in volatile RAM, and deleted immediately after delivery.
- **No Analytics Tracking on User Files**: Files are never indexed, cataloged, or stored.

---

## 💻 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Core Engines**: [`pdf-lib`](https://pdf-lib.js.org/), [`pdfjs-dist`](https://mozilla.github.io/pdf.js/), [`jszip`](https://stuk.github.io/jszip/)
- **Conversion Engine**: [Gotenberg 8](https://gotenberg.dev/) (Docker container with LibreOffice)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Crafted with ❤️ by <a href="https://v1nicoopedia.vercel.app/" target="_blank">nicoo</a></sub>
</div>
