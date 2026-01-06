<p align="center">
  <img src="https://img.shields.io/badge/CatatDuit-AI-16A085?style=for-the-badge&logo=robot&logoColor=white" alt="CatatDuit AI"/>
</p>

<h1 align="center">💰 CatatDuit AI</h1>

<p align="center">
  <strong>Catat keuangan cukup dengan chat. AI yang mengerti bahasa Indonesia sehari-hari.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Telegram-26A5E4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"/>
</p>

<p align="center">
  <a href="#-demo">Demo</a> •
  <a href="#-fitur">Fitur</a> •
  <a href="#-cara-kerja">Cara Kerja</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

---

## 🎯 Core Promise

> **"Cukup chat, keuangan langsung tercatat & dianalisis."**

Tidak perlu buka aplikasi, tidak perlu isi form. Cukup kirim pesan seperti ngobrol biasa ke Telegram, AI kami akan otomatis mencatat dan mengkategorikan transaksi kamu.

## 🎬 Demo

```
Kamu: "beli bakso 15rb pake gopay"
Bot:  ✅ Tercatat! Pengeluaran Rp 15.000 untuk Makanan (GoPay)

Kamu: "gajian 5jt dari kantor"  
Bot:  ✅ Tercatat! Pemasukan Rp 5.000.000 - Gaji

Kamu: "abis 50k buat ngopi sama temen"
Bot:  ✅ Tercatat! Pengeluaran Rp 50.000 untuk Makanan

Kamu: [Kirim foto struk Alfamart]
Bot:  📸 Memproses struk... 
      ✅ Struk berhasil diproses!
      🏪 Merchant: Alfamart
      💰 Total: Rp 125.000
      📦 5 items tercatat
      Saldo dompet diperbarui!
```

## ✨ Fitur

### 🤖 AI Natural Language Processing
- **Bahasa Gaul Indonesia** - Mengerti "50k", "15rb", "5jt", "gopay", "ovo", dll
- **Auto-Kategorisasi** - Otomatis mendeteksi kategori dari konteks
- **Multi-Wallet Detection** - Deteksi otomatis metode pembayaran
- **Confidence Scoring** - Sistem kepercayaan untuk akurasi tinggi

### 📸 OCR Receipt Scanner (NEW!)
- **Upload Foto Struk** - Upload foto struk dari galeri
- **Real-time Camera** - Ambil foto struk langsung dari kamera
- **Auto-Extract Data** - AI ekstrak merchant, total, dan items otomatis
- **Smart Categorization** - Kategorisasi otomatis berdasarkan items
- **Instant Recording** - Transaksi langsung tercatat dan saldo terupdate
- **Works Offline** - Mode simple tanpa perlu API key (demo mode)
- **Upgrade to Vision API** - Akurasi tinggi dengan Google Cloud Vision (optional)

### 📊 Dashboard Analytics
- **Real-time Summary** - Total pemasukan, pengeluaran, dan net income
- **Category Breakdown** - Visualisasi pengeluaran per kategori
- **Trend Analysis** - Grafik tren keuangan bulanan
- **Saving Ratio** - Persentase tabungan otomatis

### 💼 Multi-Wallet Management
- Kelola berbagai dompet (Cash, GoPay, OVO, Dana, Bank, dll)
- Tracking saldo per wallet
- Transfer antar wallet

### 📱 Cross-Platform
- **Telegram Bot** - Input transaksi via chat
- **Web Dashboard** - Visualisasi dan analisis lengkap
- **Responsive Design** - Optimal di desktop dan mobile

## 🧠 Cara Kerja

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Chat     │────▶│   AI Engine     │────▶│   Database      │
│   "beli bakso   │     │   - Intent      │     │   - Users       │
│    15rb gopay"  │     │   - Amount      │     │   - Wallets     │
└─────────────────┘     │   - Category    │     │   - Transactions│
                        │   - Wallet      │     └─────────────────┘
                        └─────────────────┘              │
                                                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   Web Dashboard │◀────│   Analytics     │
                        │   - Charts      │     │   - Summary     │
                        │   - History     │     │   - Trends      │
                        └─────────────────┘     └─────────────────┘
```

### AI Processing Pipeline

```
Input: "abis 50k buat ngopi pake ovo"
                    │
                    ▼
