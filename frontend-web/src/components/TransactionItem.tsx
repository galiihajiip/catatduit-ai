'use client'

import { formatCurrency, formatDate, getCategoryIcon } from '@/lib/utils'

interface Transaction {
  id: string
  walletId: string
  categoryId: string
  type: 'expense' | 'income' | 'transfer'
  amount: number
  description: string
  aiConfidence?: number
  createdAt: string
}

interface TransactionItemProps {
  transaction: Transaction
  categoryName: string
  categoryColor: string
}

export default function TransactionItem({ transaction, categoryName, categoryColor }: TransactionItemProps) {
  const isExpense = transaction.type === 'expense'
  
  return (
    <div className="flex items-center gap-4">
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${categoryColor}15` }}
      >
        {getCategoryIcon(categoryName)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {transaction.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-text-secondary">
            {formatDate(transaction.createdAt)}
          </p>
          {transaction.aiConfidence && (
            <span className="px-1.5 py-0.5 bg-accent-blue/10 rounded text-[10px] font-medium text-accent-blue">
              AI {(transaction.aiConfidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      
      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${isExpense ? 'text-accent-red' : 'text-primary'}`}>
          {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-text-secondary mt-0.5">{categoryName}</p>
      </div>
    </div>
  )
}
