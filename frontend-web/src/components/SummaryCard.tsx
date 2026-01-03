'use client'

import { formatCurrency } from '@/lib/utils'
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react'

interface MonthlySummary {
  month: string
  totalIncome: number
  totalExpense: number
  netIncome: number
  expenseRatio: number
  savingRatio: number
}

interface SummaryCardProps {
  summary: MonthlySummary
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="bg-card rounded-card shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Ringkasan Bulan Ini</h3>
        <span className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded-full">
          {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Income */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <ArrowDownLeft className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Pemasukan</span>
          </div>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>
        
        {/* Expense */}
        <div className="bg-gradient-to-br from-accent-red/10 to-accent-red/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-accent-red/20 rounded-lg">
              <ArrowUpRight className="w-4 h-4 text-accent-red" />
            </div>
            <span className="text-sm font-medium text-accent-red">Pengeluaran</span>
          </div>
          <p className="text-lg font-bold text-accent-red">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </div>
      
      {/* Net Income */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${summary.netIncome >= 0 ? 'text-primary' : 'text-accent-red'}`} />
            <span className="text-sm text-text-secondary">Net Income</span>
          </div>
          <p className={`text-xl font-bold ${summary.netIncome >= 0 ? 'text-primary' : 'text-accent-red'}`}>
            {formatCurrency(summary.netIncome)}
          </p>
        </div>
        
        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-secondary">Rasio Pengeluaran</span>
              <span className="font-medium text-accent-orange">{summary.expenseRatio.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent-orange to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.expenseRatio, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-secondary">Rasio Tabungan</span>
              <span className="font-medium text-primary">{summary.savingRatio.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.savingRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
