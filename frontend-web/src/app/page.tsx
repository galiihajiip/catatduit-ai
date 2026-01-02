'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronRight, MessageCircle, RefreshCw } from 'lucide-react'
import Header from '@/components/Header'
import WalletCard, { AddWalletCard } from '@/components/WalletCard'
import SummaryCard from '@/components/SummaryCard'
import CategoryChart from '@/components/CategoryChart'
import TransactionItem from '@/components/TransactionItem'
import { UpgradeModal } from '@/components/ProBadge'

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

// Demo data for when no telegram_id
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
  const [telegramId, setTelegramId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<Analytics>(demoAnalytics)
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions)
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  
  useEffect(() => {
    // Check URL params for telegram_id
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

  return (
    <main className="max-w-md mx-auto min-h-screen bg-background pb-24">
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-accent-blue text-white px-4 py-3 text-center text-sm">
          <MessageCircle className="inline w-4 h-4 mr-2" />
          Demo Mode - Chat di Telegram untuk mulai mencatat!
        </div>
      )}
      
      {/* Header */}
      <Header
        totalBalance={totalBalance}
        isPro={false}
        onSettingsClick={() => setShowUpgradeModal(true)}
      />
      
      {/* Refresh Button */}
      {!isDemo && (
        <div className="px-5 mb-4">
          <button 
            onClick={() => telegramId && fetchData(telegramId)}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      )}
      
      {/* Wallets Section */}
      <section className="px-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-3">Dompet</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
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
      
      {/* Summary Card */}
      <section className="px-5 mb-6">
        <SummaryCard summary={analytics.summary} />
      </section>
      
      {/* Category Chart */}
      {analytics.categoryBreakdown.length > 0 && (
        <section className="px-5 mb-6">
          <CategoryChart data={analytics.categoryBreakdown} />
        </section>
      )}
      
      {/* Recent Transactions */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">Transaksi Terbaru</h2>
          <button className="flex items-center gap-1 text-sm text-primary">
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {transactions.length === 0 ? (
          <div className="bg-card rounded-card p-8 text-center">
            <MessageCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">Belum ada transaksi</p>
            <p className="text-sm text-text-secondary mt-1">Chat di Telegram untuk mulai mencatat!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <TransactionItem
                key={tx.id}
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
            ))}
          </div>
        )}
      </section>
      
      {/* Telegram CTA */}
      <section className="px-5 mb-6">
        <a 
          href="https://t.me/CatatDuitAIBot"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-accent-blue text-white rounded-card p-4 text-center hover:bg-accent-blue/90 transition-colors"
        >
          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Buka Telegram Bot</p>
          <p className="text-sm text-white/80">Mulai catat keuangan dengan chat!</p>
        </a>
      </section>
      
      {/* FAB */}
      <a 
        href="https://t.me/CatatDuitAIBot"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-primary text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary-light transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Tambah</span>
      </a>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </main>
  )
}
