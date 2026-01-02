'use client'

import { useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import Header from '@/components/Header'
import WalletCard, { AddWalletCard } from '@/components/WalletCard'
import SummaryCard from '@/components/SummaryCard'
import CategoryChart from '@/components/CategoryChart'
import TrendChart from '@/components/TrendChart'
import TransactionItem from '@/components/TransactionItem'
import { UpgradeModal } from '@/components/ProBadge'
import { demoData } from '@/lib/store'

export default function Home() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const isPro = false
  
  const totalBalance = demoData.wallets.reduce((sum, w) => sum + w.balance, 0)
  
  const categoryMap: Record<string, { name: string; color: string }> = {
    '1': { name: 'Makanan', color: '#E74C3C' },
    '2': { name: 'Transportasi', color: '#3498DB' },
    '3': { name: 'Tagihan', color: '#F39C12' },
    '8': { name: 'Pemasukan', color: '#16A085' },
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-background pb-24">
      {/* Header */}
      <Header
        totalBalance={totalBalance}
        isPro={isPro}
        onSettingsClick={() => setShowUpgradeModal(true)}
      />
      
      {/* Wallets Section */}
      <section className="px-5 mb-6">
        <h2 className="text-base font-semibold text-text-primary mb-3">Dompet</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {demoData.wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
          <AddWalletCard />
        </div>
      </section>
      
      {/* Summary Card */}
      <section className="px-5 mb-6">
        <SummaryCard summary={demoData.summary} />
      </section>
      
      {/* Category Chart */}
      <section className="px-5 mb-6">
        <CategoryChart data={demoData.categoryBreakdown} />
      </section>
      
      {/* Trend Chart */}
      <section className="px-5 mb-6">
        <TrendChart data={demoData.weeklyTrend} />
      </section>
      
      {/* Recent Transactions */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">Transaksi Terbaru</h2>
          <button className="flex items-center gap-1 text-sm text-primary">
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {demoData.transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              categoryName={categoryMap[tx.categoryId]?.name || 'Lainnya'}
              categoryColor={categoryMap[tx.categoryId]?.color || '#7F8C8D'}
            />
          ))}
        </div>
      </section>
      
      {/* FAB */}
      <button className="fixed bottom-6 right-6 bg-primary text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary-light transition-colors">
        <Plus className="w-5 h-5" />
        <span className="font-medium">Tambah</span>
      </button>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </main>
  )
}
