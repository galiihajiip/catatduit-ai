import { NextRequest, NextResponse } from 'next/server'
import { fileToBase64, processReceipt, type ProcessedReceipt } from '@/lib/ocr'
import { parseTransaction } from '@/lib/nlp'
import { getSupabaseConfigError, isSupabaseFetchError, isSupabasePlaceholder } from '@/lib/supabase-config'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const supabase = createSupabaseServerClient()

interface UserRow {
  id: string
}

interface WalletRow {
  id: string
  name: string
  balance: number
}

interface CategoryRow {
  id: string
  name: string
}

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024
const CATEGORY_FALLBACKS: Record<string, string[]> = {
  Makanan: ['Makanan', 'Konsumsi', 'Belanja', 'Lainnya'],
  Konsumsi: ['Makanan', 'Konsumsi', 'Belanja', 'Lainnya'],
  Transportasi: ['Transportasi', 'Lainnya'],
  Tagihan: ['Tagihan', 'Lainnya'],
  'Keperluan Rumah Tangga': ['Keperluan Rumah Tangga', 'Belanja', 'Lainnya'],
  Belanja: ['Belanja', 'Lainnya'],
  Hiburan: ['Hiburan', 'Lainnya'],
  Kesehatan: ['Kesehatan', 'Lainnya'],
  Pemasukan: ['Pemasukan', 'Lainnya'],
  Lainnya: ['Lainnya'],
}

function jsonError(message: string, detail: string, status = 500) {
  return NextResponse.json({ error: message, detail }, { status })
}

function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'File harus berupa gambar struk'
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return 'Ukuran gambar maksimal 8MB'
  }

  return null
}

function buildReceiptPayload(receipt: ProcessedReceipt) {
  return {
    merchant: receipt.merchant,
    total: receipt.total,
    items_count: receipt.items.length,
    items: receipt.items,
    date: receipt.date,
    confidence: receipt.confidence,
    raw_text: receipt.rawText,
  }
}

async function getOrCreateUser(userId: string): Promise<UserRow> {
  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', userId)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existingUser) return existingUser

  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      telegram_id: userId,
      name: 'Demo User',
      is_pro: false,
    })
    .select('id')
    .single()

  if (createError) throw createError
  if (!newUser) throw new Error('Gagal membuat user baru')

  return newUser
}

async function getOrCreateWallet(userId: string): Promise<WalletRow> {
  const { data: existingWallet, error: lookupError } = await supabase
    .from('wallets')
    .select('id, name, balance')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existingWallet) return existingWallet

  const { data: newWallet, error: createError } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      name: 'Cash',
      balance: 0,
      color_hex: '#16A085',
      icon: 'wallet',
    })
    .select('id, name, balance')
    .single()

  if (createError) throw createError
  if (!newWallet) throw new Error('Gagal membuat wallet default')

  return newWallet
}

