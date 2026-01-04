# 🚀 Run Local dengan Ngrok

## Step 1: Edit Environment Variables
Buka file `frontend-web/.env.local` dan isi dengan credentials lo:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
TELEGRAM_BOT_TOKEN=your-bot-token
GOOGLE_CLOUD_VISION_API_KEY=your-new-api-key
```

## Step 2: Install Dependencies (kalau belum)
```bash
cd frontend-web
npm install
```

## Step 3: Run Development Server
```bash
npm run dev
```

Server jalan di http://localhost:3000

## Step 4: Install Ngrok (kalau belum punya)
Download dari: https://ngrok.com/download
Atau pake chocolatey (Windows):
```bash
choco install ngrok
```

## Step 5: Expose ke Internet dengan Ngrok
Buka terminal baru, jalankan:
```bash
ngrok http 3000
```

Lo bakal dapet URL kayak: `https://abc123.ngrok.io`

## Step 6: Update Telegram Webhook
Ganti `YOUR_BOT_TOKEN` dan `YOUR_NGROK_URL`:
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_NGROK_URL/api/telegram/webhook"
```

Contoh:
```bash
curl -X POST "https://api.telegram.org/bot123456:ABC-DEF/setWebhook?url=https://abc123.ngrok.io/api/telegram/webhook"
```

## Step 7: Test!
Upload struk ke bot Telegram lo. Sekarang harusnya work!

## Troubleshooting
- Kalau ngrok error: pastikan port 3000 gak dipake app lain
- Kalau webhook gagal: cek TELEGRAM_BOT_TOKEN udah bener
- Kalau OCR error: cek GOOGLE_CLOUD_VISION_API_KEY udah bener

## Stop Server
- Ctrl+C di terminal Next.js
- Ctrl+C di terminal Ngrok
