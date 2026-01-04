/**
 * OCR Processing using Google Cloud Vision API
 * This runs serverless on Vercel without needing Python backend
 */

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  category: string
}

interface ReceiptData {
  merchant: string | null
  total: number
  items: ReceiptItem[]
  date: string | null
  confidence: number
  rawText: string
}

// Category keywords for auto-categorization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Makanan": ["nasi", "mie", "roti", "kue", "snack", "ayam", "sate", "bakso", "gorengan"],
  "Minuman": ["kopi", "teh", "jus", "air", "susu", "minuman", "es"],
  "Keperluan Rumah Tangga": ["sabun", "detergen", "shampo", "tissue", "pasta gigi"],
  "Belanja": ["baju", "celana", "sepatu", "tas"],
}

// Merchant patterns
const MERCHANT_PATTERNS = [
  /alfamart/i,
  /indomaret/i,
  /hypermart/i,
  /carrefour/i,
  /giant/i,
  /mcd|mcdonald/i,
  /kfc/i,
  /burger king/i,
  /starbucks/i,
  /kopi kenangan/i,
]

/**
 * Process receipt image using Google Cloud Vision API
 */
export async function processReceiptWithVision(imageBase64: string): Promise<ReceiptData> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Cloud Vision API key not configured')
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        })
      }
    )

    const data = await response.json()
    
    if (!data.responses || !data.responses[0].textAnnotations) {
      throw new Error('No text detected in image')
    }

    const rawText = data.responses[0].textAnnotations[0].description
    return parseReceiptText(rawText)
    
  } catch (error) {
    console.error('Vision API error:', error)
    throw error
  }
}

/**
 * Fallback: Simple OCR using browser-based text extraction
 * This is a basic implementation for demo/fallback
 */
export async function processReceiptSimple(imageFile: File): Promise<ReceiptData> {
  // For production, this would use a simpler pattern matching
  // For now, return a demo response
  return {
    merchant: "Demo Store",
    total: 50000,
    items: [
      { name: "Item 1", quantity: 1, price: 25000, category: "Makanan" },
      { name: "Item 2", quantity: 1, price: 25000, category: "Minuman" }
    ],
    date: new Date().toISOString().split('T')[0],
    confidence: 0.75,
    rawText: "Demo receipt processing"
  }
}

/**
 * Parse extracted text to structured receipt data
 */
function parseReceiptText(text: string): ReceiptData {
  const lines = text.toLowerCase().split('\n').filter(l => l.trim())
  
  // Extract merchant
  let merchant: string | null = null
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      merchant = match[0]
      break
    }
  }
  
  // Extract total amount
  let total = 0
  const totalPatterns = [
    /total\s*:?\s*rp\.?\s*([\d.,]+)/i,
    /grand total\s*:?\s*rp\.?\s*([\d.,]+)/i,
    /jumlah\s*:?\s*rp\.?\s*([\d.,]+)/i,
    /bayar\s*:?\s*rp\.?\s*([\d.,]+)/i,
  ]
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern)
    if (match) {
      total = parseAmount(match[1])
      break
    }
  }
  
  // If no total found, find largest number
  if (total === 0) {
    const numbers = text.match(/\d{4,}/g)
    if (numbers) {
      total = Math.max(...numbers.map(n => parseInt(n)))
    }
  }
  
  // Extract items (basic implementation)
  const items: ReceiptItem[] = []
  const itemPattern = /(.+?)\s+(\d+)\s*x?\s*rp\.?\s*([\d.,]+)/i
  
  for (const line of lines) {
    const match = line.match(itemPattern)
    if (match) {
      const name = match[1].trim()
      const quantity = parseInt(match[2])
      const price = parseAmount(match[3])
      const category = categorizeItem(name)
      
      items.push({ name, quantity, price, category })
    }
  }
  
  // Extract date
  const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/)
  const date = dateMatch ? dateMatch[1] : null
  
  // Calculate confidence
  let confidence = 0
  if (merchant) confidence += 0.3
  if (total > 0) confidence += 0.4
  if (items.length > 0) confidence += 0.3
  
  return {
    merchant,
    total,
    items,
    date,
    confidence: Math.round(confidence * 100) / 100,
    rawText: text
  }
}

/**
 * Parse amount string to number
 */
function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[.,]/g, '')
  return parseInt(cleaned) || 0
}

/**
 * Categorize item based on name
 */
function categorizeItem(itemName: string): string {
  const lower = itemName.toLowerCase()
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category
      }
    }
  }
  
  return "Lainnya"
}

/**
 * Convert File to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
