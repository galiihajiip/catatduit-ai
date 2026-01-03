'use client'

import { formatCurrency } from '@/lib/utils'
import { Wallet as WalletIcon, Building2, Smartphone, MoreHorizontal, CreditCard } from 'lucide-react'

interface Wallet {
  id: string
  name: string
  balance: number
  colorHex: string
  icon: string
}

interface WalletCardProps {
  wallet: Wallet
}

const iconMap: Record<string, React.ReactNode> = {
  wallet: <WalletIcon className="w-5 h-5" />,
  bank: <Building2 className="w-5 h-5" />,
  phone: <Smartphone className="w-5 h-5" />,
  card: <CreditCard className="w-5 h-5" />,
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div
      className="p-5 rounded-card text-white cursor-pointer hover:scale-[1.02] transition-transform"
      style={{
        background: `linear-gradient(135deg, ${wallet.colorHex}, ${wallet.colorHex}CC)`,
        boxShadow: `0 4px 20px ${wallet.colorHex}40`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
          {iconMap[wallet.icon] || <WalletIcon className="w-5 h-5" />}
        </div>
        <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-white/70" />
        </button>
      </div>
      <p className="text-white/70 text-sm font-medium">{wallet.name}</p>
      <p className="text-xl font-bold mt-1">{formatCurrency(wallet.balance)}</p>
    </div>
  )
}

export function AddWalletCard() {
  return (
    <div className="p-5 rounded-card border-2 border-dashed border-text-secondary/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all min-h-[140px]">
      <div className="w-12 h-12 rounded-full bg-text-secondary/10 flex items-center justify-center mb-3">
        <span className="text-2xl text-text-secondary">+</span>
      </div>
      <p className="text-sm font-medium text-text-secondary">Tambah Dompet</p>
    </div>
  )
}
