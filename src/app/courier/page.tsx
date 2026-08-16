import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Truck, CheckCircle, Wallet, Package, ArrowRight, ClipboardList, User, Sparkles } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getDashboardData(userId: string) {
  const courierProfile = await prisma.courierProfile.findUnique({
    where: { userId },
  })

  if (!courierProfile) {
    return null
  }

  const [
    totalDeliveries,
    completedDeliveries,
    totalEarnings,
    activeDeliveries,
    availableOrders,
    recentDeliveries,
  ] = await Promise.all([
    prisma.delivery.count({ where: { courierId: courierProfile.id } }),
    prisma.delivery.count({ where: { courierId: courierProfile.id, status: 'COMPLETED' } }),
    prisma.delivery.aggregate({
      where: { courierId: courierProfile.id, status: 'COMPLETED' },
      _sum: { fee: true },
    }),
    prisma.delivery.count({ where: { courierId: courierProfile.id, status: { not: 'COMPLETED' } } }),
    prisma.order.count({
      where: {
        status: { in: ['TO_SHIP', 'IN_TRANSIT'] },
        courierId: null,
        delivery: null,
      },
    }),
    prisma.delivery.findMany({
      where: { courierId: courierProfile.id },
      include: {
        order: {
          select: { id: true, orderNumber: true, shippingAddress: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return {
    courierProfile,
    totalDeliveries,
    completedDeliveries,
    totalEarnings: totalEarnings._sum.fee || 0,
    activeDeliveries,
    availableOrders,
    recentDeliveries,
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export default async function CourierDashboard() {
  const session = await getServerSession(authOptions) as any

  if (!session || session.user?.role !== 'COURIER') {
    redirect('/auth/login')
  }

  const data = await getDashboardData(session.user.id)

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome!</h1>
          <p className="text-neutral-600 mt-2">Please complete your courier profile to get started.</p>
        </div>
        <Link href="/courier/account">
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
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {session.user.name || 'Courier'}!</h1>
        <p className="text-neutral-600 mt-2">Here&apos;s what&apos;s happening with your deliveries today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDeliveries}</div>
            <p className="text-xs text-neutral-500 mt-1">{data.completedDeliveries} completed</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Completed Deliveries</CardTitle>
            <CheckCircle className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedDeliveries}</div>
            <p className="text-xs text-neutral-500 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalEarnings)}</div>
            <p className="text-xs text-neutral-500 mt-1">From {data.completedDeliveries} deliveries</p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Wallet Balance</CardTitle>
            <Truck className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.courierProfile.walletBalance)}</div>
            <p className="text-xs text-neutral-500 mt-1">Available funds</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
            <CardDescription>You have {data.activeDeliveries} active delivery{data.activeDeliveries !== 1 ? 'ies' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentDeliveries.length === 0 ? (
              <p className="text-sm text-neutral-500">No active deliveries.</p>
            ) : (
              <div className="space-y-4">
                {data.recentDeliveries.map((delivery: any) => (
                  <Link key={delivery.id} href={`/courier/active`}>
                    <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">#{delivery.order?.orderNumber || 'N/A'}</p>
                        <p className="text-xs text-neutral-500 truncate max-w-[200px]">{delivery.deliveryAddress}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          delivery.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          delivery.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                          delivery.status === 'OUT_FOR_DELIVERY' ? 'bg-purple-100 text-purple-800' :
                          delivery.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.status.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm font-medium mt-1">{formatCurrency(delivery.fee)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {data.activeDeliveries > 0 && (
              <Link href="/courier/active">
                <Button variant="outline" className="w-full mt-4 rounded-full">
                  View All Active
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
            <Link href="/courier/deliveries">
              <Button variant="outline" className="w-full justify-start rounded-full">
                <Package className="mr-2 h-4 w-4" />
                Browse Available Deliveries ({data.availableOrders})
              </Button>
            </Link>
            <Link href="/courier/active">
              <Button variant="outline" className="w-full justify-start rounded-full">
                <ClipboardList className="mr-2 h-4 w-4" />
                View Active Deliveries
              </Button>
            </Link>
            <Link href="/courier/earnings">
              <Button variant="outline" className="w-full justify-start rounded-full">
                <Wallet className="mr-2 h-4 w-4" />
                View Earnings
              </Button>
            </Link>
            <Link href="/courier/account">
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
