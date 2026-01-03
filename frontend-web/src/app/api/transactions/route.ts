import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

// Return empty data if env vars missing (for build time)
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials - API will return empty data')
}

export async function GET(request: NextRequest) {
  // Handle missing env vars gracefully
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ transactions: [] })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { searchParams } = new URL(request.url)
  const telegramId = searchParams.get('telegram_id')
  
  if (!telegramId) {
    return NextResponse.json({ error: 'telegram_id required' }, { status: 400 })
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
