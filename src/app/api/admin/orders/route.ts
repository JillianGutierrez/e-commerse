import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const query = searchParams.get('q') || ''

    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (query) {
      where.OR = [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { buyer: { user: { firstName: { contains: query, mode: 'insensitive' } } } },
        { buyer: { user: { lastName: { contains: query, mode: 'insensitive' } } } },
        { buyer: { user: { email: { contains: query, mode: 'insensitive' } } } },
        { seller: { businessName: { contains: query, mode: 'insensitive' } } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
        buyer: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, contactNo: true },
            },
          },
        },
        seller: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        courier: {
          select: { id: true, vehicleType: true, plateNumber: true },
        },
        delivery: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedOrders = orders.map((order: any) => ({
      ...order,
      buyer: {
        ...order.buyer,
        firstName: order.buyer.user.firstName,
        lastName: order.buyer.user.lastName,
        email: order.buyer.user.email,
      },
      seller: {
        ...order.seller,
        user: {
          firstName: order.seller.user.firstName,
          lastName: order.seller.user.lastName,
          email: order.seller.user.email,
        },
      },
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'TO_SHIP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
        buyer: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
