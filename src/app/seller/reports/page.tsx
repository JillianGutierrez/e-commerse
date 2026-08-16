'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { BarChart3, Calendar, DollarSign, TrendingUp, ShoppingBag, XCircle, Wallet, Sparkles } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ReportData {
  summary: {
    totalSales: number
    totalCommission: number
    totalOrders: number
    deliveredOrders: number
    cancelledOrders: number
    netProfit: number
  }
  orders: any[]
  salesChartData: { date: string; sales: number; orders: number }[]
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fromDate) params.set('from', fromDate)
      if (toDate) params.set('to', toDate)
      const res = await fetch(`/api/seller/reports?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
      } else {
        toast.error('Failed to load reports')
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleApplyDateFilter = () => {
    fetchReport()
  }

  const clearDateFilter = () => {
    setFromDate('')
    setToDate('')
    fetchReport()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Analytics</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Sales Reports</h1>
            <p className="text-neutral-600 mt-2">Analyze your sales performance</p>
          </div>
          <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3 py-2 bg-white">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border-0 p-0 h-auto text-sm"
            />
            <span className="text-neutral-400">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border-0 p-0 h-auto text-sm"
            />
            <Button size="sm" onClick={handleApplyDateFilter} className="rounded-full bg-black text-white hover:bg-neutral-800">
              Apply
            </Button>
            {(fromDate || toDate) && (
              <Button size="sm" variant="ghost" onClick={clearDateFilter}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report ? formatCurrency(report.summary.totalSales) : '-'}</div>
            <p className="text-xs text-neutral-500 mt-1">{report?.summary.totalOrders || 0} total orders</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report ? formatCurrency(report.summary.netProfit) : '-'}</div>
            <p className="text-xs text-neutral-500 mt-1">After commission</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Delivered</CardTitle>
            <ShoppingBag className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.summary.deliveredOrders || 0}</div>
            <p className="text-xs text-neutral-500 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.summary.cancelledOrders || 0}</div>
            <p className="text-xs text-neutral-500 mt-1">Cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Daily sales over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-neutral-500">Loading...</div>
              </div>
            ) : report && report.salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={report.salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
                  <XAxis dataKey="date" className="text-xs fill-neutral-500" />
                  <YAxis className="text-xs fill-neutral-500" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} dot={{ fill: '#000', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-neutral-500">No sales data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Orders by Day</CardTitle>
            <CardDescription>Number of orders per day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-neutral-500">Loading...</div>
              </div>
            ) : report && report.salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
                  <XAxis dataKey="date" className="text-xs fill-neutral-500" />
                  <YAxis className="text-xs fill-neutral-500" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="orders" fill="#000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-neutral-500">No order data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
          <CardDescription>Platform fees deducted from sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-neutral-200">
              <p className="text-sm text-neutral-600">Gross Sales</p>
              <p className="text-xl font-bold mt-1">{report ? formatCurrency(report.summary.totalSales) : '-'}</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200">
              <p className="text-sm text-neutral-600">Total Commission</p>
              <p className="text-xl font-bold mt-1 text-red-600">{report ? formatCurrency(report.summary.totalCommission) : '-'}</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-200">
              <p className="text-sm text-neutral-600">Net Earnings</p>
              <p className="text-xl font-bold mt-1 text-green-600">{report ? formatCurrency(report.summary.netProfit) : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && report.orders.length > 0 && (
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders in Period</CardTitle>
            <CardDescription>{report.orders.length} orders found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.orders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                  <div>
                    <p className="font-medium text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-neutral-500">
                      {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Unknown'} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
