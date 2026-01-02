'use client'

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface TrendData {
  week: string
  income: number
  expense: number
}

interface TrendChartProps {
  data: TrendData[]
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="bg-card rounded-card shadow-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-text-primary">Tren Mingguan</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-text-secondary">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent-red" />
            <span className="text-xs text-text-secondary">Pengeluaran</span>
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#7F8C8D' }}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#16A085"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#E74C3C"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
