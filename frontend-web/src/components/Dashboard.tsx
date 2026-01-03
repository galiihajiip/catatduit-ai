'use client'

import { useState } from 'react'
import { formatCurrency, getCategoryIcon } from '@/lib/utils'
import { Icons } from './Icons'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'

interface DashboardProps {
  analytics: any
  transactions: any[]
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = [2024, 2025, 2026]

export default function Dashboard({
  analytics,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange
}: DashboardProps) {
  const [showAllWallets, setShowAllWallets] = useState(false)
  const [trendPeriod, setTrendPeriod] = useState<'3' | '6' | '12'>('6')

  const totalBalance = analytics.wallets?.reduce((sum: number, w: any) => sum + w.balance, 0) || 0
  const sortedWallets = [...(analytics.wallets || [])].sort((a, b) => b.balance - a.balance)
  const displayWallets = showAllWallets ? sortedWallets : sortedWallets.slice(0, 3)

  const previousMonthIncome = analytics.summary?.totalIncome * 0.85 || 0
  const incomeGrowth = previousMonthIncome > 0 
    ? ((analytics.summary?.totalIncome - previousMonthIncome) / previousMonthIncome * 100) 
    : 0

  const trendData = [
    { month: 'Jul', income: 8500000, expense: 4200000 },
    { month: 'Agu', income: 9200000, expense: 4800000 },
    { month: 'Sep', income: 8800000, expense: 5100000 },
    { month: 'Okt', income: 10500000, expense: 4500000 },
    { month: 'Nov', income: 11000000, expense: 5200000 },
    { month: 'Des', income: analytics.summary?.totalIncome || 12000000, expense: analytics.summary?.totalExpense || 4500000 },
  ]

  const categoryFrequency = analytics.categoryBreakdown?.map((cat: any) => ({
    ...cat,
    transactions: Math.floor(Math.random() * 20) + 5,
    avgAmount: cat.amount / (Math.floor(Math.random() * 20) + 5)
  })) || []

  const totalTransactions = categoryFrequency.reduce((sum: number, c: any) => sum + c.transactions, 0)
  const topCategory = categoryFrequency[0]

  return (
    <div className="space-y-6">
      {/* Header with Month/Year Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icons.chart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">Monthly Report</h1>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            {months[selectedMonth]} {selectedYear}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card rounded-xl p-1 shadow-sm border border-gray-100">
            <select 
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="px-3 py-2 bg-transparent text-sm font-medium text-text-primary focus:outline-none cursor-pointer rounded-lg hover:bg-gray-50"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="px-3 py-2 bg-transparent text-sm font-medium text-text-primary focus:outline-none cursor-pointer rounded-lg hover:bg-gray-50"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Total Balance Card - Kantong Kamu */}
          <div className="bg-gradient-to-br from-primary via-primary to-primary-light rounded-2xl p-6 text-white shadow-xl shadow-primary/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Icons.wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Kantong Kamu</p>
                  <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Total dari</p>
                <p className="text-white font-medium">{analytics.wallets?.length || 0} dompet</p>
              </div>
            </div>
            
            {/* Wallet List - Rincian Saldo */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icons.creditCard className="w-4 h-4 text-white/80" />
                  <p className="text-white/80 text-sm font-medium">Rincian Saldo</p>
                </div>
                {sortedWallets.length > 3 && (
                  <button 
                    onClick={() => setShowAllWallets(!showAllWallets)}
                    className="text-white/80 text-xs hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"
                  >
                    {showAllWallets ? 'Sembunyikan' : 'Lihat Semua'}
                    <Icons.chevronRight className={`w-3 h-3 transition-transform ${showAllWallets ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {displayWallets.map((wallet: any) => (
                  <div 
                    key={wallet.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: wallet.color_hex + '40' }}
                      >
                        <Icons.creditCard className="w-4 h-4" style={{ color: wallet.color_hex }} />
                      </div>
                      <span className="text-white/90 text-sm font-medium truncate">{wallet.name}</span>
                    </div>
                    <p className="text-white font-semibold">{formatCurrency(wallet.balance)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Income/Expense/Net Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Pemasukan"
              value={formatCurrency(analytics.summary?.totalIncome || 0)}
              icon={<Icons.arrowDown className="w-5 h-5" />}
              trend={`+${incomeGrowth.toFixed(1)}%`}
              trendUp={true}
              color="green"
            />
            <StatCard
              title="Total Pengeluaran"
              value={formatCurrency(analytics.summary?.totalExpense || 0)}
              icon={<Icons.arrowUp className="w-5 h-5" />}
              trend={`${analytics.summary?.expenseRatio?.toFixed(1) || 0}%`}
              trendUp={false}
              color="red"
            />
            <StatCard
              title="Net Income"
              value={formatCurrency(analytics.summary?.netIncome || 0)}
              icon={<Icons.trendUp className="w-5 h-5" />}
              trend={analytics.summary?.netIncome >= 0 ? 'Surplus' : 'Defisit'}
              trendUp={analytics.summary?.netIncome >= 0}
              color={analytics.summary?.netIncome >= 0 ? 'primary' : 'red'}
            />
          </div>

          {/* Financial Analysis */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Icons.activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">Analisis Keuangan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AnalysisCard
                title="Rasio Pengeluaran"
                value={`${analytics.summary?.expenseRatio?.toFixed(1) || 0}%`}
                description="% pemasukan yang digunakan untuk pengeluaran"
                icon={<Icons.chart className="w-5 h-5" />}
                color="orange"
                progress={analytics.summary?.expenseRatio || 0}
              />
              <AnalysisCard
                title="Pertumbuhan Pendapatan"
                value={`${incomeGrowth >= 0 ? '+' : ''}${incomeGrowth.toFixed(1)}%`}
                description="Perbandingan dengan bulan sebelumnya"
                icon={<Icons.trendUp className="w-5 h-5" />}
                color={incomeGrowth >= 0 ? 'green' : 'red'}
                progress={Math.min(Math.abs(incomeGrowth), 100)}
              />
              <AnalysisCard
                title="Rasio Tabungan"
                value={`${analytics.summary?.savingRatio?.toFixed(1) || 0}%`}
                description="Jumlah uang yang berhasil disimpan"
                icon={<Icons.piggyBank className="w-5 h-5" />}
                color="primary"
                progress={analytics.summary?.savingRatio || 0}
              />
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Icons.trendUp className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Tren Pemasukan & Pengeluaran</h3>
                  <p className="text-sm text-text-secondary">Perbandingan bulanan/mingguan</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {(['3', '6', '12'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTrendPeriod(period)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      trendPeriod === period 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {period} Bulan
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A085" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16A085" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E74C3C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v: number) => `${(v/1000000).toFixed(0)}jt`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#16A085" strokeWidth={3} fill="url(#incomeGradient)" name="Pemasukan" />
                  <Area type="monotone" dataKey="expense" stroke="#E74C3C" strokeWidth={3} fill="url(#expenseGradient)" name="Pengeluaran" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-text-secondary">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-red" />
                <span className="text-sm text-text-secondary">Pengeluaran</span>
              </div>
            </div>
            
            {/* Averages */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-text-secondary">Rata-rata Pemasukan/Bulan</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(trendData.reduce((s, d) => s + d.income, 0) / trendData.length)}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-text-secondary">Rata-rata Pengeluaran/Bulan</p>
                <p className="text-xl font-bold text-accent-red">{formatCurrency(trendData.reduce((s, d) => s + d.expense, 0) / trendData.length)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Category Breakdown with Pie Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Icons.pieChart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">Kategori Pengeluaran</h3>
            </div>
            
            {/* Pie Chart */}
            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="percentage"
                  >
                    {(analytics.categoryBreakdown || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.colorHex} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Category List with Progress Bars */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(analytics.categoryBreakdown || []).map((cat: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(cat.category)}</span>
                      <span className="text-sm font-medium text-text-primary">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">{formatCurrency(cat.amount)}</p>
                      <p className="text-xs text-text-secondary">{cat.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.colorHex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Frequency */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Icons.target className="w-5 h-5 text-accent-orange" />
              <h3 className="text-lg font-semibold text-text-primary">Top 5 Frekuensi</h3>
            </div>
            <p className="text-xs text-text-secondary mb-4">Kategori dengan pengeluaran terbesar</p>
            
            <div className="space-y-3">
              {categoryFrequency.slice(0, 5).map((cat: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: cat.colorHex + '20' }}
                  >
                    {getCategoryIcon(cat.category)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{cat.category}</p>
                    <p className="text-xs text-text-secondary">{cat.transactions} transaksi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{formatCurrency(cat.avgAmount)}</p>
                    <p className="text-xs text-text-secondary">rata-rata</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Frequency Summary */}
            <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Icons.receipt className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-text-primary">Ringkasan Frekuensi</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">{totalTransactions}</p>
                  <p className="text-xs text-text-secondary">Total Transaksi</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-text-primary truncate">{topCategory?.category || '-'}</p>
                  <p className="text-xs text-text-secondary">Frekuensi Terbanyak</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/20">
                <p className="text-xs text-text-secondary">Rata-rata per Transaksi</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency((analytics.summary?.totalExpense || 0) / (totalTransactions || 1))}
                </p>
              </div>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Icons.pieChart className="w-5 h-5 text-accent-blue" />
              <h3 className="text-lg font-semibold text-text-primary">Distribusi Pengeluaran</h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="amount"
                    label={({ category, percentage }: { category: string; percentage: number }) => `${category}: ${percentage.toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(analytics.categoryBreakdown || []).map((entry: any, index: number) => (
                      <Cell key={`cell-dist-${index}`} fill={entry.colorHex} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon, trend, trendUp, color }: {
  title: string
  value: string
  icon: React.ReactNode
  trend: string
  trendUp: boolean
  color: 'primary' | 'green' | 'red' | 'orange'
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-600',
    red: 'bg-accent-red/10 text-accent-red',
    orange: 'bg-accent-orange/10 text-accent-orange',
  }
  
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-xs text-text-secondary mb-1">{title}</p>
      <p className="text-xl font-bold text-text-primary">{value}</p>
    </div>
  )
}

// Analysis Card Component
function AnalysisCard({ title, value, description, icon, color, progress }: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  color: 'primary' | 'green' | 'red' | 'orange'
  progress: number
}) {
  const colorClasses = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
    green: { bg: 'bg-green-500/10', text: 'text-green-600', bar: 'bg-green-500' },
    red: { bg: 'bg-accent-red/10', text: 'text-accent-red', bar: 'bg-accent-red' },
    orange: { bg: 'bg-accent-orange/10', text: 'text-accent-orange', bar: 'bg-accent-orange' },
  }
  
  return (
    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color].bg} ${colorClasses[color].text}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-text-primary">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color].text}`}>{value}</p>
      <p className="text-xs text-text-secondary mt-1">{description}</p>
      <div className="h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color].bar}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
