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
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const telegramId = formData.get('telegram_id') as string

    console.log('OCR Request:', { 
      hasFile: !!file, 
      telegramId, 
      isConfigured,
      hasSupabase: !!supabase 
    })

    if (!file || !telegramId) {
      return NextResponse.json(
        { error: 'File and telegram_id required' },
        { status: 400 }
      )
    }

    if (!isConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured. Please set Supabase credentials in Vercel.' },
        { status: 503 }
      )
    }

    // Convert file to base64
    const base64 = await fileToBase64(file)

    // Try Google Vision API if configured, otherwise use simple processing
    let receiptData
    const hasVisionAPI = !!process.env.GOOGLE_CLOUD_VISION_API_KEY
    
    console.log('Processing mode:', hasVisionAPI ? 'Vision API' : 'Simple')
    
    if (hasVisionAPI) {
      try {
        receiptData = await processReceiptWithVision(base64)
        console.log('Vision API success:', { total: receiptData.total, confidence: receiptData.confidence })
      } catch (visionError: any) {
        console.warn('Vision API failed:', visionError.message)
        receiptData = await processReceiptSimple(file)
        console.log('Fallback to simple processing:', { total: receiptData.total })
      }
    } else {
      // Use simple processing (no API key needed)
      receiptData = await processReceiptSimple(file)
      console.log('Simple processing:', { total: receiptData.total })
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single()

    console.log('User lookup:', { found: !!user, error: userError?.message })

    if (!user) {
      // Try to create user if not exists
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          name: 'User',
          is_pro: false
        })
        .select('id')
        .single()
      
      if (createError || !newUser) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ 
          error: 'User not found. Please login via Telegram first.',
          detail: createError?.message 
        }, { status: 404 })
      }
      
      console.log('Created new user:', newUser.id)
      
      // Create default wallet for new user
      await supabase
        .from('wallets')
        .insert({
          user_id: newUser.id,
          name: 'Cash',
          balance: 0,
          color_hex: '#16A085',
          icon: 'wallet'
        })
    }

    // Get user again (either existing or newly created)
    const { data: finalUser } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single()

    if (!finalUser) {
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
    }

    // Get or create default wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', finalUser.id)
      .limit(1)
      .single()

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({
          user_id: finalUser.id,
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

    console.log('Wallet:', { id: wallet.id, balance: wallet.balance })

    // Get category
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Belanja')
      .single()

    console.log('Category:', { found: !!category })

    // Create transaction
    if (receiptData.total > 0) {
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: finalUser.id,
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
        return NextResponse.json({ 
          error: 'Failed to create transaction',
          detail: txError.message 
        }, { status: 500 })
      }

      console.log('Transaction created:', transaction.id)

      // Update wallet balance
      const newBalance = wallet.balance - receiptData.total
      const { error: balanceError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id)

      if (balanceError) {
        console.error('Balance update error:', balanceError)
      }

      console.log('Success! New balance:', newBalance)

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
  } catch (error: any) {
    console.error('OCR API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        detail: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
