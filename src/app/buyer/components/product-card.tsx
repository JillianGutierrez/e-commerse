import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-slate-100 flex items-center justify-center">
        {product.images ? (
          <img src={product.images} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingCart className="h-12 w-12 text-slate-400" />
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          {product.category && (
            <p className="text-xs text-slate-500">{product.category.name}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discount && product.discount > 0 && (
              <span className="text-sm text-slate-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          {product.discount && product.discount > 0 && (
            <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-medium">
              -{product.discount}% OFF
            </span>
          )}
          <p className="text-xs text-slate-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <Link href={`/buyer/products/${product.id}`}>
            <Button className="w-full" size="sm" disabled={product.stock === 0}>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
