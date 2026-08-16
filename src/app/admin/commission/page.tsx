'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { DollarSign, TrendingUp, Store, Percent } from 'lucide-react'

interface CommissionStats {
  commissionRate: number
  totalCommission: number
  totalOrders: number
  totalSales: number
  breakdown: { sellerId: string; businessName: string; totalSales: number; totalCommission: number }[]
}

export default function AdminCommissionPage() {
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [newRate, setNewRate] = useState('10')
  const [saving, setSaving] = useState(false)

  const fetchCommission = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/commission')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setNewRate((data.commissionRate * 100).toString())
      }
    } catch (error) {
      console.error('Failed to fetch commission data:', error)
      toast.error('Failed to load commission data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommission()
  }, [])

  const handleUpdateRate = async () => {
    const rate = parseFloat(newRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Commission rate must be between 0 and 100')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: rate / 100 }),
      })
      if (res.ok) {
        toast.success(`Commission rate updated to ${rate}%`)
        fetchCommission()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update commission rate')
      }
    } catch (error) {
      toast.error('Failed to update commission rate')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Commission Management</h1>
          <p className="text-slate-600 mt-1">View and configure platform commission settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Commission Rate</CardTitle>
            <Percent className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? `${(stats.commissionRate * 100).toFixed(0)}%` : '-'}</div>
            <p className="text-xs text-slate-500 mt-1">Current platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Commission Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? formatCurrency(stats.totalCommission) : '-'}</div>
            <p className="text-xs text-slate-500 mt-1">Platform earnings to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? formatCurrency(stats.totalSales) : '-'}</div>
            <p className="text-xs text-slate-500 mt-1">{stats?.totalOrders || 0} total orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Settings</CardTitle>
          <CardDescription>Update the platform commission rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateRate} disabled={saving}>
              {saving ? 'Saving...' : 'Update Rate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Commission Breakdown by Seller
          </CardTitle>
          <CardDescription>Commission earned per seller</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading...</div>
            </div>
          ) : !stats || stats.breakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-slate-600">No commission data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.breakdown.map((item) => (
                <div key={item.sellerId} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{item.businessName}</p>
                    <p className="text-xs text-slate-500">Sales: {formatCurrency(item.totalSales)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-red-600">{formatCurrency(item.totalCommission)}</p>
                    <p className="text-xs text-slate-500">Commission</p>
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
