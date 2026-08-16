'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Package, ChevronRight, Sparkles } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  buyerId: string
  sellerId: string
  courierId?: string
  status: string
  totalAmount: number
  commission?: number
  paymentMethod: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
  items?: OrderItem[]
  createdAt: string
}

interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: {
    id: string
    name: string
    images: string
    price: number
  }
  quantity: number
  price: number
  variation?: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const url = filter === 'ALL' ? '/api/orders' : `/api/orders?status=${filter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
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

  const filters = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Track</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">My Orders</h1>
        <p className="text-neutral-600 mt-2">Track and manage your orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-black text-white hover:bg-neutral-800 rounded-full' : 'rounded-full border-neutral-200 hover:bg-neutral-50'}
          >
            {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-neutral-500">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">No orders found</p>
            <Button className="mt-6 rounded-full bg-black text-white hover:bg-neutral-800" onClick={() => window.location.href = '/buyer/categories'}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/buyer/orders/${order.id}`}>
              <Card className="hover:shadow-md hover:shadow-black/5 transition-all duration-300 cursor-pointer border border-neutral-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-neutral-600" />
                      </div>
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-neutral-500">
                          {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
