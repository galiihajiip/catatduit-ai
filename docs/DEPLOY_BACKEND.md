# 🚀 Deploy Backend Python ke Railway

Complete guide untuk deploy backend FastAPI + OCR ke Railway (free hosting).

## Why Railway?

- ✅ **Free Tier**: 500 hours/month (cukup untuk 1 app 24/7)
- ✅ **Auto Tesseract**: Install otomatis
- ✅ **Easy Deploy**: Connect GitHub, auto-deploy
- ✅ **PostgreSQL**: Free database included
- ✅ **Custom Domain**: Support custom domain
- ✅ **Logs**: Real-time logs & monitoring

---

## Step 1: Sign Up Railway

1. **Buka**: https://railway.app/
2. **Sign up** dengan GitHub
3. **Verify email**
4. **Free tier**: $5 credit/month (cukup untuk hobby project)

---

## Step 2: Create New Project

1. **Dashboard** → Click "New Project"
2. **Deploy from GitHub repo**
3. **Select**: `catatduit-ai` repository
4. **Root Directory**: `/backend`
5. **Click**: Deploy

Railway akan auto-detect Python dan install dependencies.

---

## Step 3: Add PostgreSQL Database

1. **Project** → Click "New"
2. **Select**: "Database" → "PostgreSQL"
3. **Wait**: Database provisioning (~30 seconds)
4. **Copy**: Database URL dari Variables tab

---

## Step 4: Configure Environment Variables

Di Railway project → Backend service → Variables tab, tambahkan:

```env
# Database (auto-generated, tapi bisa override)
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Supabase (copy dari Vercel)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# AI
AI_CONFIDENCE_THRESHOLD=0.85

# OCR (optional - for Google Vision)
GOOGLE_CLOUD_VISION_API_KEY=your-api-key

# App
DEBUG=false
PORT=8000
```

**Important**: Railway auto-provides `PORT` variable, jangan hardcode!

---

## Step 5: Deploy & Test

1. **Railway** akan auto-deploy setelah add variables
2. **Wait**: Build & deploy (~2-3 minutes)
3. **Get URL**: Copy deployment URL (e.g., `https://your-app.up.railway.app`)
4. **Test**: Buka `https://your-app.up.railway.app/` → Should see API info

---

## Step 6: Update Frontend

Di Vercel → Environment Variables, tambahkan:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-app.up.railway.app
```

Redeploy frontend.

---

## Step 7: Update Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-app.up.railway.app/telegram/webhook"
```

---

## Verify Deployment

### 1. Check API Health

```bash
curl https://your-app.up.railway.app/health
```

Expected: `{"status": "healthy"}`

### 2. Check OCR Endpoint

```bash
curl https://your-app.up.railway.app/ocr/scan-receipt
```

Expected: Error about missing file (means endpoint exists)

### 3. Check Logs

Railway Dashboard → Backend service → Deployments → View Logs

Look for:
- ✅ "Application startup complete"
- ✅ "Uvicorn running on..."
- ❌ No errors

---

## Alternative: Deploy to Render

Kalau Railway penuh, bisa pakai Render.com:

### Render Setup:

1. **Sign up**: https://render.com/
2. **New** → "Web Service"
3. **Connect**: GitHub repo
4. **Settings**:
   - Name: `catatduit-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment**: Add same variables as Railway
6. **Create Web Service**

---

## Troubleshooting

### Error: "Tesseract not found"

**Solution**: Railway should auto-install. Check `nixpacks.toml` exists in backend folder.

### Error: "Database connection failed"

**Solution**: 
1. Check `DATABASE_URL` format
2. Make sure PostgreSQL service is running
3. Check database credentials

### Error: "Port already in use"

**Solution**: Railway auto-provides `$PORT`. Make sure `main.py` uses:
```python
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

### Build Failed

**Solution**:
1. Check `requirements.txt` valid
2. Check Python version in `runtime.txt`
3. View build logs for specific error

---

## Cost Estimation

### Railway Free Tier:
- **Included**: $5 credit/month
- **Usage**: ~$5/month for 1 backend + 1 database
- **Conclusion**: FREE for hobby projects!

### If Exceed Free Tier:
- **Backend**: ~$5/month
- **PostgreSQL**: ~$5/month
- **Total**: ~$10/month

### Optimization Tips:
1. **Sleep on Idle**: Railway auto-sleeps inactive apps (saves $)
2. **Shared Database**: Use Supabase instead of Railway PostgreSQL
3. **Caching**: Implement Redis caching to reduce compute

---

## Production Checklist

- [ ] Backend deployed to Railway
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Frontend updated with backend URL
- [ ] Telegram webhook updated
- [ ] Health check passing
- [ ] OCR endpoint working
- [ ] Logs monitored
- [ ] Custom domain configured (optional)
- [ ] Backup strategy in place

---

## Monitoring

### Railway Dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History & rollback

### Set Up Alerts:
1. Railway → Project → Settings
2. **Notifications**: Enable email alerts
3. **Webhooks**: Add Discord/Slack webhook (optional)

---

## Scaling

### Vertical Scaling (More Power):
Railway → Service → Settings → Resources
- Increase CPU/Memory if needed
- Costs more $

### Horizontal Scaling (More Instances):
- Railway Pro plan required
- Auto-scaling based on load

---

## Backup & Recovery

### Database Backup:
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Code Backup:
- Already in GitHub ✅
- Railway auto-deploys from GitHub ✅

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Test OCR via Telegram
3. ✅ Monitor logs & performance
4. ⬜ Set up custom domain
5. ⬜ Implement caching (Redis)
6. ⬜ Add error tracking (Sentry)
7. ⬜ Set up CI/CD pipeline
8. ⬜ Load testing

---

**Need Help?**
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- GitHub Issues: [your repo]

---

**Congratulations! 🎉**

Backend Python sekarang running 24/7 di cloud dengan:
- ✅ Tesseract OCR
- ✅ FastAPI
- ✅ PostgreSQL
- ✅ Auto-deploy from GitHub
- ✅ Free hosting!
