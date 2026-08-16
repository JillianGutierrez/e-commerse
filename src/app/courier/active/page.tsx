'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react'

interface Delivery {
  id: string
  courierId: string
  orderId: string
  order?: {
    id: string
    orderNumber: string
    shippingAddress: string
    totalAmount: number
    status: string
  }
  status: string
  pickupAddress: string
  deliveryAddress: string
  weight?: number
  fee: number
  profit: number
  acceptedAt: string
  pickedUpAt?: string
  deliveredAt?: string
}

export default function CourierActivePage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchDeliveries = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courier/deliveries')
      if (res.ok) {
        const data = await res.json()
        setDeliveries(data.filter((d: Delivery) => d.status !== 'COMPLETED'))
      }
    } catch (error) {
      console.error('Failed to fetch active deliveries:', error)
      toast.error('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (deliveryId: string, status: string) => {
    setUpdatingId(deliveryId)
    try {
      const res = await fetch(`/api/courier/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Delivery status updated!')
        fetchDeliveries()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    fetchDeliveries()
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
      ACCEPTED: 'bg-blue-100 text-blue-800',
      PICKED_UP: 'bg-indigo-100 text-indigo-800',
      OUT_FOR_DELIVERY: 'bg-pink-100 text-pink-800',
      COMPLETED: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Active Deliveries</h1>
        <p className="text-slate-600 mt-1">Track and update your current deliveries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Active Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading deliveries...</div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Package className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600">No active deliveries</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/courier/deliveries'}
                className="mt-4 w-full"
              >
                Find Deliveries
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center">
                        <Truck className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium">#{delivery.order?.orderNumber || 'N/A'}</p>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{delivery.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{delivery.pickupAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(delivery.fee)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {delivery.status === 'ACCEPTED' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(delivery.id, 'PICKED_UP')}
                        disabled={updatingId === delivery.id}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {updatingId === delivery.id ? 'Updating...' : 'Mark Picked Up'}
                      </Button>
                    )}
                    {delivery.status === 'PICKED_UP' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(delivery.id, 'OUT_FOR_DELIVERY')}
                        disabled={updatingId === delivery.id}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        {updatingId === delivery.id ? 'Updating...' : 'Out for Delivery'}
                      </Button>
                    )}
                    {delivery.status === 'OUT_FOR_DELIVERY' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(delivery.id, 'COMPLETED')}
                        disabled={updatingId === delivery.id}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {updatingId === delivery.id ? 'Updating...' : 'Mark Delivered'}
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
