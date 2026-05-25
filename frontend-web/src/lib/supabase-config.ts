export function isSupabasePlaceholder(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return (
    !url ||
    !serviceKey ||
    url.includes('your-project') ||
    serviceKey === 'your-service-key' ||
    anonKey === 'your-anon-key'
  )
}

export function getSupabaseConfigError(): string {
  return (
    'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL, ' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_KEY di file .env.local ' +
    '(ambil dari Supabase Dashboard → Project Settings → API), lalu restart npm run dev.'
  )
}

export function isSupabaseFetchError(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? `${error.message} ${(error as { cause?: Error }).cause?.message ?? ''}`
      : String(error)
  return /fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(msg)
}
