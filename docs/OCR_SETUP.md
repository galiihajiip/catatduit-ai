# 📸 OCR Feature Setup Guide

Quick guide untuk setup fitur OCR Receipt Scanner.

## Prerequisites

- Python 3.9+
- Node.js 18+
- Tesseract OCR

## Installation Steps

### 1. Install Tesseract OCR

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-ind tesseract-ocr-eng
```

#### macOS
```bash
brew install tesseract tesseract-lang
```

#### Windows
1. Download installer dari: https://github.com/UB-Mannheim/tesseract/wiki
2. Install ke `C:\Program Files\Tesseract-OCR`
3. Add ke PATH environment variable

### 2. Install Python Dependencies

```bash
cd backend
pip install pytesseract pillow python-multipart
```

### 3. Configure Environment

Edit `backend/.env`:

```env
# OCR Configuration
TESSERACT_CMD=/usr/bin/tesseract  # Adjust path for your system
OCR_CONFIDENCE_THRESHOLD=0.85
MAX_UPLOAD_SIZE=10485760  # 10MB
```

**Windows users**: Set `TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe`

### 4. Create Upload Directory

```bash
mkdir -p backend/uploads/receipts
```

### 5. Run Database Migration

```bash
# PostgreSQL
psql -U postgres -d catatduit -f database/migrations/001_add_receipt_image_path.sql

# Or via Supabase SQL Editor
# Run the migration script in Supabase dashboard
```

### 6. Test OCR Engine

```bash
cd backend
python -c "from app.ai.ocr_engine import ocr_engine; print('OCR Ready!' if ocr_engine else 'OCR Not Available')"
```

Expected output: `OCR Ready!`

### 7. Start Backend

```bash
cd backend
uvicorn main:app --reload
```

### 8. Start Frontend

```bash
cd frontend-web
npm run dev
```

## Verify Installation

### Test via API

```bash
# Upload test receipt
curl -X POST http://localhost:8000/ocr/scan-receipt \
  -F "file=@test_receipt.jpg" \
  -F "telegram_id=123456789"
```

### Test via Web

1. Open http://localhost:3000
2. Login with Telegram ID
3. Click camera button (bottom-right)
4. Upload or capture receipt photo
5. Check if transaction is created

### Test via Telegram

1. Open Telegram bot
2. Send photo of receipt
3. Wait for processing message
4. Check if transaction is recorded

## Troubleshooting

### Error: "pytesseract not installed"

```bash
pip install pytesseract pillow
```

### Error: "Tesseract not found"

Check Tesseract installation:
```bash
tesseract --version
```

If not found, install Tesseract or update `TESSERACT_CMD` path.

### Error: "OCR engine not available"

Check if pytesseract can find Tesseract:
```python
import pytesseract
print(pytesseract.get_tesseract_version())
```

### Low OCR Accuracy

1. Install Indonesian language data:
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr-ind

# macOS
brew install tesseract-lang
```

2. Verify language data:
```bash
tesseract --list-langs
```

Should show: `ind` and `eng`

### Upload Fails

Check upload directory permissions:
```bash
chmod 755 backend/uploads
chmod 755 backend/uploads/receipts
```

## Performance Optimization

### 1. Image Preprocessing

Add image preprocessing for better accuracy:

```python
# In ocr_engine.py
from PIL import ImageEnhance, ImageFilter

def preprocess_image(image):
    # Convert to grayscale
    image = image.convert('L')
    
    # Increase contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)
    
    # Sharpen
    image = image.filter(ImageFilter.SHARPEN)
    
    return image
```

### 2. Async Processing

For production, use background tasks:

```python
from fastapi import BackgroundTasks

@router.post("/ocr/scan-receipt")
async def scan_receipt(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    ...
):
    background_tasks.add_task(process_receipt, file_path, user_id)
    return {"status": "processing"}
```

### 3. Caching

Cache OCR results to avoid reprocessing:

```python
import hashlib
import redis

def get_cached_result(image_hash):
    return redis_client.get(f"ocr:{image_hash}")

def cache_result(image_hash, result):
    redis_client.setex(f"ocr:{image_hash}", 3600, result)
```

## Production Checklist

- [ ] Tesseract installed and configured
- [ ] Upload directory created with proper permissions
- [ ] Environment variables set
- [ ] Database migration applied
- [ ] OCR engine tested
- [ ] File size limits configured
- [ ] Error handling implemented
- [ ] Logging enabled
- [ ] Backup strategy for receipt images
- [ ] Auto-cleanup old receipts (optional)

## Alternative: Google Vision API

For better accuracy, consider Google Vision API:

```bash
pip install google-cloud-vision
```

```python
from google.cloud import vision

def ocr_with_google_vision(image_path):
    client = vision.ImageAnnotatorClient()
    
    with open(image_path, 'rb') as f:
        content = f.read()
    
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    
    return response.text_annotations[0].description
```

**Note**: Requires Google Cloud account and API key.

## Support

If you encounter issues:

1. Check logs: `backend/logs/app.log`
2. Test Tesseract directly: `tesseract test.jpg output`
3. Verify Python dependencies: `pip list | grep pytesseract`
4. Check GitHub issues: [link to repo]

---

Happy scanning! 📸
