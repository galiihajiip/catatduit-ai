import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DEMO_ACCOUNT, validateDemoLogin } from '@/lib/demo-auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const username = String(body?.username ?? '')
  const password = String(body?.password ?? '')

  if (!validateDemoLogin(username, password)) {
    return NextResponse.json({ error: 'ID atau password demo salah' }, { status: 401 })
  }

  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id, name')
    .eq('telegram_id', DEMO_ACCOUNT.userId)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 })
  }

  let user = existingUser
  if (!user) {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        telegram_id: DEMO_ACCOUNT.userId,
        name: DEMO_ACCOUNT.displayName,
        is_pro: false,
      })
      .select('id, name')
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
    user = newUser
  }

  if (!user) {
    return NextResponse.json({ error: 'Gagal membuat akun demo' }, { status: 500 })
  }

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!wallet) {
    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: user.id,
        name: 'Cash',
        balance: 0,
        color_hex: '#16A085',
        icon: 'wallet',
      })

    if (walletError) {
      return NextResponse.json({ error: walletError.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    user: {
      userId: DEMO_ACCOUNT.userId,
      displayName: DEMO_ACCOUNT.displayName,
    },
  })
}
