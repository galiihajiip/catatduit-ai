import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseTransaction } from '@/lib/nlp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    })
  })
}

async function getOrCreateUser(telegramId: string, name: string) {
  // Check existing user
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()
  
  if (existing) return existing
  
  // Create new user
  const { data: newUser } = await supabase
    .from('users')
    .insert({ telegram_id: telegramId, name })
    .select()
    .single()
  
  // Create default wallet
  if (newUser) {
    await supabase.from('wallets').insert({
      user_id: newUser.id,
      name: 'Cash',
      balance: 0,
      color_hex: '#16A085',
      icon: 'wallet'
    })
  }
  
  return newUser
}

async function getDefaultCategory(categoryName: string, type: string) {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single()
  
  if (data) return data.id
  
  // Create if not exists
  const { data: newCat } = await supabase
    .from('categories')
    .insert({ name: categoryName, type, color_hex: '#7F8C8D', icon: 'category' })
    .select('id')
    .single()
  
  return newCat?.id
}

async function getDefaultWallet(userId: string) {
  const { data } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .single()
  
  return data?.id
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id
      const data = update.callback_query.data
      
      if (data === 'confirm_no') {
        await sendMessage(chatId, '❌ Transaksi dibatalkan.')
      }
      return NextResponse.json({ ok: true })
    }
    
    if (!update.message?.text) {
      return NextResponse.json({ ok: true })
    }
    
    const chatId = update.message.chat.id
    const text = update.message.text
    const userName = update.message.from?.first_name || 'User'
    
    // Handle commands
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].toLowerCase()
      
      if (command === '/start') {
        await getOrCreateUser(String(chatId), userName)
        await sendMessage(chatId, `
👋 <b>Halo ${userName}!</b>

Selamat datang di <b>CatatDuit AI</b> 🤖💰

<b>Cara Pakai:</b>
• Ketik langsung: "beli bakso 15rb"
• Atau: "gaji masuk 5jt"

<b>Perintah:</b>
/today - Ringkasan hari ini
/month - Ringkasan bulan ini
/undo - Batalkan transaksi terakhir

Mulai catat keuanganmu sekarang! 🚀
        `)
        return NextResponse.json({ ok: true })
      }
      
      if (command === '/today' || command === '/month') {
        const user = await getOrCreateUser(String(chatId), userName)
        if (!user) {
          await sendMessage(chatId, '❌ Error: User tidak ditemukan')
          return NextResponse.json({ ok: true })
        }
        
        const now = new Date()
        const startDate = command === '/today' 
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
          : new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        
        const { data: transactions } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
        
        const income = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0
        const expense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0
        
        const period = command === '/today' ? 'Hari Ini' : 'Bulan Ini'
        await sendMessage(chatId, `
📊 <b>Ringkasan ${period}</b>

💵 Pemasukan: ${formatCurrency(income)}
💸 Pengeluaran: ${formatCurrency(expense)}
📈 Net: ${formatCurrency(income - expense)}

📝 Total: ${transactions?.length || 0} transaksi
        `)
        return NextResponse.json({ ok: true })
      }
      
      if (command === '/undo') {
        const user = await getOrCreateUser(String(chatId), userName)
        if (!user) return NextResponse.json({ ok: true })
        
        const { data: lastTx } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (lastTx) {
          // Reverse wallet balance
          const balanceChange = lastTx.type === 'income' ? -lastTx.amount : lastTx.amount
          await supabase.rpc('update_wallet_balance', { 
            wallet_id: lastTx.wallet_id, 
            amount_change: balanceChange 
          })
          
          await supabase.from('transactions').delete().eq('id', lastTx.id)
          await sendMessage(chatId, `↩️ Transaksi "${lastTx.description}" (${formatCurrency(lastTx.amount)}) dibatalkan.`)
        } else {
          await sendMessage(chatId, '❌ Tidak ada transaksi untuk dibatalkan.')
        }
        return NextResponse.json({ ok: true })
      }
      
      return NextResponse.json({ ok: true })
    }
    
    // Parse transaction with AI
    const parsed = parseTransaction(text)
    
    if (parsed.amount === 0) {
      await sendMessage(chatId, '❓ Maaf, saya tidak bisa mendeteksi jumlah uang. Coba ketik ulang dengan format: "beli bakso 15rb"')
      return NextResponse.json({ ok: true })
    }
    
    // Get or create user
    const user = await getOrCreateUser(String(chatId), userName)
    if (!user) {
      await sendMessage(chatId, '❌ Error: Gagal membuat user')
      return NextResponse.json({ ok: true })
    }
    
    // Get category and wallet
    const categoryId = await getDefaultCategory(parsed.category, parsed.intent)
    const walletId = await getDefaultWallet(user.id)
    
    if (!categoryId || !walletId) {
      await sendMessage(chatId, '❌ Error: Setup tidak lengkap')
      return NextResponse.json({ ok: true })
    }
    
    // Save transaction
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      wallet_id: walletId,
      category_id: categoryId,
      type: parsed.intent,
      amount: parsed.amount,
      description: parsed.description,
      raw_input: text,
      ai_confidence: parsed.confidence
    })
    
    if (error) {
      await sendMessage(chatId, '❌ Gagal menyimpan transaksi')
      return NextResponse.json({ ok: true })
    }
    
    // Update wallet balance
    const balanceChange = parsed.intent === 'income' ? parsed.amount : -parsed.amount
    await supabase.rpc('update_wallet_balance', { 
      wallet_id: walletId, 
      amount_change: balanceChange 
    })
    
    // Send success message
    const emoji = parsed.intent === 'income' ? '💰' : '💸'
    await sendMessage(chatId, `
✅ <b>Transaksi Tercatat!</b>

${emoji} <b>${parsed.intent === 'income' ? 'Pemasukan' : 'Pengeluaran'}</b>
💵 ${formatCurrency(parsed.amount)}
📂 ${parsed.category}
📝 ${parsed.description}
🎯 AI Confidence: ${(parsed.confidence * 100).toFixed(0)}%

Ketik /today untuk lihat ringkasan.
    `)
    
    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' })
}
