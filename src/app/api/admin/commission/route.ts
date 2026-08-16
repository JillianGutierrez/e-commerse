import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import commissionConfig from '@/data/commission-config.json'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const commissionRate = (commissionConfig as any).commissionRate ?? 0.10

    const orders = await prisma.order.findMany({
      include: {
        seller: {
          select: { id: true, businessName: true },
        },
      },
    })

    const totalSales = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    const totalCommission = orders.reduce((sum: number, order: any) => sum + (order.commission || 0), 0)
    const totalOrders = orders.length

    const sellerMap = new Map<string, { businessName: string; totalSales: number; totalCommission: number }>()

    for (const order of orders) {
      const existing = sellerMap.get(order.sellerId) || { businessName: order.seller.businessName, totalSales: 0, totalCommission: 0 }
      existing.totalSales += order.totalAmount
      existing.totalCommission += order.commission || 0
      sellerMap.set(order.sellerId, existing)
    }

    const breakdown = Array.from(sellerMap.entries()).map(([sellerId, data]) => ({
      sellerId,
      businessName: data.businessName,
      totalSales: data.totalSales,
      totalCommission: data.totalCommission,
    }))

    return NextResponse.json({
      commissionRate,
      totalCommission,
      totalOrders,
      totalSales,
      breakdown,
    })
  } catch (error) {
    console.error('Failed to fetch commission data:', error)
    return NextResponse.json({ error: 'Failed to fetch commission data' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { commissionRate } = body

    if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 1) {
      return NextResponse.json({ error: 'Commission rate must be between 0 and 1' }, { status: 400 })
    }

    const fs = await import('fs')
    const path = await import('path')
    const configPath = path.join(process.cwd(), 'src', 'data', 'commission-config.json')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    config.commissionRate = commissionRate
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    return NextResponse.json({ success: true, commissionRate })
  } catch (error) {
    console.error('Failed to update commission rate:', error)
    return NextResponse.json({ error: 'Failed to update commission rate' }, { status: 500 })
  }
}
