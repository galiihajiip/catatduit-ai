import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale: string = 'id-ID'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'id-ID' ? 'IDR' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string, locale: string = 'id-ID'): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Makanan': '🍽️',
    'Makanan & Minuman': '🍽️',
    'Food & Beverage': '🍽️',
    'Transportasi': '🚗',
    'Transportation': '🚗',
    'Tagihan': '📄',
    'Tagihan & Utilitas': '📄',
    'Bills & Utilities': '📄',
    'Keperluan Rumah Tangga': '🏠',
    'Rumah Tangga': '🏠',
    'Household': '🏠',
    'Belanja': '🛍️',
    'Belanja Pribadi': '🛍️',
    'Shopping': '🛍️',
    'Hiburan': '🎬',
    'Entertainment': '🎬',
    'Kesehatan': '💊',
    'Health': '💊',
    'Pemasukan': '💰',
    'Income': '💰',
    'Gaji': '💼',
    'Salary': '💼',
    'Bonus': '🎁',
    'Investasi': '📈',
    'Investment': '📈',
    'Pendidikan': '📚',
    'Education': '📚',
    'Olahraga': '⚽',
    'Sports': '⚽',
    'Kecantikan': '💄',
    'Beauty': '💄',
    'Elektronik': '📱',
    'Electronics': '📱',
    'Donasi': '❤️',
    'Donation': '❤️',
    'Asuransi': '🛡️',
    'Insurance': '🛡️',
    'Pajak': '🏛️',
    'Tax': '🏛️',
    'Lainnya': '📦',
    'Other': '📦',
  }
  return icons[category] || '📦'
}
