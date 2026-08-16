'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Search, Archive, Edit, Trash2, Package, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  discount?: number
  stock: number
  images: string
  status: string
  category: {
    id: string
    name: string
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (filterStatus !== 'ALL') params.set('status', filterStatus)
      const res = await fetch(`/api/seller/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, filterStatus])

  const handleArchive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Product ${newStatus === 'ACTIVE' ? 'activated' : 'archived'} successfully!`)
        fetchProducts()
      } else {
        toast.error('Failed to update product status')
      }
    } catch (error) {
      toast.error('Failed to update product status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Product deleted successfully!')
        fetchProducts()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
      OUT_OF_STOCK: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#D4AF37]" />
            <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Inventory</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-neutral-600 mt-2">Manage your product inventory</p>
        </div>
        <Link href="/seller/products/new">
          <Button className="rounded-full bg-black text-white hover:bg-neutral-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="border border-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-neutral-200 h-12"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-neutral-500">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Package className="h-12 w-12 text-neutral-300 mb-4" />
              <p className="text-neutral-600 font-medium">No products found</p>
              <Link href="/seller/products/new">
                <Button className="mt-4 rounded-full bg-black text-white hover:bg-neutral-800">Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-neutral-500">{product.category.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="font-medium">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-neutral-500">Stock: {product.stock}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link href={`/seller/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-neutral-100">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleArchive(product.id, product.status)} className="rounded-lg hover:bg-neutral-100">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="rounded-lg hover:bg-red-50 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
