import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Package, ClipboardList, TrendingUp, Wallet, Sparkles } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SellerOrdersChart } from './components/seller-orders-chart'

async function getDashboardData(userId: string) {
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId },
  })

  if (!sellerProfile) {
    return null
  }

  const [totalProducts, totalOrders, pendingOrders, revenue, recentOrders, topProducts] = await Promise.all([
    prisma.product.count({ where: { sellerId: sellerProfile.id } }),
    prisma.order.count({ where: { sellerId: sellerProfile.id } }),
    prisma.order.count({ where: { sellerId: sellerProfile.id, status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'TO_SHIP'] } } }),
    prisma.order.aggregate({
      where: { sellerId: sellerProfile.id, status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      where: { sellerId: sellerProfile.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.product.findMany({
      where: { sellerId: sellerProfile.id },
      include: {
        orderItems: {
          select: { productId: true, quantity: true },
        },
      },
      orderBy: { stock: 'asc' },
      take: 5,
    }),
  ])

  const salesByDate = await prisma.order.groupBy({
    by: ['createdAt'],
    where: { sellerId: sellerProfile.id },
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: { createdAt: 'desc' },
    take: 7,
  })

  return {
    sellerProfile,
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: revenue._sum.totalAmount || 0,
    recentOrders,
    topProducts,
    salesByDate: salesByDate.reverse(),
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions) as any

  if (!session || session.user?.role !== 'SELLER') {
    redirect('/auth/login')
  }

  const data = await getDashboardData(session.user.id)

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome!</h1>
          <p className="text-neutral-600 mt-2">Please complete your seller profile to get started.</p>
        </div>
        <Link href="/seller/account">
          <Button className="rounded-full bg-black text-white hover:bg-neutral-800">Complete Profile</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Dashboard</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {session.user.name || 'Seller'}!</h1>
        <p className="text-neutral-600 mt-2">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-neutral-500 mt-1">{data.totalOrders} total orders</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Products</CardTitle>
            <Package className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-neutral-500 mt-1">{data.topProducts.filter((p: any) => p.stock < 10).length} low stock</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Pending Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingOrders}</div>
            <p className="text-xs text-neutral-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.sellerProfile.walletBalance)}</div>
            <p className="text-xs text-neutral-500 mt-1">Available funds</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Sales for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <SellerOrdersChart data={data.salesByDate} />
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest orders</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {data.recentOrders.map((order: any) => (
                  <Link key={order.id} href={`/seller/orders/${order.id}`}>
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">#{order.orderNumber}</p>
                        <p className="text-xs text-neutral-500">{order.items?.length || 0} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(order.totalAmount)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {data.recentOrders.length > 0 && (
              <Link href="/seller/orders">
                <Button variant="outline" className="w-full mt-4 rounded-full">View All Orders</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>Products running low on inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">No products yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topProducts.map((product: any) => (
                <Link key={product.id} href={`/seller/products/${product.id}/edit`}>
                  <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-neutral-500">{formatCurrency(product.price)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {data.topProducts.length > 0 && (
            <Link href="/seller/products">
              <Button variant="outline" className="w-full mt-4 rounded-full">Manage Products</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
