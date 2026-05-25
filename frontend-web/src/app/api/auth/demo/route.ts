import { NextResponse } from 'next/server'
import { withNetworkRetry } from '@/lib/api-errors'
import { DEMO_ACCOUNT, validateDemoLogin } from '@/lib/demo-auth'
import { isSupabaseFetchError } from '@/lib/supabase-config'
import {
  createSupabaseServerClient,
  getSupabaseSetupMessage,
  isSupabaseServerConfigured,
} from '@/lib/supabase-server'

export const runtime = 'nodejs'

function demoSuccessResponse(options?: { warning?: string; degraded?: boolean }) {
  return NextResponse.json({
    user: {
      userId: DEMO_ACCOUNT.userId,
      displayName: DEMO_ACCOUNT.displayName,
    },
    warning: options?.warning,
    degraded: options?.degraded ?? false,
  })
}

async function ensureDemoUserInDatabase() {
  const supabase = createSupabaseServerClient()

  return withNetworkRetry(async () => {
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id, name')
      .eq('telegram_id', DEMO_ACCOUNT.userId)
      .maybeSingle()

    if (lookupError) throw lookupError

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

      if (createError) throw createError
      user = newUser
    }

    if (!user) throw new Error('Gagal membuat akun demo')

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

      if (walletError) throw walletError
    }
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const username = String(body?.username ?? '')
  const password = String(body?.password ?? '')

  if (!validateDemoLogin(username, password)) {
    return NextResponse.json({ error: 'ID atau password demo salah' }, { status: 401 })
  }

  if (!isSupabaseServerConfigured()) {
    return demoSuccessResponse({
      degraded: true,
      warning: getSupabaseSetupMessage(),
    })
  }

  try {
    await ensureDemoUserInDatabase()
    return demoSuccessResponse()
  } catch (error) {
    console.error('Demo auth error:', error)

    if (isSupabaseFetchError(error)) {
      return demoSuccessResponse({
        degraded: true,
        warning:
          'Koneksi ke Supabase gagal. Kamu masuk mode demo offline — tampilan dashboard tetap bisa dibuka, tetapi transaksi tidak tersimpan. Periksa internet atau variabel env Supabase di server, lalu coba lagi.',
      })
    }

    const message = error instanceof Error ? error.message : 'Gagal masuk ke akun demo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
