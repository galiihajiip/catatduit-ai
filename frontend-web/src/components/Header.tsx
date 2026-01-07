'use client'

import { Bell, Settings } from 'lucide-react'
import { ProBadge } from './ProBadge'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'

interface HeaderProps {
  totalBalance: number
  isPro: boolean
  onSettingsClick: () => void
}

export default function Header({ totalBalance, isPro, onSettingsClick }: HeaderProps) {
  const { t } = useTranslation()
  
  return (
    <header className="flex items-center justify-between p-5 bg-background-primary border-b border-border-light">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-text-primary">{t('common.appName')}</h1>
          {isPro && <ProBadge />}
        </div>
        <p className="text-sm text-text-secondary mt-1">
          {t('dashboard.balance')}: {formatCurrency(totalBalance)}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
        <button className="p-2 hover:bg-background-secondary rounded-full transition-colors">
          <Bell className="w-5 h-5 text-text-primary" />
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 hover:bg-background-secondary rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-text-primary" />
        </button>
      </div>
    </header>
  )
}
