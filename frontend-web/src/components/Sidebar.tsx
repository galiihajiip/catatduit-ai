'use client'

import { useState } from 'react'
import { Icons } from './Icons'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isPro: boolean
  isOpen: boolean
  onToggle: () => void
  userName?: string
  userId?: string
  onLogout?: () => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.home },
  { id: 'wallets', label: 'Dompet', icon: Icons.wallet },
  { id: 'analytics', label: 'Analisis', icon: Icons.pieChart },
  { id: 'history', label: 'Riwayat', icon: Icons.history },
  { id: 'settings', label: 'Pengaturan', icon: Icons.settings },
]

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  isPro, 
  isOpen, 
  onToggle,
  userName,
  userId,
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
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r-2 border-slate-200 shadow-xl shadow-slate-900/5
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Icons.dollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-lg tracking-tight">
                <span className="text-primary">Catat</span>
                <span className="text-accent-orange">.in</span>
                <span className="text-slate-900"> Duit</span>
              </h1>
              <p className="text-xs font-semibold text-slate-600">Pembukuan UMKM Berbasis AI Lokal</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Icons.close className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        {userId && (
          <div className="px-4 py-4 border-b-2 border-slate-200">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-md shadow-primary/30">
                <Icons.user className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-900 text-sm">{userName || 'User'}</p>
                <p className="text-xs font-semibold text-slate-600">Demo ID: {userId}</p>
              </div>
              <Icons.chevronDown
                className={`w-4 h-4 text-slate-700 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showUserMenu && (
              <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-accent-red hover:bg-white rounded-lg transition-colors"
                >
                  <Icons.logout className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.id === 'analytics' && isPro && (
                  <span className="ml-auto px-2 py-0.5 bg-yellow-400/20 text-yellow-700 text-xs font-black rounded-full">
                    PRO
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Social Links */}
        <div className="px-4 pb-2">
          <a
            href="https://instagram.com/catatin.duit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-700 rounded-xl hover:from-pink-500/20 hover:to-purple-500/20 transition-all border border-pink-200"
          >
            <Icons.instagram className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">Instagram</p>
              <p className="text-xs font-semibold opacity-80">@catatin.duit</p>
            </div>
          </a>
        </div>

        {/* Upgrade CTA */}
        {!isPro && (
          <div className="px-4 pb-6">
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Icons.crown className="w-5 h-5 text-amber-600" />
                <span className="font-black text-slate-900">Upgrade Pro</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mb-3">Fitur lengkap & tanpa batas</p>
              <button className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-black rounded-lg hover:opacity-95 transition-opacity shadow-lg shadow-orange-500/30">
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
      className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
      aria-label="Buka menu navigasi"
    >
      <Icons.menu className="w-6 h-6 text-slate-900" />
    </button>
  )
}
