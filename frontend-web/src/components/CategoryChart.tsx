'use client'

import { formatCurrency, getCategoryIcon } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  colorHex: string
}

interface CategoryChartProps {
  data: CategoryBreakdown[]
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) return null
  
  return (
    <div className="bg-card rounded-card shadow-card p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Pengeluaran per Kategori</h3>
      
      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="w-48 h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="percentage"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.colorHex}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '8px 12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="w-full space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.colorHex }}
              />
              <span className="text-sm text-text-primary flex-1">
                {getCategoryIcon(item.category)} {item.category}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
