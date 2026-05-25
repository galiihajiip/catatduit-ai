'use client'

import { useState, useEffect } from 'react'
import Sidebar, { HamburgerButton } from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import LoginPage from '@/components/LoginPage'
import ReceiptScanner from '@/components/ReceiptScanner'
import AddWalletModal from '@/components/AddWalletModal'
import { UpgradeModal } from '@/components/ProBadge'
import { Icons } from '@/components/Icons'
import { formatCurrency } from '@/lib/utils'
import { DEMO_ACCOUNT } from '@/lib/demo-auth'

interface Analytics {
  summary: {
    month: string
    totalIncome: number
    totalExpense: number
    netIncome: number
    expenseRatio: number
    savingRatio: number
  }
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
    colorHex: string
  }>
  wallets: Array<{
    id: string
    name: string
    balance: number
    color_hex: string
    icon: string
  }>
  transactionCount: number
}

interface Transaction {
  id: string
  type: 'expense' | 'income' | 'transfer'
  amount: number
  description: string
  ai_confidence: number
  created_at: string
  category: { name: string; color_hex: string }
}

const emptyAnalytics: Analytics = {
  summary: {
    month: new Date().toISOString().slice(0, 7),
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    expenseRatio: 0,
    savingRatio: 0,
  },
  categoryBreakdown: [],
  wallets: [],
  transactionCount: 0
}

export default function Home() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [connectivityWarning, setConnectivityWarning] = useState<string | null>(null)
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const isPro = false

  useEffect(() => {
    const uid = localStorage.getItem('demo_user_id')
    const name = localStorage.getItem('demo_user_name') || DEMO_ACCOUNT.displayName
    
    if (uid) {
      setUserId(uid)
      setUserName(name)
      setIsLoggedIn(true)
      setConnectivityWarning(sessionStorage.getItem('demo_connectivity_warning'))
      fetchData(uid)
    }
  }, [])

  const fetchData = async (uid: string) => {
    setLoading(true)
    try {
      const [analyticsRes, txRes] = await Promise.all([
        fetch(`/api/analytics?user_id=${uid}`),
        fetch(`/api/transactions?user_id=${uid}`)
      ])
      
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        if (!data.error) {
          setAnalytics(data)
        }
      }
      
      if (txRes.ok) {
        const data = await txRes.json()
        if (!data.error) {
          setTransactions(data.transactions || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  const handleLogin = (uid: string, name: string) => {
    setUserId(uid)
    setUserName(name)
    localStorage.setItem('demo_user_id', uid)
    localStorage.setItem('demo_user_name', name)
    setConnectivityWarning(sessionStorage.getItem('demo_connectivity_warning'))
    setIsLoggedIn(true)
    window.history.pushState({}, '', '/')
    fetchData(uid)
  }

  const handleLogout = () => {
    setUserId(null)
    setIsLoggedIn(false)
    setAnalytics(emptyAnalytics)
    setTransactions([])
    localStorage.removeItem('demo_user_id')
    localStorage.removeItem('demo_user_name')
    sessionStorage.removeItem('demo_connectivity_warning')
    setConnectivityWarning(null)
    window.history.pushState({}, '', '/')
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { icon: <Icons.home className="w-5 h-5" />, text: 'Dashboard' }
      case 'wallets': return { icon: <Icons.wallet className="w-5 h-5" />, text: 'Dompet' }
      case 'analytics': return { icon: <Icons.pieChart className="w-5 h-5" />, text: 'Analisis' }
      case 'history': return { icon: <Icons.history className="w-5 h-5" />, text: 'Riwayat' }
      case 'settings': return { icon: <Icons.settings className="w-5 h-5" />, text: 'Pengaturan' }
      default: return { icon: <Icons.home className="w-5 h-5" />, text: 'Dashboard' }
    }
  }

  const pageTitle = getPageTitle()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isPro={isPro}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userName={userName}
        userId={userId || undefined}
        onLogout={handleLogout}
      />
      
      <main className="lg:pl-72">
        {connectivityWarning && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 lg:pl-8">
            {connectivityWarning}
          </div>
        )}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b-2 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setSidebarOpen(true)} />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-primary">{pageTitle.icon}</span>
                <h1 className="text-lg font-black text-slate-900">{pageTitle.text}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => userId && fetchData(userId)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-800 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors border border-slate-200"
              >
                <Icons.refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors relative border border-slate-200" aria-label="Notifikasi">
                <Icons.bell className="w-5 h-5 text-slate-800" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              analytics={analytics}
              transactions={transactions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onRefresh={() => userId && fetchData(userId)}
              userId={userId || undefined}
            />
          )}
          
          {activeTab === 'wallets' && (
            <WalletsPage 
              wallets={analytics.wallets} 
              userId={userId || undefined}
              onRefresh={() => userId && fetchData(userId)}
            />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsPage analytics={analytics} />
          )}
          
          {activeTab === 'history' && (
            <HistoryPage transactions={transactions} />
          )}
          
          {activeTab === 'settings' && (
            <SettingsPage userId={userId} onLogout={handleLogout} />
          )}
        </div>
      </main>
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      
      {/* Receipt Scanner FAB */}
      {isLoggedIn && userId && (
        <ReceiptScanner 
          userId={userId} 
          onSuccess={() => fetchData(userId)}
        />
      )}
    </div>
  )
}

