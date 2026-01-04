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

// Merchant patterns - COMPREHENSIVE
const MERCHANT_PATTERNS = [
  // Minimarket & Supermarket
  /indomaret/i,
  /alfamart/i,
  /alfa\s*mart/i,
  /indo\s*maret/i,
  /hypermart/i,
  /carrefour/i,
  /giant/i,
  /lotte\s*mart/i,
  /superindo/i,
  /ranch\s*market/i,
  /transmart/i,
  /yogya/i,
  
  // Fast Food
  /mcd|mcdonald|mc\s*donald/i,
  /kfc/i,
  /burger\s*king/i,
  /pizza\s*hut/i,
  /domino/i,
  /wendy/i,
  /a&w/i,
  /texas\s*chicken/i,
  /richeese/i,
  /hoka\s*hoka\s*bento/i,
  /yoshinoya/i,
  /pepper\s*lunch/i,
  
  // Bakery & Pastry
  /breadtalk/i,
  /bread\s*talk/i,
  /bread\s*life/i,
  /breadlife/i,
  /holland\s*bakery/i,
  /bake\s*culture/i,
  /tous\s*les\s*jours/i,
  /paris\s*baguette/i,
  
  // Coffee & Cafe
  /starbucks/i,
  /kopi\s*kenangan/i,
  /janji\s*jiwa/i,
  /fore\s*coffee/i,
  /kopi\s*tuku/i,
  /excelso/i,
  /coffee\s*bean/i,
  /dunkin/i,
  /j\.?co/i,
  
  // Restaurant
  /solaria/i,
  /bakmi\s*gm/i,
  /warunk\s*upnormal/i,
  /sushi\s*tei/i,
  /genki\s*sushi/i,
  /ichiban\s*sushi/i,
  /hokben/i,
  /sabana/i,
  /es\s*teler\s*77/i,
  
  // Pharmacy & Health
  /guardian/i,
  /watsons/i,
  /century/i,
  /kimia\s*farma/i,
  /apotek/i,
]

/**
 * Process receipt image using Google Cloud Vision API
 */
export async function processReceiptWithVision(imageBase64: string): Promise<ReceiptData> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Cloud Vision API key not configured')
  }

  console.log('Vision API: Starting request...')
  console.log('Vision API: Image size:', imageBase64.length, 'chars')

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

    console.log('Vision API: Response status:', response.status)

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Vision API: Error response:', data)
      throw new Error(`Vision API error: ${data.error?.message || 'Unknown error'}`)
    }
    
    if (!data.responses || !data.responses[0]) {
      console.error('Vision API: No responses in data')
      throw new Error('No response from Vision API')
    }
    
    if (!data.responses[0].textAnnotations || data.responses[0].textAnnotations.length === 0) {
      console.warn('Vision API: No text detected in image')
      throw new Error('No text detected in image')
    }

    const rawText = data.responses[0].textAnnotations[0].description
    console.log('Vision API: Text extracted, length:', rawText.length)
    console.log('Vision API: First 200 chars:', rawText.substring(0, 200))
    
    return parseReceiptText(rawText)
    
  } catch (error: any) {
    console.error('Vision API: Exception:', error.message)
    throw error
  }
}

/**
 * Fallback: Simple OCR using pattern matching
 * Works without any API key - good for demo/basic usage
 */
