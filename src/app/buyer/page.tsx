import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Package, ShoppingCart, TrendingUp, User, Sparkles } from 'lucide-react'
import { Order, CartItem } from '@/types/index'

async function getDashboardData(userId: string) {
  const [orders, cartItems, profile] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.cartItem.findMany({
      where: { buyerId: userId },
      include: { product: true },
    }),
    prisma.buyerProfile.findUnique({
      where: { userId },
      include: { user: true },
    }),
  ])

  const totalOrders = await prisma.order.count({ where: { buyerId: userId } })
  const totalSpent = await prisma.order.aggregate({
    where: { buyerId: userId, status: { not: 'CANCELLED' } },
    _sum: { totalAmount: true },
  })

  const pendingOrders = orders.filter((o: Order) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length
  const inTransitOrders = orders.filter((o: Order) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)).length

  return {
    orders: orders as Order[],
    cartItems: cartItems as CartItem[],
    profile: profile as any,
    totalOrders,
    totalSpent: totalSpent._sum.totalAmount || 0,
    pendingOrders,
    inTransitOrders,
    cartCount: cartItems.length,
  }
}

export default async function BuyerDashboard() {
  const session = await getServerSession(authOptions) as any

  if (!session || session.user?.role !== 'BUYER') {
    redirect('/auth/login')
  }

  const data = await getDashboardData(session.user.id)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Dashboard</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {session.user.name || 'Buyer'}!</h1>
        <p className="text-neutral-600 mt-2">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-neutral-500 mt-1">{data.pendingOrders} pending orders</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalSpent)}</div>
            <p className="text-xs text-neutral-500 mt-1">Lifetime purchases</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Cart Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.cartCount}</div>
            <p className="text-xs text-neutral-500 mt-1">Items waiting checkout</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">In Transit</CardTitle>
            <Package className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inTransitOrders}</div>
            <p className="text-xs text-neutral-500 mt-1">Orders on the way</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {data.orders.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders yet. Start shopping!</p>
            ) : (
              <div className="space-y-4">
                {data.orders.slice(0, 5).map((order) => (
                  <Link key={order.id} href={`/buyer/orders/${order.id}`}>
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
            {data.orders.length > 0 && (
              <Link href="/buyer/orders">
                <Button variant="outline" className="w-full mt-4 rounded-full">View All Orders</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/buyer/categories">
              <Button variant="outline" className="w-full justify-start rounded-full">
                <Package className="mr-2 h-4 w-4" />
                Browse Categories
              </Button>
            </Link>
            <Link href="/buyer/search">
              <Button variant="outline" className="w-full justify-start rounded-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Search Products
              </Button>
            </Link>
            <Link href="/buyer/cart">
              <Button variant="outline" className="w-full justify-start rounded-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Cart ({data.cartCount})
              </Button>
            </Link>
            <Link href="/buyer/account">
              <Button variant="outline" className="w-full justify-start rounded-full">
                <User className="mr-2 h-4 w-4" />
                Manage Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
