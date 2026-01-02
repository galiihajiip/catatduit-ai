'use client'

import { Bell, Settings } from 'lucide-react'
import { ProBadge } from './ProBadge'
import { formatCurrency } from '@/lib/utils'

interface HeaderProps {
  totalBalance: number
  isPro: boolean
  onSettingsClick: () => void
}

export default function Header({ totalBalance, isPro, onSettingsClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-text-primary">CatatDuit</h1>
          {isPro && <ProBadge />}
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Total Saldo: {formatCurrency(totalBalance)}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-text-primary" />
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-text-primary" />
        </button>
      </div>
    </header>
  )
}