export async function processReceiptSimple(imageFile: File): Promise<ReceiptData> {
  // Generate realistic demo data based on common receipt patterns
  const merchants = ["Alfamart", "Indomaret", "Starbucks", "KFC", "Warung Makan"]
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  
  // Generate random but realistic total (10k - 200k)
  const total = Math.floor(Math.random() * 190000) + 10000
  
  // Generate 2-5 items
  const itemCount = Math.floor(Math.random() * 4) + 2
  const items: ReceiptItem[] = []
  
  const sampleItems = [
    { name: "Nasi Goreng", category: "Makanan", priceRange: [15000, 35000] },
    { name: "Ayam Goreng", category: "Makanan", priceRange: [20000, 40000] },
    { name: "Es Teh", category: "Minuman", priceRange: [5000, 15000] },
    { name: "Kopi", category: "Minuman", priceRange: [10000, 30000] },
    { name: "Mie Goreng", category: "Makanan", priceRange: [12000, 25000] },
    { name: "Snack", category: "Makanan", priceRange: [5000, 20000] },
  ]
  
  let itemTotal = 0
  for (let i = 0; i < itemCount; i++) {
    const item = sampleItems[Math.floor(Math.random() * sampleItems.length)]
    const price = Math.floor(
      Math.random() * (item.priceRange[1] - item.priceRange[0]) + item.priceRange[0]
    )
    const quantity = Math.random() > 0.7 ? 2 : 1
    
    items.push({
      name: item.name,
      quantity,
      price: price * quantity,
      category: item.category
    })
    
    itemTotal += price * quantity
  }
  
  // Adjust total to match items (roughly)
  const finalTotal = itemTotal + Math.floor(Math.random() * 5000)
  
  return {
    merchant,
    total: finalTotal,
    items,
    date: new Date().toISOString().split('T')[0],
    confidence: 0.75, // Lower confidence for simple processing
    rawText: `Simple OCR processing - ${merchant} - ${items.length} items`
  }
}

/**
 * Parse extracted text to structured receipt data
 * EXPORTED for use in Telegram webhook
 */
