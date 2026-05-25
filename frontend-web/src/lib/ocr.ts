import { categorizeTransactionText } from './nlp'

export interface ReceiptItem {
  name: string
  quantity: number
  price: number
  category: string
}

export interface ReceiptData {
  merchant: string | null
  total: number
  items: ReceiptItem[]
  date: string | null
  confidence: number
  rawText: string
}

export interface ProcessedReceipt extends ReceiptData {
  ocrEngine: 'tesseract'
}

const MERCHANT_PATTERNS = [
  /indomaret/i,
  /alfamart/i,
  /alfa\s*mart/i,
  /indo\s*maret/i,
  /hypermart/i,
  /carrefour/i,
  /superindo/i,
  /transmart/i,
  /yogya/i,
  /bread\s*talk|breadtalk/i,
  /holland\s*bakery/i,
  /starbucks/i,
  /kopi\s*kenangan/i,
  /janji\s*jiwa/i,
  /fore\s*coffee/i,
  /mcd|mcdonald|mc\s*donald/i,
  /kfc/i,
  /burger\s*king/i,
  /pizza\s*hut/i,
  /solaria/i,
  /hokben|hoka\s*hoka\s*bento/i,
  /guardian/i,
  /watsons/i,
  /kimia\s*farma/i,
  /apotek/i,
]

const TOTAL_PATTERNS: Array<{ pattern: RegExp; score: number }> = [
  { pattern: /(?:grand\s*total|total\s*akhir|total)\s*:?\s*(?:rp\.?\s*)?([\d.,]+)/i, score: 100 },
  { pattern: /(?:jumlah|bayar|dibayar|total\s*bayar)\s*:?\s*(?:rp\.?\s*)?([\d.,]+)/i, score: 90 },
  { pattern: /(?:subtotal|sub\s*total)\s*:?\s*(?:rp\.?\s*)?([\d.,]+)/i, score: 60 },
]

const SKIP_ITEM_LINE_PATTERNS = [
  /^(total|sub\s*total|subtotal|grand total|pajak|tax|ppn|diskon|discount|potongan|kembalian|change|tunai|cash|kartu|debit|credit)/i,
  /^(bayar|dibayar|payment|paid|saldo|metode|uang|kembali|kembalian)(\s|\(|:|$)/i,
  /^(token|no\.?\s*meter|idpel|id\s*pel|pln|stroom|jml\s*kwh|kwh)(\s|:|$)/i,
  /\b(jml\s*kwh|kwh|no\.?\s*meter|idpel|id\s*pel)\b/i,
  /^(jl\.|jalan|street|alamat|address|telp|phone|fax|email|website|www)/i,
  /^(kasir|cashier|operator|struk|receipt|nota|invoice|no\s*trans|transaksi|transaction|check no)/i,
  /^(promo|hemat|cashback|member|poin|point|terima kasih|thank|thanks|welcome)/i,
  /^[\d\s\-:\/.]+$/,
  /^[\d*#-]{8,}$/,
  /^[*\-=_\s]{3,}$/,
]

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function parseAmount(value: string): number {
  const raw = value.replace(/[^\d.,]/g, '')
  if (!raw) return 0

  let normalized = raw
  const dotCount = (raw.match(/\./g) ?? []).length
  const commaCount = (raw.match(/,/g) ?? []).length

  if (dotCount > 1 && commaCount === 0) {
    normalized = raw.replace(/\./g, '')
  } else if (commaCount > 1 && dotCount === 0) {
    normalized = raw.replace(/,/g, '')
  } else if (dotCount > 0 && commaCount > 0) {
    const lastDot = raw.lastIndexOf('.')
    const lastComma = raw.lastIndexOf(',')
    normalized =
      lastComma > lastDot
        ? raw.replace(/\./g, '').replace(',', '.')
        : raw.replace(/,/g, '')
  } else if (commaCount === 1) {
    const [, decimalPart] = raw.split(',')
    normalized = decimalPart.length <= 2 ? raw.replace(',', '.') : raw.replace(',', '')
  } else if (dotCount === 1) {
    const [, decimalPart] = raw.split('.')
    normalized = decimalPart.length === 3 ? raw.replace('.', '') : raw
  }

  return Math.round(Number.parseFloat(normalized) || 0)
}

function extractMerchant(text: string, lines: string[]): string | null {
  let merchant: string | null = null
  let bestScore = 0

  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern)
    if (!match) continue

    const value = match[0].trim()
    const index = text.toLowerCase().indexOf(value.toLowerCase())
    const score = 100 + (index < 120 ? 50 : 0) + value.length

    if (score > bestScore) {
      bestScore = score
      merchant = toTitleCase(value)
    }
  }

  if (merchant) return merchant

  for (const line of lines.slice(0, 6)) {
    const isStoreLike =
      line.length >= 3 &&
      line.length <= 45 &&
      /[a-z]/i.test(line) &&
      !/^(struk|nota|invoice|receipt|kasir|cashier)$/i.test(line) &&
      !/^(jl\.|jalan|alamat|telp|phone|fax|no\.)/i.test(line) &&
      !/^\d+$/.test(line)

    if (isStoreLike) return line
  }

  return null
}

