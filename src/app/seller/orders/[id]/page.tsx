'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Package, MapPin, Truck, Calendar, User } from 'lucide-react'
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
  commission?: number
  items?: OrderItem[]
  buyer?: {
    firstName: string
    lastName: string
    email: string
    contactNo: string
    address: string
  }
  courier?: {
    vehicleType: string
    plateNumber: string
  }
  delivery?: {
    status: string
    pickupAddress: string
    deliveryAddress: string
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

export default function SellerOrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [availableCouriers, setAvailableCouriers] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    notes: '',
    courierId: '',
  })

  useEffect(() => {
    if (params.id) {
      fetch(`/api/seller/orders/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(data.error)
            return
          }
          setOrder(data)
          setFormData({
            status: data.status,
            trackingNumber: data.trackingNumber || '',
            notes: data.notes || '',
            courierId: data.courier?.id || '',
          })
        })
        .catch(() => {
          toast.error('Failed to load order')
        })
        .finally(() => setLoading(false))
    }
  }, [params.id])

  useEffect(() => {
    fetch('/api/couriers?available=true')
      .then((res) => res.json())
      .then((data) => {
        setAvailableCouriers(
          data.map((c: any) => ({
            id: c.id,
            name: `${c.user?.firstName || ''} ${c.user?.lastName || ''} - ${c.vehicleType}`,
          }))
        )
      })
      .catch(() => {})
  }, [])

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

  const handleUpdate = async () => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/seller/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          trackingNumber: formData.trackingNumber,
          notes: formData.notes,
          courierId: formData.courierId || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Order updated successfully!')
        const updated = await res.json()
        setOrder(updated)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update order')
      }
    } catch (error) {
      toast.error('Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const nextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PROCESSING',
      PROCESSING: 'TO_SHIP',
      TO_SHIP: 'IN_TRANSIT',
      IN_TRANSIT: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'DELIVERED',
    }
    return flow[current] || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Order not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/seller/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <p className="text-slate-600 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Customer</p>
              <p className="font-medium">{order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Unknown'}</p>
              <p className="text-xs text-slate-500">{order.buyer?.email}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Shipping To</p>
              <p className="font-medium text-sm line-clamp-1">{order.shippingAddress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-slate-600">Payment Method</p>
              <p className="font-medium">{order.paymentMethod.replace(/_/g, ' ')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.courier && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-slate-600">Courier</p>
              <p className="font-medium">{order.courier.vehicleType} - {order.courier.plateNumber}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {order.trackingNumber && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-slate-600">Tracking Number</p>
              <p className="font-medium">{order.trackingNumber}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                  {item.product?.images ? (
                    <img src={item.product.images} alt={item.product?.name} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <Package className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{item.product?.name || 'Product'}</p>
                  {item.variation && (
                    <p className="text-xs text-slate-500">Variation: {item.variation}</p>
                  )}
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            {order.commission !== undefined && order.commission > 0 && (
              <p className="text-sm text-slate-500 mt-1">Commission: {formatCurrency(order.commission)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="TO_SHIP">To Ship</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assign Courier</Label>
            <Select value={formData.courierId} onValueChange={(value) => setFormData({ ...formData, courierId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a courier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {availableCouriers.map((courier) => (
                  <SelectItem key={courier.id} value={courier.id}>
                    {courier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tracking Number</Label>
            <Input
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              placeholder="Enter tracking number"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              placeholder="Add notes for this order"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
            {nextStatus(order.status) && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(order.id, nextStatus(order.status)!)}
                disabled={updating}
              >
                Move to {nextStatus(order.status)?.replace(/_/g, ' ')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function handleStatusUpdate(orderId: string, status: string) {
  const currentNotes = document.querySelector('textarea') as HTMLTextAreaElement
  const notes = currentNotes?.value || ''
  fetch(`/api/seller/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  })
    .then((res) => {
      if (res.ok) {
        toast.success(`Order status updated to ${status.replace(/_/g, ' ')}`)
        window.location.reload()
      } else {
        toast.error('Failed to update order')
      }
    })
    .catch(() => toast.error('Failed to update order'))
}
