import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseTransaction } from '@/lib/nlp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '')

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
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
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()
  
  if (existing) return existing
  
  const { data: newUser } = await supabase
    .from('users')
    .insert({ telegram_id: telegramId, name })
    .select()
    .single()
  
  // Create default wallet with 0 balance
  if (newUser) {
    await supabase.from('wallets').insert({
      user_id: newUser.id,
      name: 'Cash',
      balance: 0, // Default 0
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
  
  const { data: newCat } = await supabase
    .from('categories')
    .insert({ name: categoryName, type, color_hex: '#7F8C8D', icon: 'category' })
    .select('id')
    .single()
  
  return newCat?.id
}

async function getWalletByName(userId: string, walletName: string) {
  const { data } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', `%${walletName}%`)
    .limit(1)
    .single()
  
  return data?.id
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

async function getUserWallets(userId: string) {
  const { data } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
  
  return data || []
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
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
    const text = update.message.text.trim()
    const userName = update.message.from?.first_name || 'User'
    
    // Get or create user
    const user = await getOrCreateUser(String(chatId), userName)
    if (!user) {
      await sendMessage(chatId, '❌ Error: Gagal membuat user')
      return NextResponse.json({ ok: true })
    }

    // Handle commands
    if (text.startsWith('/')) {
      const parts = text.split(' ')
      const command = parts[0].toLowerCase()
      
      if (command === '/start') {
        await sendMessage(chatId, `
👋 <b>Halo ${userName}!</b>

Selamat datang di <b>CatatDuit AI</b> 🤖💰

<b>Cara Pakai:</b>
• Ketik langsung: "beli bakso 15rb"
• Atau: "gaji masuk 5jt"

<b>Perintah:</b>
/today - Ringkasan hari ini
/month - Ringkasan bulan ini
/wallets - Lihat semua dompet
/addwallet [nama] - Tambah dompet baru
/setbalance [nama] [jumlah] - Set saldo dompet
/undo - Batalkan transaksi terakhir
/help - Bantuan

Mulai catat keuanganmu sekarang! 🚀
        `)
        return NextResponse.json({ ok: true })
      }
      
      if (command === '/help') {
        await sendMessage(chatId, `
📖 <b>Panduan CatatDuit AI</b>

<b>Mencatat Transaksi:</b>
• "beli bakso 15rb" → Pengeluaran
• "gaji masuk 5jt" → Pemasukan
• "beli kopi 25k pake gopay" → Dengan dompet

<b>Kelola Dompet:</b>
• /wallets - Lihat semua dompet
• /addwallet Cash - Tambah dompet "Cash"
• /addwallet Bank BCA - Tambah dompet "Bank BCA"
• /setbalance Cash 500000 - Set saldo Cash jadi 500rb
• /setbalance BCA 5jt - Set saldo BCA jadi 5jt

<b>Ringkasan:</b>
• /today - Ringkasan hari ini
• /month - Ringkasan bulan ini

<b>Lainnya:</b>
• /undo - Batalkan transaksi terakhir
        `)
        return NextResponse.json({ ok: true })
      }
      
      if (command === '/wallets') {
        const wallets = await getUserWallets(user.id)
        if (wallets.length === 0) {
          await sendMessage(chatId, '💼 Belum ada dompet. Ketik /addwallet [nama] untuk menambah.')
        } else {
          const walletList = wallets.map((w, i) => 
            `${i + 1}. <b>${w.name}</b>: ${formatCurrency(w.balance)}`
          ).join('\n')
          await sendMessage(chatId, `
💼 <b>Dompet Kamu</b>

${walletList}

Total: ${formatCurrency(wallets.reduce((s, w) => s + w.balance, 0))}

<i>Ketik /setbalance [nama] [jumlah] untuk set saldo</i>
          `)
        }
        return NextResponse.json({ ok: true })
      }
      
      if (command === '/addwallet') {
        const walletName = parts.slice(1).join(' ').trim()
        if (!walletName) {
          await sendMessage(chatId, '❌ Format: /addwallet [nama dompet]\n\nContoh: /addwallet Bank BCA')
          return NextResponse.json({ ok: true })
        }
        
        // Check if wallet exists
        const existingWallet = await getWalletByName(user.id, walletName)
        if (existingWallet) {
          await sendMessage(chatId, `❌ Dompet "${walletName}" sudah ada.`)
          return NextResponse.json({ ok: true })
        }
        
        // Create wallet with 0 balance
        const colors = ['#16A085', '#3498DB', '#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C']
        const wallets = await getUserWallets(user.id)
        const color = colors[wallets.length % colors.length]
        
        await supabase.from('wallets').insert({
          user_id: user.id,
          name: walletName,
          balance: 0,
          color_hex: color,
          icon: 'wallet'
        })
        
        await sendMessage(chatId, `
✅ <b>Dompet Ditambahkan!</b>

💼 ${walletName}
💰 Saldo: Rp 0

<i>Ketik /setbalance ${walletName} [jumlah] untuk set saldo awal</i>
        `)
        return NextResponse.json({ ok: true })
      }
      
      if (command === '/setbalance') {
        // Parse: /setbalance [wallet name] [amount]
        const args = parts.slice(1).join(' ')
        
        // Try to extract amount from end
        const amountMatch = args.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta|rb|ribu|k)?$/i)
        if (!amountMatch) {
          await sendMessage(chatId, '❌ Format: /setbalance [nama dompet] [jumlah]\n\nContoh:\n/setbalance Cash 500000\n/setbalance Bank BCA 5jt')
          return NextResponse.json({ ok: true })
        }
        
        let amount = parseFloat(amountMatch[1].replace(',', '.'))
        const amountStr = args.match(/(\d+(?:[.,]\d+)?)\s*(jt|juta|rb|ribu|k)?$/i)
        if (amountStr && amountStr[2]) {
          const unit = amountStr[2].toLowerCase()
          if (unit === 'jt' || unit === 'juta') amount *= 1000000
          else if (unit === 'rb' || unit === 'ribu' || unit === 'k') amount *= 1000
        }
        
        const walletName = args.replace(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta|rb|ribu|k)?$/i, '').trim()
        
        if (!walletName) {
          await sendMessage(chatId, '❌ Nama dompet tidak boleh kosong.')
          return NextResponse.json({ ok: true })
        }
        
        // Find wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .ilike('name', `%${walletName}%`)
          .limit(1)
          .single()
        
        if (!wallet) {
          await sendMessage(chatId, `❌ Dompet "${walletName}" tidak ditemukan.\n\nKetik /wallets untuk lihat daftar dompet.`)
          return NextResponse.json({ ok: true })
        }
        
        // Update balance
        await supabase
          .from('wallets')
          .update({ balance: amount })
          .eq('id', wallet.id)
        
        await sendMessage(chatId, `
✅ <b>Saldo Diperbarui!</b>

💼 ${wallet.name}
💰 Saldo baru: ${formatCurrency(amount)}
        `)
        return NextResponse.json({ ok: true })
      }
      
      if (command === '/today' || command === '/month') {
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
        const { data: lastTx } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (lastTx) {
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
      
      // Unknown command
      await sendMessage(chatId, '❓ Perintah tidak dikenal. Ketik /help untuk bantuan.')
      return NextResponse.json({ ok: true })
    }
    
    // Parse transaction with AI
    const parsed = parseTransaction(text)
    
    if (parsed.amount === 0) {
      await sendMessage(chatId, '❓ Maaf, saya tidak bisa mendeteksi jumlah uang.\n\nContoh format:\n• "beli bakso 15rb"\n• "gaji masuk 5jt"\n\nKetik /help untuk bantuan.')
      return NextResponse.json({ ok: true })
    }
    
    // Get category
    const categoryId = await getDefaultCategory(parsed.category, parsed.intent)
    
    // Get wallet (by name if specified, otherwise default)
    let walletId = parsed.wallet ? await getWalletByName(user.id, parsed.wallet) : null
    if (!walletId) {
      walletId = await getDefaultWallet(user.id)
    }
    
    if (!categoryId || !walletId) {
      await sendMessage(chatId, '❌ Error: Setup tidak lengkap. Ketik /start untuk memulai.')
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
