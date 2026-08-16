'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  sales: number
  orders: number
}

interface SellerOrdersChartProps {
  data: { date: string; _sum: { totalAmount: number | null }; _count: { id: number } }[]
}

export function SellerOrdersChart({ data }: SellerOrdersChartProps) {
  const chartData: ChartData[] = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: item._sum.totalAmount || 0,
    orders: item._count.id,
  }))

  if (chartData.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">No sales data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
        <XAxis dataKey="date" className="text-xs fill-slate-500" />
        <YAxis className="text-xs fill-slate-500" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#0f172a"
          strokeWidth={2}
          dot={{ fill: '#0f172a', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
