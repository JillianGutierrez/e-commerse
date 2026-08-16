import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    const where: any = { sellerId: sellerProfile.id }

    if (fromDate || toDate) {
      where.createdAt = {}
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate)
      }
      if (toDate) {
        const endDate = new Date(toDate)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalSales = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    const totalCommission = orders.reduce((sum: number, order: any) => sum + (order.commission || 0), 0)
    const totalOrders = orders.length
    const deliveredOrders = orders.filter((o: any) => o.status === 'DELIVERED').length
    const cancelledOrders = orders.filter((o: any) => o.status === 'CANCELLED').length

    const salesByDate = new Map<string, { sales: number; orders: number }>()

    for (const order of orders) {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      const existing = salesByDate.get(date) || { sales: 0, orders: 0 }
      salesByDate.set(date, {
        sales: existing.sales + order.totalAmount,
        orders: existing.orders + 1,
      })
    }

    const salesChartData = Array.from(salesByDate.entries())
      .map(([date, data]) => ({
        date,
        sales: data.sales,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      summary: {
        totalSales,
        totalCommission,
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        netProfit: totalSales - totalCommission,
      },
      orders,
      salesChartData,
    })
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
