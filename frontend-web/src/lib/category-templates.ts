/**
 * Category Templates
 * Default categories for expense and income
 */

export interface CategoryTemplate {
  name: string
  icon: string
  color: string
  type: 'expense' | 'income'
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  // Expense Categories
  { name: 'Makanan & Minuman', icon: '🍔', color: '#E74C3C', type: 'expense' },
  { name: 'Transportasi', icon: '🚗', color: '#3498DB', type: 'expense' },
  { name: 'Belanja', icon: '🛒', color: '#9B59B6', type: 'expense' },
  { name: 'Hiburan', icon: '🎬', color: '#E67E22', type: 'expense' },
  { name: 'Kesehatan', icon: '💊', color: '#1ABC9C', type: 'expense' },
  { name: 'Pendidikan', icon: '📚', color: '#F39C12', type: 'expense' },
  { name: 'Tagihan', icon: '📄', color: '#95A5A6', type: 'expense' },
  { name: 'Pulsa & Internet', icon: '📱', color: '#34495E', type: 'expense' },
  { name: 'Olahraga', icon: '⚽', color: '#16A085', type: 'expense' },
  { name: 'Kecantikan', icon: '💄', color: '#E91E63', type: 'expense' },
  { name: 'Hadiah', icon: '🎁', color: '#9C27B0', type: 'expense' },
  { name: 'Amal & Donasi', icon: '🤲', color: '#00BCD4', type: 'expense' },
  { name: 'Investasi', icon: '📈', color: '#4CAF50', type: 'expense' },
  { name: 'Asuransi', icon: '🛡️', color: '#607D8B', type: 'expense' },
  { name: 'Pajak', icon: '🏛️', color: '#795548', type: 'expense' },
  { name: 'Rumah Tangga', icon: '🏠', color: '#FF9800', type: 'expense' },
  { name: 'Hewan Peliharaan', icon: '🐾', color: '#8BC34A', type: 'expense' },
  { name: 'Lainnya', icon: '📦', color: '#7F8C8D', type: 'expense' },
  
  // Income Categories
  { name: 'Gaji', icon: '💰', color: '#27AE60', type: 'income' },
  { name: 'Bonus', icon: '🎉', color: '#F39C12', type: 'income' },
  { name: 'Freelance', icon: '💼', color: '#3498DB', type: 'income' },
  { name: 'Investasi', icon: '📈', color: '#1ABC9C', type: 'income' },
  { name: 'Hadiah', icon: '🎁', color: '#E74C3C', type: 'income' },
  { name: 'Penjualan', icon: '🏪', color: '#9B59B6', type: 'income' },
  { name: 'Lainnya', icon: '💵', color: '#16A085', type: 'income' },
]

/**
 * Get categories by type
 */
export function getCategoriesByType(type: 'expense' | 'income'): CategoryTemplate[] {
  return CATEGORY_TEMPLATES.filter(cat => cat.type === type)
}

/**
 * Find category by name
 */
export function findCategory(name: string): CategoryTemplate | undefined {
  return CATEGORY_TEMPLATES.find(cat => 
    cat.name.toLowerCase() === name.toLowerCase()
  )
}
