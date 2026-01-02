// Indonesian NLP Engine for parsing financial text

interface ParsedTransaction {
  intent: 'expense' | 'income' | 'transfer'
  amount: number
  category: string
  wallet: string | null
  description: string
  confidence: number
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Makanan': ['bakso', 'nasi', 'makan', 'kopi', 'jajan', 'mie', 'ayam', 'sate', 'gorengan', 'es', 'teh', 'minuman', 'snack', 'cemilan', 'sarapan', 'lunch', 'dinner', 'breakfast', 'gofood', 'grabfood'],
  'Tagihan': ['listrik', 'air', 'wifi', 'internet', 'pulsa', 'token', 'pln', 'indihome', 'telkom', 'gas', 'pdam', 'kos', 'sewa', 'cicilan'],
  'Transportasi': ['bensin', 'parkir', 'ojol', 'gojek', 'grab', 'taxi', 'bus', 'kereta', 'mrt', 'lrt', 'toll', 'tol', 'bbm', 'pertamax'],
  'Keperluan Rumah Tangga': ['sabun', 'sikat gigi', 'detergen', 'shampo', 'pasta gigi', 'tissue', 'pel', 'sapu', 'ember'],
  'Pemasukan': ['gaji', 'salary', 'honor', 'bonus', 'transfer masuk', 'terima', 'dapat', 'freelance', 'proyek', 'dividen'],
  'Belanja': ['beli', 'belanja', 'shopping', 'mall', 'toko', 'online', 'shopee', 'tokped', 'lazada'],
  'Hiburan': ['nonton', 'bioskop', 'game', 'spotify', 'netflix', 'youtube', 'konser'],
  'Kesehatan': ['obat', 'dokter', 'rumah sakit', 'apotek', 'vitamin'],
}

const WALLET_KEYWORDS: Record<string, string[]> = {
  'GoPay': ['gopay', 'go-pay'],
  'OVO': ['ovo'],
  'Dana': ['dana'],
  'ShopeePay': ['shopeepay', 'shopee pay'],
  'Bank BCA': ['bca'],
  'Bank BRI': ['bri'],
  'Bank Mandiri': ['mandiri'],
  'Cash': ['cash', 'tunai', 'kas'],
}

const INCOME_KEYWORDS = ['dapat', 'terima', 'masuk', 'gaji', 'honor', 'bonus', 'transfer masuk']
const EXPENSE_KEYWORDS = ['beli', 'bayar', 'buat', 'untuk', 'habis', 'keluar', 'spend']
const TRANSFER_KEYWORDS = ['transfer', 'kirim', 'pindah', 'tf']

export function parseTransaction(text: string): ParsedTransaction {
  const lower = text.toLowerCase().trim()
  
  // Extract intent
  let intent: 'expense' | 'income' | 'transfer' = 'expense'
  let intentConf = 0.7
  
  for (const kw of INCOME_KEYWORDS) {
    if (lower.includes(kw)) { intent = 'income'; intentConf = 0.95; break }
  }
  for (const kw of TRANSFER_KEYWORDS) {
    if (lower.includes(kw)) { intent = 'transfer'; intentConf = 0.9; break }
  }
  for (const kw of EXPENSE_KEYWORDS) {
    if (lower.includes(kw)) { intent = 'expense'; intentConf = 0.95; break }
  }
  
  // Extract amount
  let amount = 0
  let amountConf = 0
  
  // Pattern: 15rb, 15k, 15ribu
  const rbMatch = lower.match(/(\d+)\s*(?:rb|ribu|k)/i)
  if (rbMatch) {
    amount = parseInt(rbMatch[1]) * 1000
    amountConf = 0.95
  }
  
  // Pattern: 1.5jt, 1jt, 1juta
  const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i)
  if (jtMatch) {
    amount = parseFloat(jtMatch[1].replace(',', '.')) * 1000000
    amountConf = 0.95
  }
  
  // Pattern: plain number 15000, 1500000
  if (amount === 0) {
    const numMatch = lower.match(/(\d{4,})/);
    if (numMatch) {
      amount = parseInt(numMatch[1])
      amountConf = 0.85
    }
  }
  
  // Extract category
  let category = 'Lainnya'
  let catConf = 0.5
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        category = cat
        catConf = 0.95
        break
      }
    }
    if (catConf > 0.5) break
  }
  
  if (intent === 'income' && category === 'Lainnya') {
    category = 'Pemasukan'
    catConf = 0.8
  }
  
  // Extract wallet
  let wallet: string | null = null
  for (const [w, keywords] of Object.entries(WALLET_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        wallet = w
        break
      }
    }
    if (wallet) break
  }
  
  // Calculate confidence
  const confidence = (intentConf * 0.3) + (amountConf * 0.4) + (catConf * 0.3)
  
  return {
    intent,
    amount,
    category,
    wallet,
    description: text,
    confidence: Math.round(confidence * 100) / 100
  }
}
