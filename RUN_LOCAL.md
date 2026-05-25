# Run Local

Panduan menjalankan CatatDuit AI versi demo login + OCR lokal.

## 1. Setup Environment

Buat `frontend-web/.env.local` dari template:

```bash
cd frontend-web
cp .env.example .env.local
```

Isi credential Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

Tidak perlu Google Vision API key, Google application credentials, Telegram bot token, atau ngrok.

## 2. Setup Database

Jalankan file berikut di Supabase SQL Editor:

```text
supabase/schema.sql
```

## 3. Install Dependencies

```bash
cd frontend-web
npm install
```

## 4. Run Development Server

```bash
npm run dev
```

Server berjalan di:

```text
http://localhost:3000
```

## 5. Login Demo

Gunakan akun demo:

```text
ID       : demo
Password : demo123
```

Saat login pertama, API akan membuat user demo dan wallet `Cash` di Supabase jika belum ada.

## 6. Test OCR

1. Login ke dashboard.
2. Klik tombol scan struk.
3. Upload foto struk.
4. Hasil OCR akan dicatat sebagai transaksi dan saldo wallet diperbarui.

## Troubleshooting

- Jika login gagal, cek `SUPABASE_SERVICE_KEY`.
- Jika dashboard kosong, pastikan `supabase/schema.sql` sudah dijalankan.
- Jika OCR lambat saat pertama kali dipakai, Tesseract.js sedang memuat data bahasa.
- Jika muncul file `*.traineddata`, file tersebut adalah cache OCR dan sudah di-ignore.

## Stop Server

Tekan `Ctrl+C` di terminal yang menjalankan `npm run dev`.
