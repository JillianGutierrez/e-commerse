'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Eye, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentMethod: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
  createdAt: string
  buyer?: { firstName: string; lastName: string; email: string }
  seller?: { businessName: string; user?: { firstName: string; lastName: string; email: string } }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      if (searchQuery) params.set('q', searchQuery)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Order updated successfully')
        fetchOrders()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update order')
      }
    } catch (error) {
      toast.error('Failed to update order')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      TO_SHIP: 'bg-orange-100 text-orange-800',
      IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
      OUT_FOR_DELIVERY: 'bg-pink-100 text-pink-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'TO_SHIP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.buyer?.firstName.toLowerCase().includes(query) ||
      order.buyer?.lastName.toLowerCase().includes(query) ||
      order.buyer?.email.toLowerCase().includes(query) ||
      order.seller?.businessName.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-600 mt-1">Monitor and manage all platform orders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by order number, buyer, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-slate-600">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-600">#</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">
                        {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Unknown Buyer'} &bull;{' '}
                        {order.seller?.businessName || 'Unknown Seller'}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                          disabled={updatingOrder === order.id}
                        >
                          {updatingOrder === order.id ? 'Updating...' : 'Confirm'}
                        </Button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                          disabled={updatingOrder === order.id}
                        >
                          {updatingOrder === order.id ? 'Updating...' : 'Process'}
                        </Button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'TO_SHIP')}
                          disabled={updatingOrder === order.id}
                        >
                          {updatingOrder === order.id ? 'Updating...' : 'Ship'}
                        </Button>
                      )}
                      {(order.status === 'TO_SHIP' || order.status === 'IN_TRANSIT' || order.status === 'OUT_FOR_DELIVERY') && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          disabled={updatingOrder === order.id}
                        >
                          {updatingOrder === order.id ? 'Updating...' : 'Deliver'}
                        </Button>
                      )}
                    </div>
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
