'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Star, Truck, Package, MapPin, Calendar } from 'lucide-react'

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

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

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

  useEffect(() => {
    if (params.id) {
      fetch(`/api/orders/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setOrder(data)
          setLoading(false)
        })
        .catch(() => {
          toast.error('Failed to load order')
          setLoading(false)
        })
    }
  }, [params.id, toast])

  const submitRating = async () => {
    if (!order || rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmittingRating(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })

      if (res.ok) {
        toast.success('Rating submitted!')
        setComment('')
        setRating(0)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit rating')
      }
    } catch (error) {
      toast.error('Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="text-slate-600 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Payment</p>
              <p className="font-medium">{order.paymentMethod.replace(/_/g, ' ')}</p>
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
              <p className="text-sm text-slate-600">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.trackingNumber && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-orange-600" />
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
                    <img src={item.product.images} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <Package className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{item.product?.name}</p>
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
          </div>
        </CardContent>
      </Card>

      {order.status === 'DELIVERED' && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Your Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                    type="button"
                  >
                    <Star
                      className={`h-8 w-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment (optional)</Label>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
              />
            </div>
            <Button onClick={submitRating} disabled={submittingRating || rating === 0}>
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
