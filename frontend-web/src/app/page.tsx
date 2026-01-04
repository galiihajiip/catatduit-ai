'use client'

import { useState, useEffect } from 'react'
import Sidebar, { HamburgerButton } from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import LoginPage from '@/components/LoginPage'
import ReceiptScanner from '@/components/ReceiptScanner'
import { UpgradeModal } from '@/components/ProBadge'
import { Icons } from '@/components/Icons'
import { formatCurrency } from '@/lib/utils'

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
  const [telegramId, setTelegramId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const isPro = false

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tid = params.get('telegram_id') || localStorage.getItem('telegram_id')
    const name = localStorage.getItem('user_name') || 'User'
    
    if (tid) {
      setTelegramId(tid)
      setUserName(name)
      setIsLoggedIn(true)
      fetchData(tid)
    }
  }, [])

  const fetchData = async (tid: string) => {
    setLoading(true)
    try {
      const [analyticsRes, txRes] = await Promise.all([
        fetch(`/api/analytics?telegram_id=${tid}`),
        fetch(`/api/transactions?telegram_id=${tid}`)
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

  const handleLogin = (tid: string) => {
    setTelegramId(tid)
    localStorage.setItem('telegram_id', tid)
    setIsLoggedIn(true)
    window.history.pushState({}, '', `?telegram_id=${tid}`)
    fetchData(tid)
  }

  const handleLogout = () => {
    setTelegramId(null)
    setIsLoggedIn(false)
    setAnalytics(emptyAnalytics)
    setTransactions([])
    localStorage.removeItem('telegram_id')
    localStorage.removeItem('user_name')
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
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isPro={isPro}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userName={userName}
        telegramId={telegramId || undefined}
        onLogout={handleLogout}
      />
      
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setSidebarOpen(true)} />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-primary">{pageTitle.icon}</span>
                <h1 className="text-lg font-semibold text-text-primary">{pageTitle.text}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => telegramId && fetchData(telegramId)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                <Icons.refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <a
                href="https://t.me/caborin_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm bg-accent-blue/10 text-accent-blue rounded-xl hover:bg-accent-blue/20 transition-colors"
              >
                <Icons.telegram className="w-4 h-4" />
                <span className="hidden sm:inline">Telegram</span>
              </a>
              
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                <Icons.bell className="w-5 h-5 text-text-secondary" />
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
            />
          )}
          
          {activeTab === 'wallets' && (
            <WalletsPage wallets={analytics.wallets} />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsPage analytics={analytics} />
          )}
          
          {activeTab === 'history' && (
            <HistoryPage transactions={transactions} />
          )}
          
          {activeTab === 'settings' && (
            <SettingsPage telegramId={telegramId} onLogout={handleLogout} />
          )}
        </div>
      </main>
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      
      {/* Receipt Scanner FAB */}
      {isLoggedIn && telegramId && (
        <ReceiptScanner 
          telegramId={telegramId} 
          onSuccess={() => fetchData(telegramId)}
        />
      )}
    </div>
  )
}

// Wallets Page Component
function WalletsPage({ wallets }: { wallets: any[] }) {
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sortedWallets = [...wallets].sort((a, b) => b.balance - a.balance)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icons.wallet className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">Dompet Saya</h1>
          </div>
          <p className="text-text-secondary">Kelola semua dompet Anda</p>
        </div>
        <a
          href="https://t.me/caborin_bot"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors w-fit"
        >
          <Icons.plus className="w-4 h-4" />
          Tambah via Telegram
        </a>
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
            className="bg-card rounded-2xl p-5 shadow-card hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: wallet.color_hex + '20' }}
              >
                <Icons.creditCard className="w-6 h-6" style={{ color: wallet.color_hex }} />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-text-secondary">
                #{index + 1}
              </span>
            </div>
            <p className="text-text-secondary text-sm">{wallet.name}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(wallet.balance)}</p>
          </div>
        ))}
      </div>
      
      {wallets.length === 0 && (
        <div className="bg-card rounded-2xl p-8 text-center">
          <Icons.creditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-text-secondary">Belum ada dompet</p>
          <p className="text-sm text-text-secondary mt-2">
            Gunakan perintah <code className="bg-gray-100 px-2 py-1 rounded">/addwallet [nama]</code> di Telegram
          </p>
        </div>
      )}
      
      <div className="bg-accent-blue/10 rounded-xl p-4 flex items-center gap-3">
        <Icons.messageCircle className="w-5 h-5 text-accent-blue flex-shrink-0" />
        <p className="text-accent-blue text-sm">
          Gunakan perintah <code className="bg-white px-2 py-1 rounded">/addwallet [nama]</code> di Telegram untuk menambah dompet baru
        </p>
      </div>
    </div>
  )
}

// Analytics Page Component
function AnalyticsPage({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icons.pieChart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Analisis Keuangan</h1>
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
          <h1 className="text-2xl font-bold text-text-primary">Riwayat Transaksi</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === f 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-card rounded-2xl shadow-card divide-y divide-gray-50">
        {filteredTx.length === 0 ? (
          <div className="p-8 text-center">
            <Icons.receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-text-secondary">Belum ada transaksi</p>
          </div>
        ) : (
          filteredTx.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
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
                <p className="font-medium text-text-primary truncate">{tx.description}</p>
                <p className="text-sm text-text-secondary">{tx.category?.name || 'Lainnya'}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'income' ? 'text-primary' : 'text-accent-red'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-text-secondary">
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
function SettingsPage({ telegramId, onLogout }: { telegramId: string | null; onLogout: () => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Icons.settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Pengaturan</h1>
      </div>
      
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Icons.user className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text-primary">Akun</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-text-secondary">Telegram ID</span>
            <span className="font-medium text-text-primary font-mono bg-gray-100 px-3 py-1 rounded">{telegramId}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-text-secondary">Status</span>
            <span className="font-medium text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">Free Plan</span>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Icons.telegram className="w-5 h-5 text-accent-blue" />
          <h3 className="font-semibold text-text-primary">Integrasi</h3>
        </div>
        <a
          href="https://t.me/caborin_bot"
          target="_blank"
          className="flex items-center gap-3 p-4 bg-accent-blue/10 rounded-xl hover:bg-accent-blue/20 transition-colors"
        >
          <Icons.telegram className="w-8 h-8 text-accent-blue" />
          <div>
            <p className="font-medium text-text-primary">Telegram Bot</p>
            <p className="text-sm text-text-secondary">@caborin_bot</p>
          </div>
          <Icons.chevronRight className="w-5 h-5 ml-auto text-accent-blue" />
        </a>
      </div>
      
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Icons.close className="w-5 h-5 text-accent-red" />
          <h3 className="font-semibold text-text-primary">Zona Bahaya</h3>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-3 bg-accent-red/10 text-accent-red font-medium rounded-xl hover:bg-accent-red/20 transition-colors flex items-center justify-center gap-2"
        >
          <Icons.logout className="w-4 h-4" />
          Keluar dari Akun
        </button>
      </div>
    </div>
  )
}
