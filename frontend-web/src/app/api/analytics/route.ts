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

export async function GET(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.json({
      summary: {
        month: new Date().toISOString().slice(0, 7),
        totalIncome: 0,
        totalExpense: 0,
        netIncome: 0,
        expenseRatio: 0,
        savingRatio: 0
      },
      categoryBreakdown: [],
      wallets: [],
      transactionCount: 0
    })
  }
  
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
  
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  // Get monthly transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount, category_id, categories(name, color_hex)')
    .eq('user_id', user.id)
    .gte('created_at', monthStart)
  
  // Calculate summary
  const income = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0
  const expense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0
  const net = income - expense
  const expenseRatio = income > 0 ? (expense / income) * 100 : 0
  const savingRatio = income > 0 ? 100 - expenseRatio : 0
  
  // Category breakdown
  const categoryTotals: Record<string, { amount: number, color: string }> = {}
  transactions?.filter(t => t.type === 'expense').forEach(t => {
    const cat = (t as any).categories
    const name = cat?.name || 'Lainnya'
    if (!categoryTotals[name]) {
      categoryTotals[name] = { amount: 0, color: cat?.color_hex || '#7F8C8D' }
    }
    categoryTotals[name].amount += t.amount
  })
  
  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: expense > 0 ? (data.amount / expense) * 100 : 0,
      colorHex: data.color
    }))
    .sort((a, b) => b.amount - a.amount)
  
  // Get wallets
  const { data: wallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
  
  return NextResponse.json({
    summary: {
      month: now.toISOString().slice(0, 7),
      totalIncome: income,
      totalExpense: expense,
      netIncome: net,
      expenseRatio: Math.round(expenseRatio * 10) / 10,
      savingRatio: Math.round(savingRatio * 10) / 10
    },
    categoryBreakdown,
    wallets: wallets || [],
    transactionCount: transactions?.length || 0
  })
}
