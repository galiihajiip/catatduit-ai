'use client'

import { formatCurrency } from '@/lib/utils'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

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
    <div className="bg-card rounded-card shadow-card p-5">
      <h3 className="text-base font-semibold text-text-primary mb-5">Ringkasan Bulan Ini</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Income */}
        <div className="bg-primary/10 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-2">
            <ArrowDownLeft className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary">Pemasukan</span>
          </div>
          <p className="text-sm font-semibold text-primary">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>
        
        {/* Expense */}
        <div className="bg-accent-red/10 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-2">
            <ArrowUpRight className="w-4 h-4 text-accent-red" />
            <span className="text-xs text-accent-red">Pengeluaran</span>
          </div>
          <p className="text-sm font-semibold text-accent-red">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">Net Income</p>
            <p className={`text-lg font-semibold ${summary.netIncome >= 0 ? 'text-primary' : 'text-accent-red'}`}>
              {formatCurrency(summary.netIncome)}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-2 py-1 bg-accent-orange/10 rounded-lg">
              <span className="text-xs font-semibold text-accent-orange">
                {summary.expenseRatio.toFixed(1)}%
              </span>
            </div>
            <div className="px-2 py-1 bg-primary/10 rounded-lg">
              <span className="text-xs font-semibold text-primary">
                {summary.savingRatio.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