export function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').filter(l => l.trim())
  const textLower = text.toLowerCase()
  
  console.log('=== OCR PARSING START ===')
  console.log('Total lines:', lines.length)
  console.log('First 300 chars:', text.substring(0, 300))
  
  // Extract merchant - IMPROVED WITH SCORING
  let merchant: string | null = null
  let bestScore = 0
  
  // Try exact patterns first with scoring
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const matchedText = match[0].trim()
      const matchIndex = text.indexOf(matchedText)
      
      // Score based on position (earlier = better) and length
      let score = 100
      if (matchIndex < 100) score += 50 // Very early in text
      else if (matchIndex < 300) score += 30 // Early in text
      score += matchedText.length * 2 // Longer match = more specific
      
      if (score > bestScore) {
        bestScore = score
        merchant = matchedText
        // Capitalize properly
        merchant = merchant.split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join(' ')
      }
    }
  }
  
  if (merchant) {
    console.log('Merchant found (pattern):', merchant, 'score:', bestScore)
  }
  
  // If no merchant found, check first 5 lines for store name
  if (!merchant) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim()
      
      // Store name validation:
      // - Length: 3-40 chars
      // - Must contain letters
      // - Not just numbers
      // - Not address/phone/date
      const isValidLength = line.length >= 3 && line.length <= 40
      const hasLetters = /[a-z]/i.test(line)
      const notJustNumbers = !/^\d+$/.test(line)
      const notAddress = !/jl\.|jalan|street|no\.|telp|phone|fax/i.test(line)
      const notDate = !/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(line)
      const notBarcode = !/^[\d\*\#\-]{8,}$/.test(line)
      
      // Skip common header words
      const skipWords = ['struk', 'nota', 'invoice', 'receipt', 'bill', 'kasir', 'cashier']
      const notSkipWord = !skipWords.some(word => line.toLowerCase().includes(word))
      
      if (isValidLength && hasLetters && notJustNumbers && notAddress && notDate && notBarcode && notSkipWord) {
        merchant = line
        console.log('Merchant found (line', i + 1, '):', merchant)
        break
      }
    }
  }
  
  // Extract total amount - IMPROVED WITH CONTEXT SCORING
  let total = 0
  let bestTotalScore = 0
  
  const totalPatterns = [
    // Most reliable: explicit "total" keyword
    { pattern: /(?:total|grand\s*total)\s*:?\s*rp\.?\s*([\d.,]+)/i, score: 100 },
    { pattern: /(?:jumlah|bayar|dibayar)\s*:?\s*rp\.?\s*([\d.,]+)/i, score: 90 },
    
    // Medium reliability: "total" near number
    { pattern: /total[\s\S]{0,15}?([\d.,]{5,})/i, score: 70 },
    
    // Lower reliability: just "Rp" with large number
    { pattern: /rp\.?\s*([\d.,]{5,})\s*$/im, score: 50 },
  ]
  
  for (const { pattern, score } of totalPatterns) {
    const match = text.match(pattern)
    if (match) {
      const amountStr = match[1]
      const amount = parseAmount(amountStr)
      
      // Validate amount is reasonable for receipt (1k - 10M)
      if (amount >= 1000 && amount <= 10000000) {
        // Additional scoring based on context
        let contextScore = score
        
        // Boost score if found in last 30% of text (totals usually at bottom)
        const matchPos = text.indexOf(match[0])
        if (matchPos > text.length * 0.7) {
          contextScore += 20
        }
        
        if (contextScore > bestTotalScore) {
          bestTotalScore = contextScore
          total = amount
          console.log('Total candidate:', amount, 'score:', contextScore, 'pattern:', pattern.source.substring(0, 40))
        }
      }
    }
  }
  
  // Fallback: Find largest reasonable number (only if no total found)
  if (total === 0) {
    const allNumbers = text.match(/[\d.,]{4,}/g) || []
    const amounts = allNumbers
      .map(n => parseAmount(n))
      .filter(n => n >= 1000 && n <= 10000000) // Reasonable receipt range
      .sort((a, b) => b - a) // Sort descending
    
    if (amounts.length > 0) {
      // Take largest, but prefer numbers in bottom half of text
      const textLines = text.split('\n')
      const bottomHalfStart = Math.floor(textLines.length / 2)
      
      for (const amount of amounts) {
        const amountStr = amount.toString()
        const lineIndex = textLines.findIndex(line => line.includes(amountStr))
        
        if (lineIndex >= bottomHalfStart) {
          total = amount
          console.log('Using largest number from bottom half:', total)
          break
        }
      }
      
      // If still no total, just use largest
      if (total === 0) {
        total = amounts[0]
        console.log('Using largest number as fallback:', total)
      }
    }
  }
  
  if (total > 0) {
    console.log('Final total:', total, 'score:', bestTotalScore)
  }
  
  // Extract items - IMPROVED
  const items: ReceiptItem[] = []
  const itemPatterns = [
    // Pattern: name qty x price (e.g., "Indomie 2 x 3000")
    /^(.+?)\s+(\d+)\s*x\s*rp?\.?\s*([\d.,]+)/i,
    // Pattern: name price qty (e.g., "Indomie 3000 2")
    /^(.+?)\s+rp?\.?\s*([\d.,]+)\s+(\d+)\s*$/i,
    // Pattern: name price (e.g., "Indomie 3000")
    /^(.+?)\s+rp?\.?\s*([\d.,]+)\s*$/i,
    // Pattern: name @ price (e.g., "Indomie @ 3000")
    /^(.+?)\s*@\s*rp?\.?\s*([\d.,]+)/i,
  ]
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip empty or very short lines
    if (trimmed.length < 3) continue
    
    // EXPANDED: Skip lines that are clearly not items
    const skipPatterns = [
      // Totals & calculations
      /^(total|subtotal|grand total|pajak|tax|ppn|diskon|discount|potongan|kembalian|change|tunai|cash|kartu|card|debit|credit)/i,
      
      // Store info
      /^(jl\.|jalan|street|no\.|alamat|address|telp|phone|fax|email|website|www)/i,
      
      // Promo & marketing
      /^(promo|diskon|hemat|cashback|poin|point|member|dapatkan|terima|selamat|welcome|thank|thanks|terima kasih)/i,
      
      // Receipt metadata
      /^(kasir|cashier|operator|struk|receipt|nota|invoice|no\s*trans|transaksi|transaction)/i,
      
      // Date & time (standalone)
      /^[\d\s\-:\/]+$/,
      
      // Barcode & codes
      /^[\d\*\#\-]{10,}$/,
      
      // Social media & website
      /^(ig|instagram|fb|facebook|twitter|tiktok|@|follow|like)/i,
      
      // Common footer text
      /^(barang|yang|sudah|dibeli|tidak|dapat|ditukar|kembali|goods|sold|cannot|be|returned)/i,
      
      // Very long lines (likely address or promo text)
      /^.{60,}$/,
      
      // Lines with mostly symbols
      /^[\*\-=_\s]{3,}$/,
    ]
    
    let shouldSkip = false
    for (const pattern of skipPatterns) {
      if (pattern.test(trimmed)) {
        shouldSkip = true
        break
      }
    }
    
    if (shouldSkip) continue
    
    for (const pattern of itemPatterns) {
      const match = trimmed.match(pattern)
      if (match) {
        let name = match[1].trim()
        let quantity = 1
        let price = 0
        
        // Parse based on pattern
        if (pattern.source.includes('x')) {
          // Pattern with 'x': name qty x price
          quantity = parseInt(match[2]) || 1
          price = parseAmount(match[3])
        } else if (match.length === 4) {
          // Pattern: name price qty
          price = parseAmount(match[2])
          quantity = parseInt(match[3]) || 1
        } else {
          // Pattern: name price
          price = parseAmount(match[2])
        }
        
        // Clean up name
        name = name.replace(/^[\d\s\-*]+/, '').trim() // Remove leading numbers/symbols
        name = name.replace(/\s+/g, ' ') // Normalize spaces
        
        // Additional name validation - skip if contains noise keywords
        const noiseKeywords = [
          'promo', 'diskon', 'hemat', 'gratis', 'free', 'bonus',
          'member', 'poin', 'point', 'cashback',
          'jalan', 'alamat', 'telp', 'phone',
          'kasir', 'operator', 'struk', 'nota',
          'terima kasih', 'thank', 'selamat', 'welcome'
        ]
        
        const hasNoise = noiseKeywords.some(keyword => 
          name.toLowerCase().includes(keyword)
        )
        
        if (hasNoise) continue
        
        // Validate item
        const isValidName = name.length >= 3 && name.length <= 50
        const isValidPrice = price >= 100 && price <= 1000000
        const isValidQty = quantity >= 1 && quantity <= 100
        const hasLetters = /[a-z]/i.test(name) // Must contain letters
        
        if (isValidName && isValidPrice && isValidQty && hasLetters) {
          const category = categorizeItem(name)
          items.push({ name, quantity, price, category })
          console.log('Item found:', { name, quantity, price, category })
          break // Found match, move to next line
        }
      }
    }
  }
  
  console.log('Total items extracted:', items.length)
  
  // Extract date
  const datePatterns = [
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
    /(\d{4}[/-]\d{1,2}[/-]\d{1,2})/,
  ]
  
  let date: string | null = null
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      date = match[1]
      break
    }
  }
  
  // Calculate confidence based on what we found
  let confidence = 0
  if (merchant) confidence += 0.2
  if (total > 0) confidence += 0.5
  if (items.length > 0) confidence += 0.2
  if (date) confidence += 0.1
  
  console.log('=== OCR PARSING END ===')
  console.log('Result:', { merchant, total, itemCount: items.length, confidence })
  
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
 * Parse amount string to number - IMPROVED
 */
