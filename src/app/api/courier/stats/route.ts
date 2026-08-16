import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
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

    const [totalDeliveries, completedDeliveries, totalEarnings] = await Promise.all([
      prisma.delivery.count({ where: { courierId: courierProfile.id } }),
      prisma.delivery.count({ where: { courierId: courierProfile.id, status: 'COMPLETED' } }),
      prisma.delivery.aggregate({
        where: { courierId: courierProfile.id, status: 'COMPLETED' },
        _sum: { fee: true },
      }),
    ])

    return NextResponse.json({
      totalDeliveries,
      completedDeliveries,
      totalEarnings: totalEarnings._sum.fee || 0,
      walletBalance: courierProfile.walletBalance,
      isAvailable: courierProfile.isAvailable,
    })
  } catch (error) {
    console.error('Failed to fetch courier stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
