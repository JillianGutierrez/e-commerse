'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ShoppingCart, Minus, Plus, Star, Sparkles } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  discount?: number
  stock: number
  images: string
  categoryId: string
  category?: { name: string; slug: string }
  sellerId: string
  variations?: string
  vouchers?: string
  status: string
}

export default function ProductDetailsPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [variation, setVariation] = useState('')
  const [addingToCart, setAddingToCart] = useState(false)

  const variations = product ? JSON.parse(product.variations || '[]') : []
  const discountedPrice = product
    ? product.discount
      ? product.price - (product.price * product.discount / 100)
      : product.price
    : 0

  useEffect(() => {
    if (params.id) {
      fetch(`/api/products/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data)
          setLoading(false)
        })
        .catch(() => {
          toast.error('Failed to load product')
          setLoading(false)
        })
    }
  }, [params.id, toast])

  const addToCart = async () => {
    if (!product || addingToCart) return

    setAddingToCart(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          variation: variation || null,
        }),
      })

      if (res.ok) {
        toast.success('Added to cart!')
        setQuantity(1)
        setVariation('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-500">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-500">Product not found</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-neutral-100 rounded-2xl flex items-center justify-center overflow-hidden border border-neutral-200">
          {product.images ? (
            <img src={product.images} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ShoppingCart className="h-24 w-24 text-neutral-400" />
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">{product.category?.name || 'Product'}</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discount && product.discount > 0 && (
              <>
                <span className="text-xl text-neutral-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="px-3 py-1 rounded-full bg-black text-white text-sm font-medium">
                  -{product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-neutral-600">4.0 (No ratings yet)</span>
          </div>

          <p className="text-neutral-600 leading-relaxed text-lg">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {variations.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Variation</Label>
              <Select value={variation} onValueChange={setVariation}>
                <SelectTrigger className="rounded-xl border-neutral-200 h-12">
                  <SelectValue placeholder="Select a variation" />
                </SelectTrigger>
                <SelectContent>
                  {variations.map((v: { color?: string; size?: string; name?: string }) => (
                    <SelectItem key={v.name || `${v.color}-${v.size}`} value={v.name || `${v.color}-${v.size}`}>
                      {v.name || `${v.color} / ${v.size}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="rounded-xl border-neutral-200 h-12 w-12"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-20 text-center rounded-xl border-neutral-200 h-12"
                min={1}
                max={product.stock}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="rounded-xl border-neutral-200 h-12 w-12"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            className="w-full rounded-full bg-black text-white hover:bg-neutral-800 h-14 text-base"
            size="lg"
            disabled={product.stock === 0 || addingToCart}
            onClick={addToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}
