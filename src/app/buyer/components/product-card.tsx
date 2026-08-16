import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Sparkles } from 'lucide-react'

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

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount / 100)
    : product.price

  return (
    <Card className="overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 border border-neutral-200 bg-white group">
      <div className="aspect-square bg-neutral-100 flex items-center justify-center relative overflow-hidden">
        {product.images ? (
          <img src={product.images} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <ShoppingCart className="h-12 w-12 text-neutral-300" />
        )}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
            -{product.discount}% OFF
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-sm line-clamp-2 leading-snug">{product.name}</h3>
            {product.category && (
              <p className="text-xs text-neutral-500 mt-1">{product.category.name}</p>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discount && product.discount > 0 && (
              <span className="text-sm text-neutral-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">{product.stock} in stock</span>
            ) : (
              <span className="text-red-500 font-medium">Out of stock</span>
            )}
          </p>
          <Link href={`/buyer/products/${product.id}`} className="block">
            <Button className="w-full rounded-full bg-black text-white hover:bg-neutral-800 h-10" size="sm" disabled={product.stock === 0}>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
