'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Trash2, Minus, Plus, ShoppingCart, Tag, Sparkles } from 'lucide-react'

interface CartItem {
  id: string
  buyerId: string
  productId: string
  product?: {
    id: string
    name: string
    description?: string
    price: number
    discount?: number
    stock: number
    images: string
    categoryId: string
    sellerId: string
    variations?: string
    vouchers?: string
    status: string
  }
  quantity: number
  variation?: string
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [voucherCode, setVoucherCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCartItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId: itemId, quantity: newQuantity }),
      })
      if (res.ok) {
        fetchCart()
        toast.success('Quantity updated')
      }
    } catch (error) {
      toast.error('Failed to update quantity')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchCart()
        toast.success('Item removed from cart')
      }
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount
      ? item.product.price - (item.product.price * item.product.discount / 100)
      : item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  const platformFee = subtotal * 0.10
  const total = subtotal + platformFee - discount

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variation: item.variation,
          })),
          paymentMethod,
          voucherCode: voucherCode || undefined,
        }),
      })

      if (res.ok) {
        toast.success('Order placed successfully!')
        router.push('/buyer/orders')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to place order')
      }
    } catch (error) {
      toast.error('Failed to place order')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-500">Loading cart...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Review</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Shopping Cart</h1>
        <p className="text-neutral-600 mt-2">{cartItems.length} items in your cart</p>
      </div>

      {cartItems.length === 0 ? (
        <Card className="border border-neutral-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">Your cart is empty</p>
            <Button className="mt-6 rounded-full bg-black text-white hover:bg-neutral-800" onClick={() => router.push('/buyer/categories')}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const price = item.product?.discount
                ? item.product.price - (item.product.price * item.product.discount / 100)
                : item.product?.price || 0

              return (
                <Card key={item.id} className="border border-neutral-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex gap-5">
                      <div className="w-28 h-28 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.images ? (
                          <img src={item.product.images} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base line-clamp-1">{item.product?.name}</h3>
                        {item.variation && (
                          <p className="text-xs text-neutral-500 mt-1">Variation: {item.variation}</p>
                        )}
                        <p className="text-sm font-medium mt-2">{formatCurrency(price)}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-neutral-200"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-neutral-200"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product?.stock || 0)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(price * item.quantity)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div>
            <Card className="border border-neutral-200 shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Platform Fee (10%)</span>
                    <span>{formatCurrency(platformFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Discount</span>
                      <span className="text-green-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <Button className="w-full rounded-full bg-black text-white hover:bg-neutral-800 h-12" onClick={() => setShowCheckout(true)}>
                    Proceed to Checkout
                  </Button>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="rounded-xl border-neutral-200 h-12">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                          <SelectItem value="GCASH">GCash</SelectItem>
                          <SelectItem value="PAYPAL">PayPal</SelectItem>
                          <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Voucher Code (optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Enter voucher code"
                          className="rounded-xl border-neutral-200 h-12"
                        />
                        <Button type="button" variant="outline" size="icon" className="rounded-xl border-neutral-200 h-12 w-12">
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200 pt-5">
                      <div className="flex justify-between font-semibold mb-5">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                      <Button type="submit" className="w-full rounded-full bg-black text-white hover:bg-neutral-800 h-12" disabled={checkoutLoading}>
                        {checkoutLoading ? 'Placing Order...' : 'Place Order'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