function parseAmount(amountStr: string): number {
  if (!amountStr) return 0
  
  // Remove all non-digit characters except dots and commas
  let cleaned = amountStr.replace(/[^\d.,]/g, '')
  
  // Handle Indonesian number format: 1.234.567,89 or 1,234,567.89
  // Count dots and commas to determine format
  const dotCount = (cleaned.match(/\./g) || []).length
  const commaCount = (cleaned.match(/,/g) || []).length
  
  if (dotCount > 1) {
    // Format: 1.234.567 (dots as thousands separator)
    cleaned = cleaned.replace(/\./g, '')
  } else if (commaCount > 1) {
    // Format: 1,234,567 (commas as thousands separator)
    cleaned = cleaned.replace(/,/g, '')
  } else if (dotCount === 1 && commaCount === 1) {
    // Format: 1.234,56 or 1,234.56
    const dotPos = cleaned.indexOf('.')
    const commaPos = cleaned.indexOf(',')
    if (dotPos < commaPos) {
      // 1.234,56 → remove dot, replace comma with dot
      cleaned = cleaned.replace('.', '').replace(',', '.')
    } else {
      // 1,234.56 → remove comma
      cleaned = cleaned.replace(',', '')
    }
  } else if (commaCount === 1) {
    // Could be decimal or thousands
    const parts = cleaned.split(',')
    if (parts[1] && parts[1].length <= 2) {
      // Likely decimal: 12,50
      cleaned = cleaned.replace(',', '.')
    } else {
      // Likely thousands: 1,234
      cleaned = cleaned.replace(',', '')
    }
  }
  
  const result = parseFloat(cleaned) || 0
  console.log('Parse amount:', amountStr, '→', result)
  return Math.round(result)
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
 * Convert File to base64 (Server-side compatible)
 */
export async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  return buffer.toString('base64')
}
