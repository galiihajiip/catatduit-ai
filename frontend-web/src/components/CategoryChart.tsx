'use client'

import { CategoryBreakdown } from '@/lib/store'
import { formatCurrency, getCategoryIcon } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryChartProps {
  data: CategoryBreakdown[]
}

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <div className="bg-card rounded-card shadow-card p-5">
      <h3 className="text-base font-semibold text-text-primary mb-5">Pengeluaran per Kategori</h3>
      
      <div className="flex items-center gap-4">
        {/* Donut Chart */}
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={2}
                dataKey="percentage"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.colorHex} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.colorHex }}
              />
              <span className="text-sm text-text-primary flex-1 truncate">
                {getCategoryIcon(item.category)} {item.category}
              </span>
              <span className="text-xs text-text-secondary">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
