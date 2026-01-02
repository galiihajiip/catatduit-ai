# CatatDuit AI - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│   Telegram Bot      │   Flutter App       │   Web Dashboard         │
│   (Chat Interface)  │   (Mobile)          │   (Future)              │
└─────────┬───────────┴─────────┬───────────┴─────────────┬───────────┘
          │                     │                         │
          ▼                     ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                        │
│                    - SSL Termination                                 │
│                    - Rate Limiting                                   │
│                    - Load Balancing                                  │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Telegram   │  │ Transaction │  │  Analytics  │  │   Wallet    │ │
│  │   Router    │  │   Router    │  │   Router    │  │   Router    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│         ▼                ▼                ▼                ▼        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      SERVICE LAYER                           │   │
│  │  - TelegramService  - TransactionService  - AnalyticsService │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      AI/NLP ENGINE                           │   │
│  │  - Intent Classification  - Entity Extraction                │   │
│  │  - Category Mapping       - Confidence Scoring               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │  File Storage   │
│   (Primary DB)  │    │    (Cache)      │    │   (Exports)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Data Flow

### 1. Telegram Message Flow
```
User Message → Telegram API → Webhook → FastAPI → AI Engine → Parse
                                                      ↓
                                              Confidence Check
                                                      ↓
                              ┌────────────────────────┴────────────────────────┐
                              ↓                                                 ↓
                        ≥ 0.85                                            < 0.85
                              ↓                                                 ↓
                        Auto Save                                    Send Confirmation
                              ↓                                                 ↓
                        Update DB                                    Wait for Reply
                              ↓                                                 ↓
                        Send Success                                 Process Reply
```

### 2. API Request Flow
```
Flutter App → API Request → JWT Validation → Route Handler → Service → DB → Response
```

### 3. Analytics Calculation Flow
```
Request → Check Cache → Cache Hit? → Return Cached
                            ↓ No
                    Query Transactions
                            ↓
                    Calculate Metrics
                            ↓
                    Update Cache
                            ↓
                    Return Response
```

## Database Schema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    wallets      │     │   categories    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID) PK    │────<│ id (UUID) PK    │     │ id (UUID) PK    │
│ telegram_id     │     │ user_id FK      │     │ name            │
│ name            │     │ name            │     │ color_hex       │
│ email           │     │ balance         │     │ icon            │
│ is_pro          │     │ color_hex       │     │ type            │
│ created_at      │     │ icon            │     │ is_system       │
│ updated_at      │     │ created_at      │     └────────┬────────┘
└────────┬────────┘     └────────┬────────┘              │
         │                       │                       │
         │     ┌─────────────────┴───────────────────────┘
         │     │
         ▼     ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│       transactions          │     │      analytics_cache        │
├─────────────────────────────┤     ├─────────────────────────────┤
│ id (UUID) PK                │     │ id (UUID) PK                │
│ user_id FK                  │     │ user_id FK                  │
│ wallet_id FK                │     │ month                       │
│ category_id FK              │     │ total_income                │
│ type (enum)                 │     │ total_expense               │
│ amount                      │     │ net_income                  │
│ description                 │     │ expense_ratio               │
│ raw_input                   │     │ saving_ratio                │
│ ai_confidence               │     │ top_categories (JSON)       │
│ created_at                  │     │ updated_at                  │
└─────────────────────────────┘     └─────────────────────────────┘
```

## AI/NLP Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     INPUT TEXT                                   │
│              "beli bakso 15rb pake gopay"                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PREPROCESSING                                 │
│  - Lowercase conversion                                          │
│  - Whitespace normalization                                      │
│  - Slang normalization                                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Intent Extractor│ │ Amount Extractor│ │ Entity Extractor│
│                 │ │                 │ │                 │
│ Keywords:       │ │ Patterns:       │ │ - Category      │
│ - beli → expense│ │ - 15rb → 15000  │ │ - Wallet        │
│ - dapat → income│ │ - 15k → 15000   │ │ - Description   │
│ - tf → transfer │ │ - 15000 → 15000 │ │                 │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONFIDENCE CALCULATOR                          │
│  - Intent confidence: 0.95                                       │
│  - Amount confidence: 0.95                                       │
│  - Category confidence: 0.95                                     │
│  - Overall: (0.95 * 0.3) + (0.95 * 0.4) + (0.95 * 0.3) = 0.95   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OUTPUT JSON                                 │
│  {                                                               │
│    "intent": "expense",                                          │
│    "amount": 15000,                                              │
│    "currency": "IDR",                                            │
│    "category": "Makanan",                                        │
│    "wallet": "GoPay",                                            │
│    "description": "beli bakso 15rb pake gopay",                  │
│    "confidence": 0.95,                                           │
│    "timestamp": "2024-01-15T10:30:00Z"                           │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Network Security                                       │
│  ├── HTTPS/TLS encryption                                        │
│  ├── Firewall rules                                              │
│  └── DDoS protection                                             │
│                                                                  │
│  Layer 2: Application Security                                   │
│  ├── Rate limiting (10 req/s API, 30 req/s Telegram)            │
│  ├── Input validation & sanitization                             │
│  ├── SQL injection prevention (ORM)                              │
│  └── XSS protection headers                                      │
│                                                                  │
│  Layer 3: Authentication                                         │
│  ├── JWT tokens with expiration                                  │
│  ├── Telegram ID binding                                         │
│  └── Secure password hashing (bcrypt)                            │
│                                                                  │
│  Layer 4: Data Security                                          │
│  ├── Encrypted secrets (env vars)                                │
│  ├── Database encryption at rest                                 │
│  └── Secure backup storage                                       │
│                                                                  │
│  Layer 5: AI Security                                            │
│  ├── Prompt injection protection                                 │
│  ├── Input length limits                                         │
│  └── Output validation                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Docker Compose                        │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │    │
│  │  │ Backend │  │   DB    │  │  Redis  │  │  Nginx  │    │    │
│  │  │ :8000   │  │ :5432   │  │ :6379   │  │ :80/443 │    │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Volumes:                                                        │
│  ├── postgres_data (persistent)                                  │
│  ├── redis_data (persistent)                                     │
│  └── ssl_certs (mounted)                                         │
│                                                                  │
│  Networks:                                                       │
│  └── catatduit-network (bridge)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
