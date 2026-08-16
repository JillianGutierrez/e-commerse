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
    const type = searchParams.get('type')

    if (type === 'available') {
      const availableDeliveries = await prisma.order.findMany({
        where: {
          status: { in: ['TO_SHIP', 'IN_TRANSIT'] },
          courierId: null,
          delivery: null,
        },
        include: {
          buyer: {
            select: { id: true, firstName: true, lastName: true, contactNo: true },
          },
          seller: {
            select: { id: true, businessName: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      const transformed = availableDeliveries.map((order: any) => ({
        id: `del-${order.id}`,
        orderId: order.id,
        order,
        status: 'PENDING',
        pickupAddress: order.seller.businessName,
        deliveryAddress: order.shippingAddress,
        fee: 0,
        profit: 0,
        acceptedAt: order.createdAt,
      }))

      return NextResponse.json(transformed)
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        courierId: courierProfile.id,
        status: { not: 'COMPLETED' },
      },
      include: {
        order: {
          select: { id: true, orderNumber: true, shippingAddress: true, totalAmount: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deliveries)
  } catch (error) {
    console.error('Failed to fetch deliveries:', error)
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
  }
}
