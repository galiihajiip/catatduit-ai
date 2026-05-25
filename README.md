# CatatDuit AI

Dashboard keuangan berbasis Next.js untuk membaca struk belanja, mengkategorikan transaksi, dan menyimpan hasilnya ke Supabase. Versi terbaru sudah tidak memakai Telegram auth maupun Google Cloud Vision; aplikasi memakai akun demo dan OCR lokal dengan Tesseract.js.

## Fitur Utama

- **Landing page + demo login**: user bisa langsung masuk dengan credential demo yang tertera di halaman login.
- **OCR struk lokal**: upload atau ambil foto struk, lalu Tesseract.js membaca teks di server-side Node.js.
- **Parser rule-based**: regex dan keyword mapping untuk mendeteksi merchant, tanggal, total, item, kategori, wallet, dan confidence.
- **Kategori otomatis**: mendukung `Makanan`, `Transportasi`, `Tagihan`, `Belanja`, `Kesehatan`, `Hiburan`, `Keperluan Rumah Tangga`, dan `Lainnya`.
- **Studi case parser**: test fixture untuk berbagai jenis struk seperti bakery, minimarket, restoran, PLN token, PDAM, pulsa, SPBU, apotek, parkir, marketplace, bioskop, dan household store.
- **Dashboard analytics**: ringkasan saldo, pemasukan, pengeluaran, net income, breakdown kategori, tren, dompet, dan riwayat transaksi.
- **Multi-wallet**: tambah dompet dari dashboard dan simpan ke Supabase.

## Demo Account

Gunakan credential berikut di landing page:

```text
ID       : demo
Password : demo123
```

Secara internal, akun demo disimpan dengan key `demo-user`. Schema Supabase lama masih memiliki kolom `telegram_id`; kolom itu dipakai sebagai user key internal agar tidak perlu migrasi besar.

## Tech Stack

- **Next.js 14 App Router**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **Tesseract.js**
- **Recharts**
- **Jest**

## Struktur Project

```text
catatduit-ai/
├── frontend-web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth/demo/          # Demo login endpoint
│   │   │   │   ├── analytics/          # Analytics API
│   │   │   │   ├── ocr/scan-receipt/   # OCR upload endpoint
│   │   │   │   ├── transactions/       # Transaction API
│   │   │   │   └── wallets/            # Wallet API
│   │   │   └── page.tsx                # Landing + dashboard shell
│   │   ├── components/                 # UI components
│   │   ├── lib/
│   │   │   ├── demo-auth.ts            # Demo credentials
│   │   │   ├── nlp.ts                  # Rule-based transaction parser
│   │   │   ├── ocr.ts                  # Tesseract OCR + receipt parser
│   │   │   └── supabase.ts             # Supabase client
│   │   └── lib/__tests__/              # Parser study cases
│   ├── .env.example
│   └── package.json
├── supabase/
│   └── schema.sql
├── RUN_LOCAL.md
└── run-local.bat
```

## Quick Start

### 1. Install dependencies

```bash
cd frontend-web
npm install
```

### 2. Setup environment

Copy env template:

```bash
cp .env.example .env.local
```

Isi credential Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

Tidak perlu `GOOGLE_CLOUD_VISION_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, atau Telegram token.

### 3. Setup database

Jalankan SQL berikut di Supabase SQL Editor:

```text
supabase/schema.sql
```

### 4. Run local

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

Login dengan:

```text
demo / demo123
```

## OCR dan Parser

Alur scan struk:

```text
Upload/Camera
  -> /api/ocr/scan-receipt
  -> Tesseract.js OCR
  -> parseReceiptText()
  -> parseTransaction()
  -> Supabase transactions + wallet balance update
  -> Dashboard refresh
```

Parser menangani:

- Merchant dari baris awal atau pattern toko populer.
- Tanggal dari format angka dan bulan Indonesia/Inggris.
- Total dari `Total`, `Grand Total`, `Total Bayar`, `Jumlah`, `Bayar`, dan fallback angka terbesar bagian bawah.
- Item belanja dengan format `nama qty x harga`, `qty nama harga`, atau `nama harga`.
- Struk utility seperti PLN token, PDAM, pulsa, internet/wifi sebagai `Tagihan`.
- Filtering baris non-item seperti pajak, cash/tunai, debit, kembalian, ID pelanggan, nomor meter, dan KWH.

## Test

Run type-check:

```bash
npx tsc --noEmit
```

Run parser study cases:

```bash
npm test -- --runTestsByPath src/lib/__tests__/receipt-parser.test.ts
```

## Catatan Implementasi

- Auth demo bukan sistem auth production; ini untuk demo lokal/presentasi.
- `SUPABASE_SERVICE_KEY` hanya dipakai server-side API route. Jangan expose ke client.
- Tesseract.js dapat membuat cache bahasa OCR saat runtime. File `*.traineddata` sudah di-ignore.
- Telegram webhook dan Google Vision route lama sudah dihapus dari aplikasi.

## Deployment

Frontend bisa deploy ke Vercel. Set env berikut di dashboard Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

Pastikan Supabase schema sudah dijalankan sebelum digunakan.
