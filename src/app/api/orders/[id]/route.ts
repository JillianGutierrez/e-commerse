import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        buyerId: buyerProfile.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
        seller: {
          select: { businessName: true },
        },
        courier: {
          select: { vehicleType: true, plateNumber: true },
        },
        delivery: true,
        rating: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body
    const { id } = await context.params

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        buyerId: buyerProfile.id,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (status === 'CANCELLED' && !['PENDING', 'CONFIRMED'].includes(order.status)) {
      return NextResponse.json({ error: 'Cannot cancel order at this stage' }, { status: 400 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
