import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Grid3x3 } from 'lucide-react'

const ERP_CATEGORIES = [
  { name: 'Pet Supplies', subcategories: ['Dog Food & Treats', 'Cat Litter & Accessories', 'Aquariums & Fish Supplies', 'Bird Feeders & Food', 'Pet Grooming Products', 'Pet Health & Wellness'] },
  { name: 'Electronics and Gadgets', subcategories: ['Mobile Phones & Accessories', 'Laptops, Desktops & Monitors', 'Audio & Video Equipment', 'Smart Home Devices', 'Cameras & Photography', 'Wearable Technology'] },
  { name: "Women's Apparel", subcategories: ['Dresses & Skirts', 'Tops & Blouses', 'Activewear & Yoga Pants', 'Lingerie & Sleepwear', 'Jackets & Coats', 'Shoes & Accessories'] },
  { name: "Men's Apparel", subcategories: ['Suits & Blazers', 'Casual Shirts & Pants', 'Outerwear & Jackets', 'Activewear & Fitness Gear', 'Shoes & Accessories', 'Grooming Products'] },
  { name: 'Kids and Baby', subcategories: ['Baby Clothes & Accessories', 'Toys & Games', 'Educational Materials', 'Strollers & Gear', 'Nursery Furniture', 'Safety and Health'] },
  { name: 'Home and Garden', subcategories: ['Kitchen Appliances', 'Furniture & Decor', 'Gardening Tools', 'Outdoor Living', 'Home Improvement Tools', 'Bedding & Bath'] },
  { name: 'Sports and Outdoors', subcategories: ['Fitness Equipment', 'Camping & Hiking Gear', 'Sports Apparel', 'Cycling & Bikes', 'Water Sports', 'Team Sports Equipment'] },
  { name: 'Health and Beauty', subcategories: ['Skincare Products', 'Haircare Solutions', 'Makeup & Cosmetics', 'Personal Care Appliances', "Men's Grooming", 'Health Supplements'] },
  { name: 'Books and Media', subcategories: ['Fiction & Non-Fiction Books', 'Magazines & Periodicals', 'Music CDs & Vinyl Records', 'Movie DVDs & Blu-ray', 'Video Games & Consoles', 'Educational DVDs'] },
  { name: 'Food and Gourmet', subcategories: ['Baking Supplies & Ingredients', 'Coffee, Tea & Beverages', 'Snacks & Candy', 'Specialty Foods & International Cuisine', 'Organic and Health Foods', 'Meal Kits & Prepped Foods'] },
  { name: 'Furniture and Office Equipment', subcategories: ['Office Desks & Chairs', 'Storage Cabinets & Shelving', 'Conference & Meeting Furniture', 'Computer Tables & Workstations', 'Ergonomic Accessories', 'Office Lighting & Fixtures'] },
  { name: 'Jewelry and Watches', subcategories: ['Necklaces & Pendants', 'Rings & Earrings', 'Bracelets & Bangles', 'Watches for Men & Women', 'Fashion Jewelry', 'Jewelry Storage & Care'] },
]

async function seedCategories() {
  const existingCount = await prisma.category.count()
  if (existingCount > 0) return existingCount

  for (const category of ERP_CATEGORIES) {
    const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await prisma.category.create({
      data: {
        name: category.name,
        slug,
      },
    })
  }
  return ERP_CATEGORIES.length
}

import { Category as PrismaCategory } from '@prisma/client'

async function getCategories(): Promise<(PrismaCategory & { _count: { products: number } })[]> {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions) as any

  if (!session || session.user?.role !== 'BUYER') {
    redirect('/auth/login')
  }

  const [seededCount, categories] = await Promise.all([
    seedCategories(),
    getCategories(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-600 mt-1">Browse products by category</p>
      </div>

      {seededCount > 0 && (
        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
          {seededCount} ERP categories seeded successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Grid3x3 className="h-5 w-5 text-slate-400" />
              </div>
              <CardDescription>{category._count.products} products</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/buyer/search?category=${category.slug}`}>
                <Button variant="outline" className="w-full">Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
