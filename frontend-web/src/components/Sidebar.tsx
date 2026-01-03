'use client'

import { Home, PieChart, Wallet, History, Settings, MessageCircle, Crown } from 'lucide-react'
import { ProBadge } from './ProBadge'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isPro: boolean
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'wallets', label: 'Dompet', icon: Wallet },
  { id: 'history', label: 'Riwayat', icon: History },
]

export default function Sidebar({ activeTab, onTabChange, isPro }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-text-primary">CatatDuit</h1>
            {isPro && <ProBadge small />}
          </div>
          <p className="text-xs text-text-secondary">AI Finance Manager</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
      
      {/* Telegram CTA */}
      <div className="px-4 pb-4">
        <a
          href="https://t.me/catatduitgalih_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-accent-blue/10 text-accent-blue rounded-xl hover:bg-accent-blue/20 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <div>
            <p className="font-medium text-sm">Telegram Bot</p>
            <p className="text-xs opacity-80">Chat untuk catat</p>
          </div>
        </a>
      </div>
      
      {/* Upgrade CTA */}
      {!isPro && (
        <div className="px-4 pb-6">
          <div className="p-4 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-xl border border-yellow-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-text-primary">Upgrade Pro</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">Unlimited wallets, AI insights, dan lainnya</p>
            <button className="w-full py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
              Upgrade Sekarang
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

// Mobile Bottom Navigation
export function MobileNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-gray-100 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
