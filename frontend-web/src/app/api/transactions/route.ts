import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatApiError, withNetworkRetry } from '@/lib/api-errors'
import { parseTransaction, type TransactionIntent } from '@/lib/nlp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

const isConfigured = !!(supabaseUrl && supabaseKey)

if (!isConfigured) {
  console.warn('Missing Supabase credentials - API will return empty data')
}

// Create client with fallback
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

const CATEGORY_FALLBACKS: Record<string, string[]> = {
  Makanan: ['Makanan', 'Belanja', 'Lainnya'],
  Transportasi: ['Transportasi', 'Lainnya'],
  Tagihan: ['Tagihan', 'Lainnya'],
  'Keperluan Rumah Tangga': ['Keperluan Rumah Tangga', 'Belanja', 'Lainnya'],
  Belanja: ['Belanja', 'Lainnya'],
  Hiburan: ['Hiburan', 'Lainnya'],
  Kesehatan: ['Kesehatan', 'Lainnya'],
  Pemasukan: ['Pemasukan', 'Gaji', 'Lainnya'],
  Lainnya: ['Lainnya'],
}

async function getOrCreateUser(userKey: string) {
  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', userKey)
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existingUser) return existingUser

  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      telegram_id: userKey,
      name: 'Demo User',
      is_pro: false,
    })
    .select('id')
    .single()

  if (createError) throw createError
  if (!newUser) throw new Error('Gagal membuat user')
  return newUser
}

async function getWallet(userUuid: string, walletName: string | null) {
  if (walletName) {
    const { data: namedWallet, error: namedError } = await supabase
      .from('wallets')
      .select('id, name, balance')
      .eq('user_id', userUuid)
      .ilike('name', walletName)
      .maybeSingle()

    if (namedError) throw namedError
    if (namedWallet) return namedWallet
  }

  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('id, name, balance')
    .eq('user_id', userUuid)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (wallet) return wallet

  const { data: newWallet, error: createError } = await supabase
    .from('wallets')
    .insert({
      user_id: userUuid,
      name: 'Cash',
      balance: 0,
      color_hex: '#16A085',
      icon: 'wallet',
    })
    .select('id, name, balance')
    .single()

  if (createError) throw createError
  if (!newWallet) throw new Error('Gagal membuat wallet')
  return newWallet
}

async function findCategory(categoryName: string, intent: TransactionIntent) {
  if (intent === 'transfer') return null

  const type = intent === 'income' ? 'income' : 'expense'
  const candidates = CATEGORY_FALLBACKS[categoryName] ?? [categoryName, 'Lainnya']

  for (const name of candidates) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', name)
      .eq('type', type)
      .maybeSingle()

    if (error) throw error
    if (data) return data
  }

  return null
}

function nextBalance(currentBalance: number, intent: TransactionIntent, amount: number): number {
  if (intent === 'income') return currentBalance + amount
  if (intent === 'expense') return currentBalance - amount
  return currentBalance
}

export async function GET(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.json({ transactions: [] })
  }
  
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id') || searchParams.get('telegram_id')
  
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }
  
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', userId)
    .single()
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  // Get transactions with category
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      category:categories(name, color_hex, icon),
      wallet:wallets(name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)
  
  return NextResponse.json({ transactions: transactions || [] })
}

export async function POST(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const userId = String(body.user_id || body.telegram_id || '').trim()
    const text = String(body.text || '').trim()

    if (!userId || !text) {
      return NextResponse.json({ error: 'user_id and text required' }, { status: 400 })
    }

    const parsed = parseTransaction(text)
    if (!parsed.amount || parsed.amount <= 0) {
      return NextResponse.json({
        error: 'Nominal tidak terdeteksi',
        detail: 'Contoh: "beli bakso 15rb cash" atau "gajian 5jt"',
        parsed,
      }, { status: 422 })
    }

    const { wallet, transaction, newBalance } = await withNetworkRetry(async () => {
      const resolvedUser = await getOrCreateUser(userId)
      const resolvedWallet = await getWallet(resolvedUser.id, parsed.wallet)
      const resolvedCategory = await findCategory(parsed.category, parsed.intent)

      const { data: inserted, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: resolvedUser.id,
          wallet_id: resolvedWallet.id,
          category_id: resolvedCategory?.id ?? null,
          type: parsed.intent,
          amount: parsed.amount,
          description: parsed.description,
          raw_input: text,
          ai_confidence: parsed.confidence,
        })
        .select(`
          *,
          category:categories(name, color_hex, icon),
          wallet:wallets(name)
        `)
        .single()

      if (transactionError) throw transactionError
      if (!inserted) throw new Error('Transaksi gagal dibuat')

      const balance = nextBalance(Number(resolvedWallet.balance), parsed.intent, parsed.amount)
      if (balance !== Number(resolvedWallet.balance)) {
        const { error: balanceError } = await supabase
          .from('wallets')
          .update({ balance })
          .eq('id', resolvedWallet.id)

        if (balanceError) throw balanceError
      }

      return {
        user: resolvedUser,
        wallet: resolvedWallet,
        category: resolvedCategory,
        transaction: inserted,
        newBalance: balance,
      }
    })

    return NextResponse.json({
      success: true,
      parsed,
      transaction,
      wallet: {
        id: wallet.id,
        name: wallet.name,
        new_balance: newBalance,
      },
    })
  } catch (error) {
    console.error('Create NLP transaction error:', error)
    return NextResponse.json({
      error: 'Gagal mencatat transaksi',
      detail: formatApiError(error),
    }, { status: 500 })
  }
}
