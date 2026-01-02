# CatatDuit AI

AI-powered personal finance management with Telegram-based natural language input.

**Core Promise:** "Cukup chat, keuangan langsung tercatat & dianalisis."

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Telegram  │────▶│   FastAPI   │────▶│   AI/NLP    │────▶│ PostgreSQL  │
│     Bot     │◀────│   Backend   │◀────│   Engine    │◀────│   Database  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Flutter   │
                    │  Dashboard  │
                    └─────────────┘
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
flutter pub get
flutter run
```

## Tech Stack
- Backend: FastAPI + PostgreSQL
- Frontend: Flutter + Riverpod + fl_chart
- AI: Custom NLP for Indonesian language
- Bot: Telegram Webhook
