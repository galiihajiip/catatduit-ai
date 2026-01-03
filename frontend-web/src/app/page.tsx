'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronRight, MessageCircle, RefreshCw, Bell, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import Sidebar, { MobileNav } from '@/components/Sidebar'
import Header from '@/components/Header'
import WalletCard, { AddWalletCard } from '@/components/WalletCard'
import SummaryCard from '@/components/SummaryCard'
import CategoryChart from '@/components/CategoryChart'
import TransactionItem from '@/components/TransactionItem'
import { UpgradeModal } from '@/components/ProBadge'
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

const demoAnalytics: Analytics = {
  summary: {
    month: '2024-01',
    totalIncome: 12000000,
    totalExpense: 4500000,
    netIncome: 7500000,
    expenseRatio: 37.5,
    savingRatio: 62.5,
  },
  categoryBreakdown: [
    { category: 'Makanan', amount: 1800000, percentage: 40, colorHex: '#E74C3C' },
    { category: 'Transportasi', amount: 900000, percentage: 20, colorHex: '#3498DB' },
    { category: 'Tagihan', amount: 750000, percentage: 16.7, colorHex: '#F39C12' },
    { category: 'Belanja', amount: 600000, percentage: 13.3, colorHex: '#1ABC9C' },
    { category: 'Hiburan', amount: 450000, percentage: 10, colorHex: '#E91E63' },
  ],
  wallets: [
    { id: '1', name: 'Cash', balance: 2500000, color_hex: '#16A085', icon: 'wallet' },
    { id: '2', name: 'Bank BCA', balance: 15000000, color_hex: '#3498DB', icon: 'bank' },
  ],
  transactionCount: 25
}

const demoTransactions: Transaction[] = [
  { id: '1', type: 'expense', amount: 25000, description: 'Makan siang nasi padang', ai_confidence: 0.95, created_at: new Date().toISOString(), category: { name: 'Makanan', color_hex: '#E74C3C' } },
  { id: '2', type: 'income', amount: 12000000, description: 'Gaji bulanan', ai_confidence: 0.98, created_at: new Date().toISOString(), category: { name: 'Pemasukan', color_hex: '#16A085' } },
  { id: '3', type: 'expense', amount: 35000, description: 'Grab ke kantor', ai_confidence: 0.92, created_at: new Date().toISOString(), category: { name: 'Transportasi', color_hex: '#3498DB' } },
]

