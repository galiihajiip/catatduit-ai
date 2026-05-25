import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfigError, isSupabasePlaceholder } from '@/lib/supabase-config'

export function isSupabaseServerConfigured(): boolean {
  return !isSupabasePlaceholder()
}

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_KEY || 'placeholder-key'
  return createClient(url, key)
}

export function getSupabaseSetupMessage(): string {
  return getSupabaseConfigError()
}