// Wallets Page Component
function WalletsPage({ wallets, userId, onRefresh }: { wallets: any[], userId?: string, onRefresh?: () => void }) {
  const [showAddWalletModal, setShowAddWalletModal] = useState(false)
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sortedWallets = [...wallets].sort((a, b) => b.balance - a.balance)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icons.wallet className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-black text-slate-900">Dompet Saya</h1>
          </div>
          <p className="text-slate-700 font-semibold">Kelola semua dompet Anda</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddWalletModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
          >
            <Icons.plus className="w-4 h-4" />
            Tambah Wallet
          </button>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 text-white shadow-xl shadow-primary/30">
        <div className="flex items-center gap-2 text-white/80">
          <Icons.dollarSign className="w-5 h-5" />
          <p>Total Saldo Semua Dompet</p>
        </div>
        <p className="text-4xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
        <p className="text-white/60 text-sm mt-2">{wallets.length} dompet terdaftar</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedWallets.map((wallet, index) => (
          <div
            key={wallet.id}
            className="bg-white rounded-2xl p-5 shadow-card border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: wallet.color_hex + '20' }}
              >
                <Icons.creditCard className="w-6 h-6" style={{ color: wallet.color_hex }} />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-full text-slate-700">
                #{index + 1}
              </span>
            </div>
            <p className="text-slate-700 text-sm font-semibold">{wallet.name}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(wallet.balance)}</p>
          </div>
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Icons.creditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-900 font-bold">Belum ada dompet</p>
          <p className="text-sm text-slate-700 font-medium mt-2">
            Klik tombol Tambah Wallet untuk membuat dompet pertama.
          </p>
        </div>
      )}

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <Icons.messageCircle className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-primary text-sm font-bold">
          Demo mode: dompet dibuat langsung dari dashboard dan tersimpan ke Supabase.
        </p>
      </div>
      
      {/* Add Wallet Modal */}
      {showAddWalletModal && userId && (
        <AddWalletModal
          userId={userId}
          onClose={() => setShowAddWalletModal(false)}
          onSuccess={() => {
            setShowAddWalletModal(false)
            onRefresh?.()
          }}
        />
      )}
    </div>
  )
}

// Analytics Page Component
function AnalyticsPage({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icons.pieChart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-black text-slate-900">Analisis Keuangan</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Icons.arrowDown className="w-4 h-4 text-primary" />
            <p className="text-text-secondary text-sm">Total Pemasukan</p>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(analytics.summary.totalIncome)}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Icons.arrowUp className="w-4 h-4 text-accent-red" />
            <p className="text-text-secondary text-sm">Total Pengeluaran</p>
          </div>
          <p className="text-2xl font-bold text-accent-red">{formatCurrency(analytics.summary.totalExpense)}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Icons.trendUp className="w-4 h-4 text-accent-blue" />
            <p className="text-text-secondary text-sm">Net Income</p>
          </div>
          <p className={`text-2xl font-bold ${analytics.summary.netIncome >= 0 ? 'text-primary' : 'text-accent-red'}`}>
            {formatCurrency(analytics.summary.netIncome)}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Icons.piggyBank className="w-4 h-4 text-accent-orange" />
            <p className="text-text-secondary text-sm">Rasio Tabungan</p>
          </div>
          <p className="text-2xl font-bold text-accent-orange">{analytics.summary.savingRatio.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Icons.chart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">Breakdown Kategori</h3>
        </div>
        <div className="space-y-3">
          {analytics.categoryBreakdown.map((cat, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: cat.colorHex }}
              />
              <span className="flex-1 text-text-primary">{cat.category}</span>
              <span className="font-medium text-text-primary">{formatCurrency(cat.amount)}</span>
              <span className="text-text-secondary text-sm w-16 text-right">{cat.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// History Page Component  
function HistoryPage({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  
  const filteredTx = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.type === filter
  })
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icons.history className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black text-slate-900">Riwayat Transaksi</h1>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${
                filter === f
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 divide-y divide-slate-100">
        {filteredTx.length === 0 ? (
          <div className="p-8 text-center">
            <Icons.receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-900 font-bold">Belum ada transaksi</p>
          </div>
        ) : (
          filteredTx.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: (tx.category?.color_hex || '#7F8C8D') + '20' }}
              >
                {tx.type === 'income' ? (
                  <Icons.arrowDown className="w-5 h-5 text-primary" />
                ) : (
                  <Icons.arrowUp className="w-5 h-5 text-accent-red" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{tx.description}</p>
                <p className="text-sm text-slate-700 font-semibold">{tx.category?.name || 'Lainnya'}</p>
              </div>
              <div className="text-right">
                <p className={`font-black ${tx.type === 'income' ? 'text-primary' : 'text-accent-red'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-slate-600 font-semibold">
                  {new Date(tx.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Settings Page Component
function SettingsPage({ userId, onLogout }: { userId: string | null; onLogout: () => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Icons.settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-black text-slate-900">Pengaturan</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Icons.user className="w-5 h-5 text-primary" />
          <h3 className="font-black text-slate-900">Akun</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <span className="text-slate-700 font-semibold">Demo User ID</span>
            <span className="font-bold text-slate-900 font-mono bg-slate-100 px-3 py-1 rounded border border-slate-200">{userId}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-200">
            <span className="text-slate-700 font-semibold">Status</span>
            <span className="font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full text-sm">Free Plan</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <Icons.alertCircle className="w-5 h-5 text-accent-red" />
          <h3 className="font-black text-slate-900">Zona Bahaya</h3>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-3 bg-accent-red/10 border border-accent-red/30 text-accent-red font-bold rounded-xl hover:bg-accent-red/20 transition-colors flex items-center justify-center gap-2"
        >
          <Icons.logout className="w-4 h-4" />
          Keluar dari Akun
        </button>
      </div>
    </div>
  )
}
