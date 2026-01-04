import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  telegram_id: string
  name: string
  is_pro: boolean
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  name: string
  balance: number
  color_hex: string
  icon: string
}

export interface Category {
  id: string
  name: string
  color_hex: string
  icon: string
  type: 'expense' | 'income' | 'transfer'
}

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  category_id: string
  type: 'expense' | 'income' | 'transfer'
  amount: number
  description: string
  raw_input: string
  ai_confidence: number
  created_at: string
  category?: Category
  wallet?: Wallet
}
