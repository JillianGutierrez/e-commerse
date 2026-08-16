'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    images: '',
    categoryId: '',
    variations: '',
    vouchers: '',
  })

  useState(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => {})
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          discount: formData.discount ? parseFloat(formData.discount) : 0,
          stock: parseInt(formData.stock) || 0,
        }),
      })

      if (res.ok) {
        toast.success('Product created successfully!')
        router.push('/seller/products')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create product')
      }
    } catch (error) {
      toast.error('Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <h1 className="text-3xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-slate-600 mt-1">Create a new product listing</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Fill in the details for your new product</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (PHP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => updateField('discount', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => updateField('stock', e.target.value)}
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => updateField('categoryId', value)}>
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
                value={formData.images}
                onChange={(e) => updateField('images', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label>Variations (optional)</Label>
              <textarea
                value={formData.variations}
                onChange={(e) => updateField('variations', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                placeholder="e.g. Size: S, M, L | Color: Red, Blue"
              />
            </div>

            <div className="space-y-2">
              <Label>Vouchers (optional)</Label>
              <textarea
                value={formData.vouchers}
                onChange={(e) => updateField('vouchers', e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                placeholder="e.g. SUMMER10, NEWUSER5"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Product'}
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
