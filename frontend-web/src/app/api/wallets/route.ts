import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// GET - List wallets
export async function GET(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.json({ wallets: [] })
  }
  
  const { searchParams } = new URL(request.url)
  const telegramId = searchParams.get('telegram_id')
  
  if (!telegramId) {
    return NextResponse.json({ error: 'telegram_id required' }, { status: 400 })
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegramId)
    .single()
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  const { data: wallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  
  return NextResponse.json({ wallets: wallets || [] })
}

// POST - Create wallet
export async function POST(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  
  try {
    const body = await request.json()
    const { telegram_id, name, balance = 0, color_hex = '#16A085', icon = 'wallet' } = body
    
    if (!telegram_id || !name) {
      return NextResponse.json({ error: 'telegram_id and name required' }, { status: 400 })
    }
    
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegram_id)
      .single()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if wallet name exists
    const { data: existing } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', name)
      .single()
    
    if (existing) {
      return NextResponse.json({ error: 'Wallet name already exists' }, { status: 400 })
    }
    
    const { data: wallet, error } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        name,
        balance,
        color_hex,
        icon
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ wallet })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// PUT - Update wallet (balance, name, etc)
export async function PUT(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  
  try {
    const body = await request.json()
    const { telegram_id, wallet_id, name, balance, color_hex, icon } = body
    
    if (!telegram_id || !wallet_id) {
      return NextResponse.json({ error: 'telegram_id and wallet_id required' }, { status: 400 })
    }
    
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegram_id)
      .single()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Verify wallet belongs to user
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', wallet_id)
      .eq('user_id', user.id)
      .single()
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }
    
    // Build update object
    const updates: Record<string, any> = {}
    if (name !== undefined) updates.name = name
    if (balance !== undefined) updates.balance = balance
    if (color_hex !== undefined) updates.color_hex = color_hex
    if (icon !== undefined) updates.icon = icon
    
    const { data: updated, error } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', wallet_id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ wallet: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE - Delete wallet
export async function DELETE(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  
  const { searchParams } = new URL(request.url)
  const telegramId = searchParams.get('telegram_id')
  const walletId = searchParams.get('wallet_id')
  
  if (!telegramId || !walletId) {
    return NextResponse.json({ error: 'telegram_id and wallet_id required' }, { status: 400 })
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegramId)
    .single()
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  // Count user wallets
  const { data: wallets } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', user.id)
  
  if (wallets && wallets.length <= 1) {
    return NextResponse.json({ error: 'Cannot delete last wallet' }, { status: 400 })
  }
  
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', walletId)
    .eq('user_id', user.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
