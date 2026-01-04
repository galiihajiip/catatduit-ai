# 🚀 Deploy OCR Feature to Production

Guide untuk deploy fitur OCR Receipt Scanner ke Vercel dengan Google Cloud Vision API.

## Option 1: Google Cloud Vision API (Recommended)

### Step 1: Setup Google Cloud Project

1. **Buka Google Cloud Console**
   - Go to: https://console.cloud.google.com/

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Name: `catatduit-ai`
   - Click "Create"

3. **Enable Vision API**
   - Go to: https://console.cloud.google.com/apis/library
   - Search: "Cloud Vision API"
   - Click "Enable"

4. **Create API Key**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key
   - (Optional) Click "Restrict Key" untuk security:
     - API restrictions: Select "Cloud Vision API"
     - Save

### Step 2: Setup Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Open your project: https://vercel.com/dashboard
   - Go to Settings → Environment Variables

2. **Add Environment Variable**
   ```
   Name: GOOGLE_CLOUD_VISION_API_KEY
   Value: [paste your API key]
   Environment: Production, Preview, Development
   ```

3. **Click "Save"**

### Step 3: Redeploy

```bash
git add .
git commit -m "feat: add Google Cloud Vision OCR"
git push
```

Vercel will auto-deploy. OCR feature akan langsung bisa dipakai!

### Pricing

**Google Cloud Vision API:**
- **Free Tier**: 1,000 requests/month
- **After free tier**: $1.50 per 1,000 requests
- **Estimate**: 
  - 100 receipts/day = 3,000/month = ~$3/month
  - 500 receipts/day = 15,000/month = ~$21/month

**Vercel:**
- **Hobby Plan**: Free (100GB bandwidth)
- **Pro Plan**: $20/month (1TB bandwidth)

---

## Option 2: Tesseract OCR (Self-hosted)

Jika tidak mau pakai Google Cloud, bisa deploy backend Python sendiri.

### Deploy Backend to Railway/Render

#### Railway (Recommended)

1. **Sign up**: https://railway.app/
2. **New Project** → "Deploy from GitHub repo"
3. **Select**: `catatduit-ai` repo
4. **Root Directory**: `/backend`
5. **Add Environment Variables**:
   ```
   DATABASE_URL=your_postgres_url
   TELEGRAM_BOT_TOKEN=your_token
   TESSERACT_CMD=/usr/bin/tesseract
   ```
6. **Deploy**

Railway akan auto-install Tesseract dan dependencies.

#### Render

1. **Sign up**: https://render.com/
2. **New** → "Web Service"
3. **Connect**: GitHub repo
4. **Settings**:
   - Name: `catatduit-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt && apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-ind`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables**
6. **Deploy**

### Update Frontend

Add to Vercel environment variables:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

---

## Option 3: Hybrid (Best of Both)

Gunakan Google Vision sebagai primary, Tesseract sebagai fallback:

```typescript
// In ocr.ts
try {
  return await processReceiptWithVision(base64)
} catch (visionError) {
  // Fallback to backend Tesseract
  return await processReceiptWithBackend(file)
}
```

---

## Testing

### Test Google Vision API

```bash
curl -X POST "https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {"content": "BASE64_IMAGE"},
      "features": [{"type": "TEXT_DETECTION"}]
    }]
  }'
```

### Test OCR Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/ocr/scan-receipt \
  -F "file=@receipt.jpg" \
  -F "telegram_id=123456789"
```

---

## Monitoring

### Google Cloud Console

- Go to: https://console.cloud.google.com/apis/dashboard
- Monitor API usage and errors
- Set up billing alerts

### Vercel Analytics

- Go to: https://vercel.com/dashboard/analytics
- Monitor API response times
- Check error rates

---

## Cost Optimization

### 1. Cache Results

```typescript
// Cache OCR results for 24 hours
const cacheKey = `ocr:${imageHash}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const result = await processReceipt(image)
await redis.setex(cacheKey, 86400, JSON.stringify(result))
```

### 2. Image Compression

```typescript
// Compress image before sending to API
const compressed = await compressImage(file, {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8
})
```

### 3. Rate Limiting

```typescript
// Limit to 10 OCR requests per user per day
const key = `ocr:limit:${userId}`
const count = await redis.incr(key)
if (count === 1) await redis.expire(key, 86400)
if (count > 10) throw new Error('Daily limit exceeded')
```

---

## Troubleshooting

### Error: "API key not configured"

**Solution**: Add `GOOGLE_CLOUD_VISION_API_KEY` to Vercel environment variables

### Error: "Quota exceeded"

**Solution**: 
1. Check usage in Google Cloud Console
2. Enable billing if needed
3. Implement rate limiting

### Error: "No text detected"

**Solution**:
1. Ensure image is clear and well-lit
2. Check image format (JPG, PNG)
3. Try different receipt

### Low Accuracy

**Solution**:
1. Use higher quality images
2. Ensure receipt is flat and not crumpled
3. Good lighting when taking photo
4. Try Google Vision API (better than Tesseract)

---

## Security

### API Key Protection

✅ **DO:**
- Store API key in environment variables
- Restrict API key to Vision API only
- Set up billing alerts
- Monitor usage regularly

❌ **DON'T:**
- Commit API key to Git
- Share API key publicly
- Use same key for multiple projects

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// In middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many OCR requests'
})
```

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Setup Google Cloud Vision API
3. ✅ Add environment variables
4. ✅ Test OCR feature
5. ⬜ Monitor usage and costs
6. ⬜ Implement caching
7. ⬜ Add rate limiting
8. ⬜ Setup error tracking (Sentry)

---

**Need Help?**
- Google Cloud Vision Docs: https://cloud.google.com/vision/docs
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