async function findCategory(categoryName: string): Promise<CategoryRow | null> {
  const candidates = CATEGORY_FALLBACKS[categoryName] ?? [categoryName, 'Lainnya']

  for (const name of candidates) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', name)
      .eq('type', 'expense')
      .maybeSingle()

    if (error) throw error
    if (data) return data
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = formData.get('user_id') ?? formData.get('telegram_id')

    if (!(file instanceof File) || typeof userId !== 'string' || !userId.trim()) {
      return jsonError('Invalid request', 'File dan user_id wajib dikirim', 400)
    }

    const imageError = validateImage(file)
    if (imageError) {
      return jsonError('Invalid image', imageError, 400)
    }

    const commitFlag = String(formData.get('commit') ?? '').toLowerCase() === 'true'
    const overrideTotalRaw = formData.get('override_total')
    const overrideMerchantRaw = formData.get('override_merchant')
    const overrideTotal =
      typeof overrideTotalRaw === 'string' && overrideTotalRaw.trim().length > 0
        ? Math.round(Number.parseFloat(overrideTotalRaw))
        : null
    const overrideMerchant =
      typeof overrideMerchantRaw === 'string' ? overrideMerchantRaw.trim() : ''

    const base64 = await fileToBase64(file)
    let receipt: ProcessedReceipt
    try {
      receipt = await processReceipt(base64)
    } catch (ocrError) {
      const detail = ocrError instanceof Error ? ocrError.message : 'OCR lokal gagal memproses gambar'
      return jsonError(
        'Gagal menjalankan OCR lokal',
        /fetch failed/i.test(detail)
          ? 'Tesseract lokal gagal memuat engine atau data bahasa. Pastikan koneksi internet tersedia untuk proses pertama, lalu restart npm run dev dan coba lagi.'
          : detail,
        503
      )
    }

    const effectiveMerchant = overrideMerchant || receipt.merchant
    const effectiveTotal =
      overrideTotal && Number.isFinite(overrideTotal) && overrideTotal > 0
        ? overrideTotal
        : receipt.total

    const parsed = parseTransaction(
      [
        effectiveMerchant,
        receipt.rawText,
        receipt.items.map((item) => item.name).join(' '),
      ]
        .filter(Boolean)
        .join('\n'),
      effectiveTotal
    )

    const previewPayload = {
      success: true,
      preview: true,
      ocr_engine: receipt.ocrEngine,
      receipt_data: {
        ...buildReceiptPayload(receipt),
        merchant: effectiveMerchant,
        total: effectiveTotal,
      },
      parsed_transaction: parsed,
    }

    if (!commitFlag) {
      if (effectiveTotal <= 0) {
        return NextResponse.json({
          ...previewPayload,
          message:
            'Foto berhasil dibaca OCR. Cek dan koreksi total/merchant sebelum disimpan.',
        })
      }
      return NextResponse.json(previewPayload)
    }

    if (effectiveTotal <= 0) {
      return jsonError(
        'Total belum terisi',
        'Isi total belanja terlebih dahulu sebelum disimpan ke catatan.',
        400
      )
    }

    if (isSupabasePlaceholder()) {
      return NextResponse.json({
        success: true,
        demo_mode: true,
        message: getSupabaseConfigError(),
        ocr_engine: receipt.ocrEngine,
        receipt_data: { ...buildReceiptPayload(receipt), merchant: effectiveMerchant, total: effectiveTotal },
        parsed_transaction: parsed,
      })
    }

    try {
      const user = await getOrCreateUser(userId.trim())
      const wallet = await getOrCreateWallet(user.id)
      const category = await findCategory(parsed.category)

      const description = `Belanja di ${effectiveMerchant || 'Toko'}`

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          category_id: category?.id ?? null,
          type: parsed.intent === 'income' ? 'income' : 'expense',
          amount: effectiveTotal,
          description,
          raw_input: receipt.rawText,
          ai_confidence: Math.max(receipt.confidence, parsed.confidence),
        })
        .select('id, amount, description')
        .single()

      if (transactionError) throw transactionError
      if (!transaction) throw new Error('Transaksi gagal dibuat')

      const newBalance =
        parsed.intent === 'income'
          ? Number(wallet.balance) + effectiveTotal
          : Number(wallet.balance) - effectiveTotal

      const { error: balanceError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id)

      if (balanceError) throw balanceError

      return NextResponse.json({
        success: true,
        committed: true,
        message: 'Transaksi disimpan dari struk',
        ocr_engine: receipt.ocrEngine,
        receipt_data: { ...buildReceiptPayload(receipt), merchant: effectiveMerchant, total: effectiveTotal },
        parsed_transaction: parsed,
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          description: transaction.description,
          category: category?.name ?? null,
          wallet: wallet.name,
          new_balance: newBalance,
        },
      })
    } catch (databaseError) {
      if (!isSupabaseFetchError(databaseError)) throw databaseError

      console.error('OCR save-to-Supabase error:', databaseError)
      return NextResponse.json({
        success: true,
        demo_mode: true,
        message:
          'Struk berhasil dibaca dengan OCR lokal Tesseract, tetapi belum tersimpan karena koneksi Supabase gagal. Periksa internet atau konfigurasi Supabase.',
        ocr_engine: receipt.ocrEngine,
        receipt_data: buildReceiptPayload(receipt),
        parsed_transaction: parsed,
      })
    }
  } catch (error) {
    console.error('OCR scan-receipt error:', error)

    if (isSupabaseFetchError(error)) {
      return jsonError(
        'Gagal menyimpan ke Supabase',
        'OCR lokal sudah tidak memakai Google Vision, tetapi aplikasi tidak bisa terhubung ke Supabase untuk menyimpan transaksi. Periksa internet, NEXT_PUBLIC_SUPABASE_URL, dan SUPABASE_SERVICE_KEY.',
        503
      )
    }

    const detail = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses struk'
    return jsonError('Gagal memproses struk', detail, 500)
  }
}
