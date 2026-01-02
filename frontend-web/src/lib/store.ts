import { create } from 'zustand'

export interface Wallet {
  id: string
  name: string
  balance: number
  colorHex: string
  icon: string
}

export interface Transaction {
  id: string
  walletId: string
  categoryId: string
  type: 'expense' | 'income' | 'transfer'
  amount: number
  description: string
  aiConfidence?: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  colorHex: string
  icon: string
  type: string
}

export interface MonthlySummary {
  month: string
  totalIncome: number
  totalExpense: number
  netIncome: number
  expenseRatio: number
  savingRatio: number
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  colorHex: string
}

interface AppState {
  wallets: Wallet[]
  transactions: Transaction[]
  categories: Category[]
  summary: MonthlySummary | null
  categoryBreakdown: CategoryBreakdown[]
  isPro: boolean
  isLoading: boolean
  setWallets: (wallets: Wallet[]) => void
  setTransactions: (transactions: Transaction[]) => void
  setCategories: (categories: Category[]) => void
  setSummary: (summary: MonthlySummary) => void
  setCategoryBreakdown: (breakdown: CategoryBreakdown[]) => void
  setIsPro: (isPro: boolean) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  wallets: [],
  transactions: [],
  categories: [],
  summary: null,
  categoryBreakdown: [],
  isPro: false,
  isLoading: true,
  setWallets: (wallets) => set({ wallets }),
  setTransactions: (transactions) => set({ transactions }),
  setCategories: (categories) => set({ categories }),
  setSummary: (summary) => set({ summary }),
  setCategoryBreakdown: (categoryBreakdown) => set({ categoryBreakdown }),
  setIsPro: (isPro) => set({ isPro }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))

// Demo data for preview
export const demoData = {
  wallets: [
    { id: '1', name: 'Cash', balance: 2500000, colorHex: '#16A085', icon: 'wallet' },
    { id: '2', name: 'Bank BCA', balance: 15000000, colorHex: '#3498DB', icon: 'bank' },
    { id: '3', name: 'GoPay', balance: 500000, colorHex: '#00AA13', icon: 'phone' },
  ],
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
  transactions: [
    { id: '1', walletId: '1', categoryId: '1', type: 'expense' as const, amount: 25000, description: 'Makan siang nasi padang', aiConfidence: 0.95, createdAt: '2024-01-15T12:30:00Z' },
    { id: '2', walletId: '2', categoryId: '8', type: 'income' as const, amount: 12000000, description: 'Gaji bulanan', aiConfidence: 0.98, createdAt: '2024-01-15T09:00:00Z' },
    { id: '3', walletId: '3', categoryId: '2', type: 'expense' as const, amount: 35000, description: 'Grab ke kantor', aiConfidence: 0.92, createdAt: '2024-01-15T08:00:00Z' },
    { id: '4', walletId: '1', categoryId: '1', type: 'expense' as const, amount: 50000, description: 'Ngopi di Starbucks', aiConfidence: 0.89, createdAt: '2024-01-14T15:00:00Z' },
    { id: '5', walletId: '2', categoryId: '3', type: 'expense' as const, amount: 350000, description: 'Bayar listrik PLN', aiConfidence: 0.97, createdAt: '2024-01-14T10:00:00Z' },
  ],
  weeklyTrend: [
    { week: 'Week 1', income: 3000000, expense: 1200000 },
    { week: 'Week 2', income: 3000000, expense: 1100000 },
    { week: 'Week 3', income: 3000000, expense: 1300000 },
    { week: 'Week 4', income: 3000000, expense: 900000 },
  ],
}
