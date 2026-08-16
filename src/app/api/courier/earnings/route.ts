import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'COURIER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courierProfile = await prisma.courierProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!courierProfile) {
      return NextResponse.json({ error: 'Courier profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    const where: any = { courierId: courierProfile.id }

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

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        order: {
          select: { id: true, orderNumber: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalEarnings = deliveries.reduce((sum: number, d: any) => sum + d.fee, 0)

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const thisWeek = deliveries
      .filter((d: any) => d.status === 'COMPLETED' && d.deliveredAt && new Date(d.deliveredAt) >= weekAgo)
      .reduce((sum: number, d: any) => sum + d.fee, 0)

    const thisMonth = deliveries
      .filter((d: any) => d.status === 'COMPLETED' && d.deliveredAt && new Date(d.deliveredAt) >= monthAgo)
      .reduce((sum: number, d: any) => sum + d.fee, 0)

    return NextResponse.json({
      totalEarnings,
      thisWeek,
      thisMonth,
      deliveries: deliveries.map((d: any) => ({
        id: d.id,
        fee: d.fee,
        profit: d.profit,
        status: d.status,
        acceptedAt: d.acceptedAt,
        deliveredAt: d.deliveredAt,
        order: d.order,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch earnings:', error)
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 })
  }
}
