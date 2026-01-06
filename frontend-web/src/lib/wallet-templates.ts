/**
 * Wallet Templates with Icons and Colors
 * Auto-detect wallet type based on name
 */

export interface WalletTemplate {
  name: string
  icon: string
  color: string
  type: 'ewallet' | 'bank' | 'cash' | 'card'
}

export const WALLET_TEMPLATES: WalletTemplate[] = [
  // E-Wallets
  { name: 'Dana', icon: '💳', color: '#118EEA', type: 'ewallet' },
  { name: 'OVO', icon: '💜', color: '#4C3494', type: 'ewallet' },
  { name: 'GoPay', icon: '🟢', color: '#00AA13', type: 'ewallet' },
  { name: 'ShopeePay', icon: '🧡', color: '#EE4D2D', type: 'ewallet' },
  { name: 'LinkAja', icon: '🔴', color: '#E62129', type: 'ewallet' },
  
  // Banks - Major
  { name: 'BCA', icon: '🏦', color: '#003D79', type: 'bank' },
  { name: 'Mandiri', icon: '🏦', color: '#003D79', type: 'bank' },
  { name: 'BRI', icon: '🏦', color: '#003D79', type: 'bank' },
  { name: 'BNI', icon: '🏦', color: '#F47920', type: 'bank' },
  { name: 'BTN', icon: '🏦', color: '#0066AE', type: 'bank' },
  { name: 'CIMB Niaga', icon: '🏦', color: '#B91116', type: 'bank' },
  { name: 'Danamon', icon: '🏦', color: '#0066AE', type: 'bank' },
  { name: 'Permata', icon: '🏦', color: '#00A651', type: 'bank' },
  { name: 'Panin', icon: '🏦', color: '#003D79', type: 'bank' },
  { name: 'OCBC NISP', icon: '🏦', color: '#ED1C24', type: 'bank' },
  
  // Banks - Syariah
  { name: 'BSI', icon: '🏦', color: '#00A651', type: 'bank' },
  { name: 'Bank Muamalat', icon: '🏦', color: '#00A651', type: 'bank' },
  { name: 'Bank Syariah Mandiri', icon: '🏦', color: '#00A651', type: 'bank' },
  
  // Banks - Digital
  { name: 'Jenius', icon: '💳', color: '#00AED6', type: 'bank' },
  { name: 'Blu BCA', icon: '💳', color: '#0066FF', type: 'bank' },
  { name: 'Jago', icon: '💳', color: '#FF6B00', type: 'bank' },
  { name: 'Neobank', icon: '💳', color: '#6C5CE7', type: 'bank' },
  { name: 'Seabank', icon: '💳', color: '#EE4D2D', type: 'bank' },
  
  // Credit Cards
  { name: 'Kartu Kredit', icon: '💳', color: '#E74C3C', type: 'card' },
  { name: 'Visa', icon: '💳', color: '#1A1F71', type: 'card' },
  { name: 'Mastercard', icon: '💳', color: '#EB001B', type: 'card' },
  
  // Cash
  { name: 'Cash', icon: '💵', color: '#16A085', type: 'cash' },
  { name: 'Tunai', icon: '💵', color: '#16A085', type: 'cash' },
]

/**
 * Auto-detect wallet template based on name
 */
export function detectWalletTemplate(name: string): WalletTemplate | null {
  const nameLower = name.toLowerCase()
  
  for (const template of WALLET_TEMPLATES) {
    if (nameLower.includes(template.name.toLowerCase())) {
      return template
    }
  }
  
  return null
}

/**
 * Get wallet icon and color
 */
export function getWalletStyle(name: string): { icon: string; color: string } {
  const template = detectWalletTemplate(name)
  
  if (template) {
    return { icon: template.icon, color: template.color }
  }
  
  // Default
  return { icon: '💰', color: '#7F8C8D' }
}
