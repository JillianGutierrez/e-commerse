'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ProductCard from '../components/product-card'
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'

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

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => {})
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)

    try {
      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Discover</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Search Products</h1>
        <p className="text-neutral-600 mt-2">Find exactly what you need</p>
      </div>

      <Card className="border border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border-neutral-200 h-12"
                />
              </div>
              <div className="w-64">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={loading} className="rounded-xl h-12 px-8 bg-black text-white hover:bg-neutral-800">
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {products.length} {products.length === 1 ? 'result' : 'results'} found
            </h2>
          </div>
          {products.length === 0 ? (
            <Card className="border border-neutral-200 shadow-sm">
              <CardContent className="py-16 text-center">
                <SlidersHorizontal className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">No products found matching your criteria.</p>
                <p className="text-sm text-neutral-500 mt-2">Try adjusting your search or browse categories.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