export default function Home() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [telegramId, setTelegramId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<Analytics>(demoAnalytics)
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions)
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tid = params.get('telegram_id')
    if (tid) {
      setTelegramId(tid)
      setIsDemo(false)
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
        setAnalytics(data)
      }
      
      if (txRes.ok) {
        const data = await txRes.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }
  
  const totalBalance = analytics.wallets.reduce((sum, w) => sum + w.balance, 0)
  const isPro = false

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isPro={isPro} />
      
      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Top Header - Desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-card border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'analytics' && 'Analytics'}
              {activeTab === 'wallets' && 'Dompet'}
              {activeTab === 'history' && 'Riwayat Transaksi'}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {isDemo ? 'Demo Mode - Hubungkan Telegram untuk data real' : `Telegram ID: ${telegramId}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isDemo && (
              <button 
                onClick={() => telegramId && fetchData(telegramId)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-text-primary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <Header
            totalBalance={totalBalance}
            isPro={isPro}
            onSettingsClick={() => setShowUpgradeModal(true)}
          />
        </div>

        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-accent-blue text-white px-4 py-3 text-center text-sm">
            <MessageCircle className="inline w-4 h-4 mr-2" />
            Demo Mode - <a href="https://t.me/catatduitgalih_bot" className="underline font-medium">Chat di Telegram</a> untuk mulai mencatat!
          </div>
        )}

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Stats Cards - Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Saldo" 
              value={formatCurrency(totalBalance)} 
              trend="+12.5%" 
              trendUp={true}
              icon={<Wallet className="w-6 h-6" />}
              color="primary"
            />
            <StatCard 
              title="Pemasukan Bulan Ini" 
              value={formatCurrency(analytics.summary.totalIncome)} 
              trend="+8.2%" 
              trendUp={true}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
            />
            <StatCard 
              title="Pengeluaran Bulan Ini" 
              value={formatCurrency(analytics.summary.totalExpense)} 
              trend="-3.1%" 
              trendUp={false}
              icon={<TrendingDown className="w-6 h-6" />}
              color="red"
            />
            <StatCard 
              title="Transaksi" 
              value={analytics.transactionCount.toString()} 
              trend="bulan ini" 
              trendUp={true}
              icon={<Calendar className="w-6 h-6" />}
              color="blue"
            />
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width on desktop */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallets Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Dompet</h2>
                  <button className="text-sm text-primary hover:underline">Kelola</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {analytics.wallets.map((wallet) => (
                    <WalletCard 
                      key={wallet.id} 
                      wallet={{
                        id: wallet.id,
                        name: wallet.name,
                        balance: wallet.balance,
                        colorHex: wallet.color_hex,
                        icon: wallet.icon
                      }} 
                    />
                  ))}
                  <AddWalletCard />
                </div>
              </section>

              {/* Summary Card - Mobile Only */}
              <div className="lg:hidden">
                <SummaryCard summary={analytics.summary} />
              </div>

              {/* Recent Transactions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Transaksi Terbaru</h2>
                  <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                    Lihat Semua
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                {transactions.length === 0 ? (
                  <div className="bg-card rounded-card p-8 text-center shadow-card">
                    <MessageCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">Belum ada transaksi</p>
                    <p className="text-sm text-text-secondary mt-1">Chat di Telegram untuk mulai mencatat!</p>
                    <a 
                      href="https://t.me/catatduitgalih_bot"
                      className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                    >
                      Buka Telegram Bot
                    </a>
                  </div>
                ) : (
                  <div className="bg-card rounded-card shadow-card divide-y divide-gray-50">
                    {transactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="p-4">
                        <TransactionItem
                          transaction={{
                            id: tx.id,
                            walletId: '',
                            categoryId: '',
                            type: tx.type,
                            amount: tx.amount,
                            description: tx.description,
                            aiConfidence: tx.ai_confidence,
                            createdAt: tx.created_at
                          }}
                          categoryName={tx.category?.name || 'Lainnya'}
                          categoryColor={tx.category?.color_hex || '#7F8C8D'}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column - 1/3 width on desktop */}
            <div className="space-y-6">
              {/* Summary Card - Desktop */}
              <div className="hidden lg:block">
                <SummaryCard summary={analytics.summary} />
              </div>

              {/* Category Chart */}
              {analytics.categoryBreakdown.length > 0 && (
                <CategoryChart data={analytics.categoryBreakdown} />
              )}

              {/* Telegram CTA Card */}
              <div className="bg-gradient-to-br from-accent-blue to-blue-600 rounded-card p-6 text-white">
                <MessageCircle className="w-10 h-10 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Catat via Telegram</h3>
                <p className="text-sm text-white/80 mb-4">
                  Cukup chat "beli bakso 15rb" dan transaksi langsung tercatat!
                </p>
                <a 
                  href="https://t.me/catatduitgalih_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center py-3 bg-white text-accent-blue font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  Buka @catatduitgalih_bot
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* FAB - Mobile Only */}
      <a 
        href="https://t.me/catatduitgalih_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden fixed bottom-20 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-light transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </a>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, trend, trendUp, icon, color }: {
  title: string
  value: string
  trend: string
  trendUp: boolean
  icon: React.ReactNode
  color: 'primary' | 'green' | 'red' | 'blue'
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-accent-red/10 text-accent-red',
    blue: 'bg-accent-blue/10 text-accent-blue',
  }
  
  return (
    <div className="bg-card rounded-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-accent-red'}`}>
          {trend}
        </span>
      </div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-semibold text-text-primary mt-1">{value}</p>
    </div>
  )
}

// Import Wallet icon for StatCard
import { Wallet } from 'lucide-react'
