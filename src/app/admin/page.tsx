import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  Store,
  ShoppingCart,
  Truck,
  Package,
  ClipboardList,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getStats() {
  const [
    totalUsers,
    totalSellers,
    totalBuyers,
    totalCouriers,
    totalProducts,
    totalOrders,
    pendingUsers,
    pendingOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SELLER' } }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.user.count({ where: { role: 'COURIER' } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'BUYER', status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        buyer: { select: { id: true, firstName: true, lastName: true } },
        seller: { select: { id: true, businessName: true } },
      },
    }),
  ])

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
  })

  return {
    totalUsers,
    totalSellers,
    totalBuyers,
    totalCouriers,
    totalProducts,
    totalOrders,
    pendingUsers,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentOrders,
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
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    TO_SHIP: 'bg-orange-100 text-orange-800',
    IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
    OUT_FOR_DELIVERY: 'bg-pink-100 text-pink-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RETURNED: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions) as any

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const data = await getStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">{data.pendingUsers} pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Sellers</CardTitle>
            <Store className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSellers}</div>
            <p className="text-xs text-slate-500 mt-1">Registered sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Buyers</CardTitle>
            <ShoppingCart className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBuyers}</div>
            <p className="text-xs text-slate-500 mt-1">Registered buyers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Couriers</CardTitle>
            <Truck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCouriers}</div>
            <p className="text-xs text-slate-500 mt-1">Registered couriers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-slate-500 mt-1">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-slate-500 mt-1">{data.pendingOrders} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-slate-500 mt-1">Platform sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Users</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div>
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">
                        {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Unknown Buyer'} &bull;{' '}
                        {order.seller ? order.seller.businessName : 'Unknown Seller'}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full mt-4">View All Orders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Users awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">Pending User Approvals</p>
                    <p className="text-xs text-slate-500">{data.pendingUsers} users waiting</p>
                  </div>
                </div>
                <Link href="/admin/users">
                  <Button size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Review
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Pending Orders</p>
                    <p className="text-xs text-slate-500">{data.pendingOrders} orders waiting</p>
                  </div>
                </div>
                <Link href="/admin/orders">
                  <Button size="sm" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Manage Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Approve, reject, and manage user accounts</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Manage Products</CardTitle>
              <Package className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Review and moderate product listings</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Manage Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Monitor and update order statuses</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
