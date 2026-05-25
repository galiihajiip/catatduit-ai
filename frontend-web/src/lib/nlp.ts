export type TransactionIntent = 'expense' | 'income' | 'transfer'

export interface ParsedTransaction {
  intent: TransactionIntent
  amount: number
  category: string
  wallet: string | null
  description: string
  confidence: number
}

interface KeywordRule {
  category: string
  keywords: string[]
}

const CATEGORY_RULES: KeywordRule[] = [
  {
    category: 'Makanan',
    keywords: [
      'makan',
      'makanan',
      'resto',
      'restaurant',
      'restoran',
      'warung',
      'kopi',
      'cafe',
      'bakso',
      'telor',
      'telur',
      'telor gulung',
      'telur gulung',
      'cilok',
      'cireng',
      'seblak',
      'martabak',
      'gorengan',
      'nasi',
      'mie',
      'ayam',
      'sate',
      'roti',
      'bread',
      'breadtalk',
      'croissant',
      'cream',
      'brulee',
      'bruille',
      'pastry',
      'cake',
      'kue',
      'bakery',
      'snack',
      'jajan',
      'minum',
      'gofood',
      'grabfood',
    ],
  },
  {
    category: 'Transportasi',
    keywords: ['bensin', 'bbm', 'pertamax', 'solar', 'parkir', 'parkir liar', 'tol', 'toll', 'ojek', 'ojol', 'gojek', 'grab', 'taxi', 'kereta', 'mrt', 'lrt', 'bus'],
  },
  {
    category: 'Tagihan',
    keywords: ['listrik', 'pln', 'kwh', 'token', 'stroom', 'prepaid', 'air', 'pdam', 'wifi', 'internet', 'pulsa', 'indihome', 'telkom', 'sewa', 'kos', 'cicilan'],
  },
  {
    category: 'Keperluan Rumah Tangga',
    keywords: ['sabun', 'detergen', 'shampo', 'sikat gigi', 'pasta gigi', 'tissue', 'dapur', 'pel', 'sapu', 'ember'],
  },
  {
    category: 'Belanja',
    keywords: ['belanja', 'beli', 'mall', 'toko', 'market', 'minimarket', 'indomaret', 'alfamart', 'shopee', 'tokopedia', 'tokped', 'lazada'],
  },
  {
    category: 'Hiburan',
    keywords: ['nonton', 'bioskop', 'cinema', 'game', 'spotify', 'netflix', 'youtube', 'konser', 'karaoke'],
  },
  {
    category: 'Kesehatan',
    keywords: ['obat', 'dokter', 'rumah sakit', 'klinik', 'apotek', 'vitamin', 'medical', 'health'],
  },
]

const WALLET_KEYWORDS: Record<string, string[]> = {
  GoPay: ['gopay', 'go-pay'],
  OVO: ['ovo'],
  Dana: ['dana'],
  ShopeePay: ['shopeepay', 'shopee pay'],
  'Bank BCA': ['bca'],
  'Bank BRI': ['bri'],
  'Bank Mandiri': ['mandiri'],
  Cash: ['cash', 'tunai', 'kas'],
}

const INCOME_KEYWORDS = ['gaji', 'salary', 'honor', 'bonus', 'dapat', 'terima', 'masuk', 'freelance', 'proyek', 'dividen']
const TRANSFER_KEYWORDS = ['transfer', 'kirim', 'pindah saldo', 'tf']
const EXPENSE_KEYWORDS = ['beli', 'bayar', 'buat', 'untuk', 'habis', 'keluar', 'spend', 'belanja']

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function hasKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'i').test(text)
}

export function parseAmountFromText(text: string): { amount: number; confidence: number } {
  const normalized = normalizeText(text)

  const jutaMatch = normalized.match(/\b(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i)
  if (jutaMatch) {
    return {
      amount: Math.round(Number.parseFloat(jutaMatch[1].replace(',', '.')) * 1_000_000),
      confidence: 0.95,
    }
  }

  const ribuMatch = normalized.match(/\b(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)\b/i)
  if (ribuMatch) {
    return {
      amount: Math.round(Number.parseFloat(ribuMatch[1].replace(',', '.')) * 1_000),
      confidence: 0.95,
    }
  }

  const rupiahMatch = normalized.match(/\b(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,})\b/i)
  if (rupiahMatch) {
    const value = rupiahMatch[1].replace(/[.,]/g, '')
    return {
      amount: Number.parseInt(value, 10) || 0,
      confidence: 0.8,
    }
  }

  return { amount: 0, confidence: 0 }
}

export function detectIntent(text: string): { intent: TransactionIntent; confidence: number } {
  const normalized = normalizeText(text)

  if (INCOME_KEYWORDS.some((keyword) => hasKeyword(normalized, keyword))) {
    return { intent: 'income', confidence: 0.95 }
  }

  if (TRANSFER_KEYWORDS.some((keyword) => hasKeyword(normalized, keyword))) {
    return { intent: 'transfer', confidence: 0.9 }
  }

  if (EXPENSE_KEYWORDS.some((keyword) => hasKeyword(normalized, keyword))) {
    return { intent: 'expense', confidence: 0.9 }
  }

  return { intent: 'expense', confidence: 0.65 }
}

export function categorizeTransactionText(text: string): { category: string; confidence: number } {
  const normalized = normalizeText(text)

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => hasKeyword(normalized, keyword))) {
      return { category: rule.category, confidence: 0.95 }
    }
  }

  return { category: 'Lainnya', confidence: 0.45 }
}

export function detectWallet(text: string): string | null {
  const normalized = normalizeText(text)

  for (const [wallet, keywords] of Object.entries(WALLET_KEYWORDS)) {
    if (keywords.some((keyword) => hasKeyword(normalized, keyword))) {
      return wallet
    }
  }

  return null
}

export function parseTransaction(text: string, amountOverride?: number): ParsedTransaction {
  const intentResult = detectIntent(text)
  const amountResult = amountOverride && amountOverride > 0
    ? { amount: amountOverride, confidence: 1 }
    : parseAmountFromText(text)
  const categoryResult =
    intentResult.intent === 'income'
      ? { category: 'Pemasukan', confidence: 0.85 }
      : categorizeTransactionText(text)

  const confidence =
    intentResult.confidence * 0.3 +
    amountResult.confidence * 0.4 +
    categoryResult.confidence * 0.3

  return {
    intent: intentResult.intent,
    amount: amountResult.amount,
    category: categoryResult.category,
    wallet: detectWallet(text),
    description: text.trim(),
    confidence: Math.round(confidence * 100) / 100,
  }
}
