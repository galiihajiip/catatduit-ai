import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
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
    'Transportasi': '🚗',
    'Tagihan': '📄',
    'Tagihan & Utilitas': '📄',
    'Keperluan Rumah Tangga': '🏠',
    'Rumah Tangga': '🏠',
    'Belanja': '🛍️',
    'Belanja Pribadi': '🛍️',
    'Hiburan': '🎬',
    'Kesehatan': '💊',
    'Pemasukan': '💰',
    'Gaji': '💼',
    'Bonus': '🎁',
    'Investasi': '📈',
    'Pendidikan': '📚',
    'Olahraga': '⚽',
    'Kecantikan': '💄',
    'Elektronik': '📱',
    'Donasi': '❤️',
    'Asuransi': '🛡️',
    'Pajak': '🏛️',
    'Lainnya': '📦',
  }
  return icons[category] || '📦'
}
