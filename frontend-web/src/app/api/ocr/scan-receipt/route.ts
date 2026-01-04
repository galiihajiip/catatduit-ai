import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processReceiptWithVision, processReceiptSimple, fileToBase64 } from '@/lib/ocr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const isConfigured = !!(supabaseUrl && supabaseKey)

const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseKey!)
  : null

export async function POST(request: NextRequest) {
  if (!isConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Service not configured' },
      { status: 503 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const telegramId = formData.get('telegram_id') as string

    if (!file || !telegramId) {
      return NextResponse.json(
        { error: 'File and telegram_id required' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const base64 = await fileToBase64(file)

    // Process with Google Vision API or fallback
    let receiptData
    try {
      receiptData = await processReceiptWithVision(base64)
    } catch (visionError) {
      console.warn('Vision API failed, using simple processing:', visionError)
      receiptData = await processReceiptSimple(file)
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create default wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          name: 'Cash',
          balance: 0,
          color_hex: '#16A085',
          icon: 'wallet'
        })
        .select()
        .single()
      wallet = newWallet
    }

    if (!wallet) {
      return NextResponse.json({ error: 'Failed to get wallet' }, { status: 500 })
    }

    // Get category
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Belanja')
      .single()

    // Create transaction
    if (receiptData.total > 0) {
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          category_id: category?.id,
          type: 'expense',
          amount: receiptData.total,
          description: `Belanja di ${receiptData.merchant || 'Toko'}${
            receiptData.items.length > 0 ? ` - ${receiptData.items.length} items` : ''
          }`,
          raw_input: `OCR: ${receiptData.rawText.substring(0, 100)}...`,
          ai_confidence: receiptData.confidence
        })
        .select()
        .single()

      if (txError) {
        console.error('Transaction error:', txError)
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
      }

      // Update wallet balance
      const newBalance = wallet.balance - receiptData.total
      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id)

      return NextResponse.json({
        success: true,
        message: 'Receipt processed successfully',
        receipt_data: {
          merchant: receiptData.merchant,
          total: receiptData.total,
          items_count: receiptData.items.length,
          items: receiptData.items,
          date: receiptData.date,
          confidence: receiptData.confidence
        },
        transaction: {
          id: transaction.id,
          amount: receiptData.total,
          description: transaction.description,
          wallet: wallet.name,
          new_balance: newBalance
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Could not extract amount from receipt' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('OCR API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