function extractDate(text: string): string | null {
  const patterns = [
    /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/,
    /\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/,
    /\b(\d{1,2}\s+(?:jan|feb|mar|apr|mei|may|jun|jul|agu|aug|sep|okt|oct|nov|des|dec)[a-z]*\s+\d{2,4})\b/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }

  return null
}

function extractTotal(text: string, lines: string[]): number {
  let total = 0
  let bestScore = 0

  for (const { pattern, score } of TOTAL_PATTERNS) {
    const match = text.match(pattern)
    if (!match) continue

    const amount = parseAmount(match[1])
    if (amount < 100 || amount > 100_000_000) continue

    const index = text.indexOf(match[0])
    const positionBoost = index > text.length * 0.6 ? 20 : 0
    const currentScore = score + positionBoost

    if (currentScore > bestScore) {
      bestScore = currentScore
      total = amount
    }
  }

  if (total > 0) return total

  const bottomHalf = lines.slice(Math.floor(lines.length / 2)).join('\n')
  const amounts = (bottomHalf.match(/(?:rp\.?\s*)?[\d.,]{4,}/gi) ?? [])
    .map(parseAmount)
    .filter((amount) => amount >= 100 && amount <= 100_000_000)
    .sort((a, b) => b - a)

  return amounts[0] ?? 0
}

function isUtilityReceipt(text: string): boolean {
  return /\b(pln|token|stroom|kwh|idpel|id\s*pel|no\.?\s*meter|listrik|pdam|pulsa|internet|wifi|indihome)\b/i.test(text)
}

function syntheticUtilityItem(text: string, total: number): ReceiptItem {
  const category = categorizeTransactionText(text).category
  let name = 'Tagihan'

  if (/\b(pln|token|stroom|kwh|listrik)\b/i.test(text)) {
    name = 'Token Listrik'
  } else if (/\b(pdam|air)\b/i.test(text)) {
    name = 'Tagihan Air'
  } else if (/\b(pulsa)\b/i.test(text)) {
    name = 'Pulsa'
  } else if (/\b(internet|wifi|indihome)\b/i.test(text)) {
    name = 'Tagihan Internet'
  }

  return {
    name,
    quantity: 1,
    price: total,
    category,
  }
}

function extractItems(lines: string[], rawText: string, total: number): ReceiptItem[] {
  if (total > 0 && isUtilityReceipt(rawText)) {
    return [syntheticUtilityItem(rawText, total)]
  }

  const items: ReceiptItem[] = []
  let pendingName: string | null = null

  for (const line of lines) {
    if (line.length < 4 || line.length > 70) continue
    if (SKIP_ITEM_LINE_PATTERNS.some((pattern) => pattern.test(line))) continue

    const lineWithPendingName = pendingName ? `${pendingName} ${line}` : line
    const parsed = parseItemLine(lineWithPendingName) ?? parseItemLine(line)

    if (parsed) {
      items.push({
        ...parsed,
        category: categorizeTransactionText(parsed.name).category,
      })
      pendingName = null
      continue
    }

    if (isPotentialItemName(line)) {
      pendingName = line
    }
  }

  return items
}

function parseItemLine(line: string): Omit<ReceiptItem, 'category'> | null {
  const normalized = line.replace(/\s+/g, ' ').trim()

  const trailingPriceMatch = normalized.match(/^(.*?)\s+(?:rp\.?\s*)?([\d.,]{4,})$/i)
  if (!trailingPriceMatch) return null

  let namePart = trailingPriceMatch[1].trim()
  const price = parseAmount(trailingPriceMatch[2])
  if (price < 100 || price > 10_000_000) return null

  let quantity = 1

  const leadingQtyMatch = namePart.match(/^(\d{1,2})\s+(.+)$/)
  if (leadingQtyMatch) {
    quantity = Number.parseInt(leadingQtyMatch[1], 10) || 1
    namePart = leadingQtyMatch[2].trim()
  }

  const trailingQtyMatch = namePart.match(/^(.+?)\s+(\d{1,2})\s*x$/i)
  if (trailingQtyMatch) {
    namePart = trailingQtyMatch[1].trim()
    quantity = Number.parseInt(trailingQtyMatch[2], 10) || quantity
  } else {
    namePart = namePart.replace(/\s+x$/i, '').trim()
  }

  const name = cleanItemName(namePart)
  if (!isValidItemName(name) || quantity < 1 || quantity > 100) return null

  return { name, quantity, price }
}

