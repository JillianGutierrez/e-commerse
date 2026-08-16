'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Package, ChevronRight, Search, Sparkles } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentMethod: string
  shippingAddress: string
  trackingNumber?: string
  notes?: string
  items?: OrderItem[]
  buyer?: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

interface OrderItem {
  id: string
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
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [availableCouriers, setAvailableCouriers] = useState<{ id: string; name: string }[]>([])
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      const res = await fetch(`/api/seller/orders?${params}`)
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

  const fetchCouriers = async () => {
    try {
      const res = await fetch('/api/couriers?available=true')
      if (res.ok) {
        const data = await res.json()
        setAvailableCouriers(data.map((c: any) => ({ id: c.id, name: `${c.user?.firstName || ''} ${c.user?.lastName || ''} - ${c.vehicleType}` })))
      }
    } catch (error) {
      console.error('Failed to fetch couriers:', error)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchCouriers()
  }, [filter])

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

  const handleStatusUpdate = async (orderId: string, status: string, courierId?: string, trackingNumber?: string) => {
    setUpdatingOrder(orderId)
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, courierId, trackingNumber }),
      })
      if (res.ok) {
        toast.success('Order updated successfully!')
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

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.buyer?.firstName.toLowerCase().includes(query) ||
      order.buyer?.lastName.toLowerCase().includes(query) ||
      order.buyer?.email.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Orders</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="text-neutral-600 mt-2">Manage and track your orders</p>
      </div>

      <Card className="border border-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search by order number or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-neutral-200 h-12"
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
                className={filter === f ? 'bg-black text-white hover:bg-neutral-800 rounded-full' : 'rounded-full border-neutral-200 hover:bg-neutral-50'}
              >
                {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-neutral-500">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Package className="h-12 w-12 text-neutral-300 mb-4" />
              <p className="text-neutral-600 font-medium">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-neutral-200 p-5 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-neutral-600" />
                      </div>
                      <div>
                        <Link href={`/seller/orders/${order.id}`} className="font-medium hover:underline">
                          #{order.orderNumber}
                        </Link>
                        <p className="text-sm text-neutral-500">
                          {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Unknown Buyer'} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-neutral-500">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="rounded-full">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                    {order.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                        disabled={updatingOrder === order.id}
                        className="rounded-full bg-black text-white hover:bg-neutral-800"
                      >
                        {updatingOrder === order.id ? 'Updating...' : 'Confirm'}
                      </Button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                        disabled={updatingOrder === order.id}
                        className="rounded-full bg-black text-white hover:bg-neutral-800"
                      >
                        {updatingOrder === order.id ? 'Updating...' : 'Process'}
                      </Button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <div className="flex gap-2">
                        <Select onValueChange={(courierId) => handleStatusUpdate(order.id, 'TO_SHIP', courierId)}>
                          <SelectTrigger className="w-[200px] h-9 rounded-xl border-neutral-200">
                            <SelectValue placeholder="Assign courier & ship" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCouriers.map((courier) => (
                              <SelectItem key={courier.id} value={courier.id}>
                                {courier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {(order.status === 'TO_SHIP' || order.status === 'IN_TRANSIT' || order.status === 'OUT_FOR_DELIVERY') && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                        disabled={updatingOrder === order.id}
                        className="rounded-full bg-black text-white hover:bg-neutral-800"
                      >
                        {updatingOrder === order.id ? 'Updating...' : 'Mark Delivered'}
                      </Button>
                    )}
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
