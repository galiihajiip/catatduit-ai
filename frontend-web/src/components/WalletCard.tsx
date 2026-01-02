'use client'

import { formatCurrency } from '@/lib/utils'
import { Wallet as WalletIcon, Building2, Smartphone, MoreHorizontal } from 'lucide-react'

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
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div
      className="min-w-[180px] p-4 rounded-card text-white"
      style={{
        background: `linear-gradient(135deg, ${wallet.colorHex}, ${wallet.colorHex}CC)`,
        boxShadow: `0 4px 12px ${wallet.colorHex}4D`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          {iconMap[wallet.icon] || <WalletIcon className="w-5 h-5" />}
        </div>
        <MoreHorizontal className="w-5 h-5 text-white/70" />
      </div>
      <p className="text-white/70 text-sm">{wallet.name}</p>
      <p className="text-lg font-semibold mt-1">{formatCurrency(wallet.balance)}</p>
    </div>
  )
}

export function AddWalletCard() {
  return (
    <div className="min-w-[180px] p-4 rounded-card border-2 border-dashed border-text-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
      <div className="w-10 h-10 rounded-full bg-text-secondary/10 flex items-center justify-center mb-2">
        <span className="text-2xl text-text-secondary">+</span>
      </div>
      <p className="text-sm text-text-secondary">Tambah Dompet</p>
    </div>
  )
}
