'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Wallet, TrendingUp, CheckCircle } from 'lucide-react'

interface EarningsData {
  totalEarnings: number
  thisWeek: number
  thisMonth: number
  deliveries: {
    id: string
    fee: number
    profit: number
    status: string
    acceptedAt: string
    deliveredAt?: string
    order?: {
      orderNumber: string
    }
  }[]
}

export default function CourierEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courier/earnings')
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
      toast.error('Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Earnings</h1>
        <p className="text-slate-600 mt-1">Track your delivery earnings and history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.totalEarnings || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.thisWeek || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.thisMonth || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">Current month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>All your delivery earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading earnings...</div>
            </div>
          ) : !data?.deliveries.length ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Wallet className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600">No earnings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">#{delivery.order?.orderNumber || 'N/A'}</p>
                      <p className="text-xs text-slate-500">
                        {delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleDateString() : new Date(delivery.acceptedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(delivery.fee)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
