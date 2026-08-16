'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Eye, ShieldAlert, ShieldCheck, Package, AlertTriangle } from 'lucide-react'

interface ProductWithSeller {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  status: string
  category: { name: string }
  seller: {
    id: string
    businessName: string
    user: { firstName: string; lastName: string; email: string; status: string }
  }
}

const prohibitedKeywords = [
  'fake', 'counterfeit', 'replica', 'knockoff', 'bootleg',
  'illegal', 'banned', 'weapon', 'drug', 'steroid',
  'explosive', 'hack', 'pirated', 'stolen', 'fraud',
]

export default function AdminCompliancePage() {
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null)
  const [warningNote, setWarningNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [flaggedCount, setFlaggedCount] = useState(0)

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
        const flagged = data.filter((p: ProductWithSeller) => hasProhibitedKeyword(p))
        setFlaggedCount(flagged.length)
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

  const hasProhibitedKeyword = (product: ProductWithSeller) => {
    const text = `${product.name} ${product.description || ''}`.toLowerCase()
    return prohibitedKeywords.some((keyword) => text.includes(keyword))
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

  const handleWarnSeller = async (sellerId: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/compliance/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, note: warningNote }),
      })
      if (res.ok) {
        toast.success('Warning sent to seller')
        setSelectedProduct(null)
        setWarningNote('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to warn seller')
      }
    } catch (error) {
      toast.error('Failed to warn seller')
    } finally {
      setUpdating(false)
    }
  }

  const handleSuspendSeller = async (sellerId: string) => {
    if (!confirm('Are you sure you want to suspend this seller?')) return
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/compliance/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      })
      if (res.ok) {
        toast.success('Seller suspended successfully')
        fetchProducts()
        setSelectedProduct(null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to suspend seller')
      }
    } catch (error) {
      toast.error('Failed to suspend seller')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seller Compliance</h1>
          <p className="text-slate-600 mt-1">Monitor products for policy violations</p>
        </div>
        {flaggedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">{flaggedCount} flagged product{flaggedCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products or sellers..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
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
              {products.map((product) => {
                const flagged = hasProhibitedKeyword(product)
                return (
                  <div key={product.id} className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${flagged ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${flagged ? 'bg-red-100' : 'bg-slate-100'}`}>
                        <Package className={`h-6 w-6 ${flagged ? 'text-red-600' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{product.name}</p>
                          {flagged && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3" />
                              Flagged
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{product.category.name} &bull; {product.seller.businessName}</p>
                        <p className="text-xs text-slate-500">
                          {product.seller.user.firstName} {product.seller.user.lastName} ({product.seller.user.email}) &bull; Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="font-medium">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(product.price)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) { setSelectedProduct(null); setWarningNote('') } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Seller Compliance Details</DialogTitle>
            <DialogDescription>
              Review product and take action
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Product:</span>
                <p className="text-sm text-slate-800">{selectedProduct.name}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Description:</span>
                <p className="text-sm text-slate-800">{selectedProduct.description || 'No description'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Seller:</span>
                <p className="text-sm text-slate-800">
                  {selectedProduct.seller.businessName} &bull; {selectedProduct.seller.user.firstName} {selectedProduct.seller.user.lastName} ({selectedProduct.seller.user.email})
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.seller.user.status)}`}>
                  {selectedProduct.seller.user.status}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Price:</span>
                <p className="text-sm text-slate-800">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(selectedProduct.price)}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Stock:</span>
                <p className="text-sm text-slate-800">{selectedProduct.stock}</p>
              </div>
              <DialogFooter className="flex flex-col gap-2">
                {selectedProduct.seller.user.status !== 'SUSPENDED' && (
                  <div className="space-y-2 w-full">
                    <Label htmlFor="warningNote">Warning Note</Label>
                    <textarea
                      id="warningNote"
                      value={warningNote}
                      onChange={(e) => setWarningNote(e.target.value)}
                      placeholder="Enter warning message for the seller..."
                      className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleWarnSeller(selectedProduct.seller.id)}
                      disabled={updating}
                      className="w-full"
                    >
                      <ShieldAlert className="h-4 w-4 mr-1" />
                      Warn Seller
                    </Button>
                  </div>
                )}
                {selectedProduct.seller.user.status !== 'SUSPENDED' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleSuspendSeller(selectedProduct.seller.id)}
                    disabled={updating}
                    className="w-full"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Suspend Seller
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
