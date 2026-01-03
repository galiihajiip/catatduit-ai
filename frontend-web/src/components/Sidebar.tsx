'use client'

import { useState } from 'react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isPro: boolean
  isOpen: boolean
  onToggle: () => void
  userName?: string
  telegramId?: string
  onLogout?: () => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'wallets', label: 'Dompet', icon: '💰' },
  { id: 'analytics', label: 'Analisis', icon: '📊' },
  { id: 'history', label: 'Riwayat', icon: '📜' },
  { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
]

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  isPro, 
  isOpen, 
  onToggle,
  userName,
  telegramId,
  onLogout
}: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    if (window.innerWidth < 1024) {
      onToggle()
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-gray-100
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-lg">💵</span>
            </div>
            <div>
              <h1 className="font-bold text-text-primary text-lg">CatatDuit</h1>
              <p className="text-xs text-text-secondary">AI Finance Manager</p>
            </div>
          </div>
          <button 
            onClick={onToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* User Profile */}
        {telegramId && (
          <div className="px-4 py-4 border-b border-gray-100">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white">👤</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-text-primary text-sm">{userName || 'User'}</p>
                <p className="text-xs text-text-secondary">ID: {telegramId}</p>
              </div>
              <span className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showUserMenu && (
              <div className="mt-2 p-2 bg-gray-50 rounded-xl">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-white rounded-lg transition-colors"
                >
                  🚪 Keluar
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {item.id === 'analytics' && isPro && (
                  <span className="ml-auto px-2 py-0.5 bg-yellow-400/20 text-yellow-600 text-xs rounded-full">PRO</span>
                )}
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
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-accent-blue/10 to-blue-500/10 text-accent-blue rounded-xl hover:from-accent-blue/20 hover:to-blue-500/20 transition-all"
          >
            <span className="text-xl">💬</span>
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
                <span className="text-xl">👑</span>
                <span className="font-semibold text-text-primary">Upgrade Pro</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">Fitur lengkap & tanpa batas</p>
              <button className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-orange-400/30">
                Upgrade Sekarang
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

// Hamburger Button for Mobile
export function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
    >
      <span className="text-2xl">☰</span>
    </button>
  )
}