function cleanItemName(name: string): string {
  return name
    .replace(/^[\d\s\-*.]+/, '')
    .replace(/\b(?:rp|idr)\b\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isValidItemName(name: string): boolean {
  if (name.length < 3 || name.length > 50 || !/[a-z]/i.test(name)) return false
  if (/^(x|pcs?|piece|buah|botol|btl|ml|ltr|liter|gr|gram|kg|lusin|dozen)$/i.test(name)) return false
  if (/\b(sub\s*total|total|bayar|dibayar|cash|tunai|debit|credit|kembalian|pajak|tax|ppn|token|kwh|idpel|id\s*pel|no\.?\s*meter)\b/i.test(name)) return false
  return true
}

function isPotentialItemName(line: string): boolean {
  const name = cleanItemName(line)
  if (!isValidItemName(name)) return false
  if (/\d{4,}/.test(name)) return false
  if (SKIP_ITEM_LINE_PATTERNS.some((pattern) => pattern.test(name))) return false
  return true
}

function calculateConfidence(receipt: Omit<ReceiptData, 'confidence'>): number {
  let confidence = 0
  if (receipt.merchant) confidence += 0.2
  if (receipt.date) confidence += 0.1
  if (receipt.total > 0) confidence += 0.5
  if (receipt.items.length > 0) confidence += 0.2
  return Math.round(confidence * 100) / 100
}

export function parseReceiptText(text: string): ReceiptData {
  const rawText = text.trim()
  if (!rawText) {
    throw new Error('Tidak ada teks yang bisa diproses dari gambar struk')
  }

  const lines = normalizeLines(rawText)
  const total = extractTotal(rawText, lines)
  const receiptWithoutConfidence = {
    merchant: extractMerchant(rawText, lines),
    total,
    items: extractItems(lines, rawText, total),
    date: extractDate(rawText),
    rawText,
  }

  return {
    ...receiptWithoutConfidence,
    confidence: calculateConfidence(receiptWithoutConfidence),
  }
}

type TesseractWorker = {
  recognize: (image: Buffer) => Promise<{ data: { text: string } }>
  terminate: () => Promise<void>
}

let workerPromise: Promise<TesseractWorker> | null = null

async function getTesseractWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const tesseract = await import('tesseract.js')
      const createWorker = (tesseract as unknown as {
        createWorker: (lang: string, oem?: number, options?: unknown) => Promise<TesseractWorker>
      }).createWorker
      console.log('Tesseract worker: initializing (one-time warm-up)')
      const worker = await createWorker('eng', 1, {
        logger: (info: { status?: string; progress?: number }) => {
          if (info?.status && info.status !== 'recognizing text') {
            console.log(`Tesseract worker: ${info.status}`)
          }
        },
      })
      console.log('Tesseract worker: ready')
      return worker
    })().catch((error) => {
      workerPromise = null
      throw error
    })
  }
  return workerPromise
}

export async function warmupTesseract(): Promise<void> {
  await getTesseractWorker()
}

export async function processReceiptWithTesseract(imageBase64: string): Promise<ReceiptData> {
  const buffer = Buffer.from(imageBase64, 'base64')

  try {
    const worker = await getTesseractWorker()
    const start = Date.now()
    const result = await worker.recognize(buffer)
    console.log(`Tesseract OCR done in ${Date.now() - start}ms`)

    const text = result.data.text?.trim()
    if (!text) {
      throw new Error('Tesseract tidak menemukan teks di gambar struk')
    }

    return parseReceiptText(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OCR lokal gagal memproses gambar'
    throw new Error(message)
  }
}

export async function processReceipt(imageBase64: string): Promise<ProcessedReceipt> {
  const receipt = await processReceiptWithTesseract(imageBase64)
  return {
    ...receipt,
    ocrEngine: 'tesseract',
  }
}

export async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  return Buffer.from(bytes).toString('base64')
}
