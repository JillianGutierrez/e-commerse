'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  discount?: number
  stock: number
  images: string
  categoryId: string
  variations?: string
  vouchers?: string
  status: string
  category?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/seller/products/${params.id}`).then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
    ])
      .then(([productData, categoriesData]) => {
        if (productData.error) {
          toast.error(productData.error)
          router.push('/seller/products')
          return
        }
        setProduct(productData)
        setCategories(categoriesData)
      })
      .catch(() => {
        toast.error('Failed to load product')
      })
      .finally(() => setLoading(false))
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/seller/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          discount: product.discount || 0,
        }),
      })

      if (res.ok) {
        toast.success('Product updated successfully!')
        router.push('/seller/products')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update product')
      }
    } catch (error) {
      toast.error('Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  const updateField = (field: string, value: string | number) => {
    if (!product) return
    setProduct({ ...product, [field]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-slate-500">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/seller/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-slate-600 mt-1">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Update the details for your product</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={product.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={product.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (PHP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => updateField('price', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={product.discount || 0}
                  onChange={(e) => updateField('discount', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={product.stock}
                  onChange={(e) => updateField('stock', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={product.categoryId} onValueChange={(value) => updateField('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={product.images}
                onChange={(e) => updateField('images', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Variations</Label>
              <textarea
                value={product.variations || ''}
                onChange={(e) => updateField('variations', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Vouchers</Label>
              <textarea
                value={product.vouchers || ''}
                onChange={(e) => updateField('vouchers', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/seller/products">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