┌─────────────────────────────────────┐
│         PREPROCESSING               │
│  • Lowercase & normalize            │
│  • Slang detection                  │
└─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Intent    │ │   Amount    │ │   Entity    │
│   Detector  │ │   Parser    │ │   Extractor │
│             │ │             │ │             │
│ "abis" →    │ │ "50k" →     │ │ "ngopi" →   │
│  expense    │ │  50000      │ │  Makanan    │
│             │ │             │ │ "ovo" →     │
│             │ │             │ │  OVO        │
└─────────────┘ └─────────────┘ └─────────────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
┌─────────────────────────────────────┐
│         OUTPUT JSON                 │
│  {                                  │
│    "intent": "expense",             │
│    "amount": 50000,                 │
│    "category": "Makanan",           │
│    "wallet": "OVO",                 │
│    "confidence": 0.95               │
│  }                                  │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL / Supabase account
- Telegram Bot Token
- Google Cloud Vision API Key (optional)

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/catatduit-ai.git
cd catatduit-ai
```

#### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy dan edit environment variables
cp .env.example .env
# Edit .env dengan credentials kamu
```

#### 3. Setup Frontend
```bash
cd frontend-web
npm install

# Copy dan edit environment variables
cp .env.example .env.local
# Edit .env.local dengan Supabase credentials
```

#### 4. Setup Database
```sql
-- Jalankan di Supabase SQL Editor
-- File: supabase/schema.sql
```

#### 5. Run Development
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend-web
npm run dev
```

### Production Deployment

#### Deploy Frontend to Vercel
```bash
# Push to GitHub, then:
# 1. Import project to Vercel
# 2. Add environment variables
# 3. Deploy
```

See: [Vercel Deployment Guide](https://vercel.com/docs)

#### Deploy Backend to Railway
```bash
# 1. Sign up at railway.app
# 2. New Project → Deploy from GitHub
# 3. Select backend folder
# 4. Add environment variables
# 5. Deploy
```

See: [docs/DEPLOY_BACKEND.md](docs/DEPLOY_BACKEND.md) for complete guide.

#### Setup OCR
- **Google Vision API**: [docs/DEPLOY_OCR.md](docs/DEPLOY_OCR.md)
- **Tesseract (Railway)**: Auto-installed ✅

## 🐳 Docker Deployment

```bash
# Build dan run semua services
docker-compose up -d

# Cek logs
docker-compose logs -f
```

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python API framework |
| **SQLAlchemy** | ORM untuk database operations |
| **PostgreSQL** | Primary database |
| **Redis** | Caching & session management |
| **python-telegram-bot** | Telegram Bot API integration |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework dengan App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Recharts** | Data visualization |
| **Supabase** | Backend-as-a-Service |

### AI/NLP
| Component | Description |
|-----------|-------------|
| **Custom NLP Engine** | Indonesian language processing |
| **Intent Classification** | Expense/Income/Transfer detection |
| **Entity Extraction** | Amount, category, wallet parsing |
| **Slang Normalization** | "50k" → 50000, "jt" → juta |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Docker** | Containerization |
| **Nginx** | Reverse proxy & SSL |
| **Vercel** | Frontend hosting |
| **Supabase** | Database & Auth |

## 📁 Project Structure

```
catatduit-ai/
├── backend/
│   ├── app/
│   │   ├── ai/              # NLP Engine
│   │   ├── api/             # API Routes
│   │   ├── core/            # Config & Security
│   │   ├── db/              # Database
│   │   ├── models/          # SQLAlchemy Models
│   │   ├── schemas/         # Pydantic Schemas
│   │   └── services/        # Business Logic
│   ├── main.py
│   └── requirements.txt
│
├── frontend-web/
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React Components
│   │   └── lib/             # Utilities
│   └── package.json
│
├── ai-training/
│   ├── dataset.json         # Training data
│   ├── dataset_extended.json
│   └── dataset_slang.json   # Slang patterns
│
├── database/
│   └── init.sql
│
├── supabase/
│   └── schema.sql
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRO_FEATURES.md
│   └── PRODUCTION_CHECKLIST.md
│
└── docker-compose.yml
```

## 💎 Pro Features

| Feature | Free | Pro |
|---------|:----:|:---:|
| Wallets | 3 | ∞ |
| Custom Categories | ❌ | ✅ |
| Transaction History | 1 bulan | ∞ |
| AI Insights | Basic | Advanced |
| Export PDF/CSV | ❌ | ✅ |
| Budget Alerts | ❌ | ✅ |
| Priority Support | ❌ | ✅ |

## 🔒 Security

- 🔐 JWT Authentication
- 🛡️ Rate Limiting (API & Telegram)
- 🔒 SQL Injection Prevention (ORM)
- 🔑 Environment-based secrets
- 📝 Input validation & sanitization

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Telegram Bot API](https://core.telegram.org/bots/api) - Bot platform

---

<p align="center">
  Made with ❤️ for Indonesian users
</p>

<p align="center">
  <a href="https://t.me/catatduitgalih_bot">
    <img src="https://img.shields.io/badge/Try%20Bot-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Try on Telegram"/>
  </a>
</p>
