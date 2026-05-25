import { NextRequest, NextResponse } from 'next/server'
import { fileToBase64, processReceipt, type ProcessedReceipt } from '@/lib/ocr'
import { parseTransaction } from '@/lib/nlp'
import { supabase } from '@/lib/supabase'
import { getSupabaseConfigError, isSupabaseFetchError, isSupabasePlaceholder } from '@/lib/supabase-config'

export const runtime = 'nodejs'

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

    if (isSupabasePlaceholder()) {
      return jsonError('Database belum dikonfigurasi', getSupabaseConfigError(), 503)
    }

    const base64 = await fileToBase64(file)
    const receipt = await processReceipt(base64)

    if (receipt.total <= 0) {
      return jsonError('Gagal membaca total struk', 'Total harga tidak ditemukan dari hasil OCR', 422)
    }

    const parsed = parseTransaction(
      [
        receipt.merchant,
        receipt.rawText,
        receipt.items.map((item) => item.name).join(' '),
      ]
        .filter(Boolean)
        .join('\n'),
      receipt.total
    )

    const user = await getOrCreateUser(userId.trim())
    const wallet = await getOrCreateWallet(user.id)
    const category = await findCategory(parsed.category)

    const description = `Belanja di ${receipt.merchant || 'Toko'}${
      receipt.items.length > 0 ? ` - ${receipt.items.length} item` : ''
    }`

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        category_id: category?.id ?? null,
        type: parsed.intent === 'income' ? 'income' : 'expense',
        amount: receipt.total,
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
        ? Number(wallet.balance) + receipt.total
        : Number(wallet.balance) - receipt.total

    const { error: balanceError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', wallet.id)

    if (balanceError) throw balanceError

    return NextResponse.json({
      success: true,
      message: 'Receipt processed successfully',
      ocr_engine: receipt.ocrEngine,
      receipt_data: buildReceiptPayload(receipt),
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
  } catch (error) {
    console.error('OCR scan-receipt error:', error)

    if (isSupabaseFetchError(error)) {
      return jsonError(
        'Gagal menyimpan ke Supabase',
        'Tidak bisa terhubung ke Supabase. Periksa NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_KEY di .env.local.',
        503
      )
    }

    const detail = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses struk'
    return jsonError('Gagal memproses struk', detail, 500)
  }
}
