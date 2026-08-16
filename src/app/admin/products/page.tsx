'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Eye, Trash2, Package } from 'lucide-react'
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
  category: { id: string; name: string }
  seller: { id: string; businessName: string; user?: { firstName: string; lastName: string; email: string } }
}

export default function AdminProductsPage() {
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
      const res = await fetch(`/api/admin/products?${params}`)
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

  const handleStatusUpdate = async (productId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Product ${newStatus.toLowerCase()} successfully`)
        fetchProducts()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update product')
      }
    } catch (error) {
      toast.error('Failed to update product')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Product deleted successfully')
        fetchProducts()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete product')
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
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Product Management</h1>
          <p className="text-slate-600 mt-1">Review and moderate all platform products</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Package className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600">No products found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center">
                      <Package className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.category.name} &bull; {product.seller.businessName}</p>
                      <p className="text-xs text-slate-500">
                        {product.seller.user ? `${product.seller.user.firstName} ${product.seller.user.lastName}` : product.seller.businessName} &bull; Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="font-medium">{formatCurrency(product.price)}</p>
                      {product.discount && (
                        <p className="text-xs text-red-500">{product.discount}% off</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                    <div className="flex items-center gap-2">
                      {product.status === 'ACTIVE' || product.status === 'OUT_OF_STOCK' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(product.id, 'ARCHIVED')}
                        >
                          Archive
                        </Button>
                      ) : product.status === 'ARCHIVED' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(product.id, 'ACTIVE')}
                        >
                          Activate
                        </Button>
                      ) : null}
                      {product.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(product.id, 'ACTIVE')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(product.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
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
