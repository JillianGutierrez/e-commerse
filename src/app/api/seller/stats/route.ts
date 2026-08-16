import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
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

    const [totalProducts, totalOrders, pendingOrders, totalRevenue] = await Promise.all([
      prisma.product.count({ where: { sellerId: sellerProfile.id } }),
      prisma.order.count({ where: { sellerId: sellerProfile.id } }),
      prisma.order.count({ where: { sellerId: sellerProfile.id, status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
      prisma.order.aggregate({
        where: { sellerId: sellerProfile.id, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
    ])

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      walletBalance: sellerProfile.walletBalance,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
