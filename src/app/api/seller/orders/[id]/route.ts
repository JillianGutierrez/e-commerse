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
    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const order = await prisma.order.findFirst({
      where: { id, seller: { userId: session.user.id } },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true, stock: true },
            },
          },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, email: true, contactNo: true, address: true },
        },
        courier: {
          select: { id: true, vehicleType: true, plateNumber: true, isAvailable: true },
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
    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { status, trackingNumber, notes, courierId } = body

    const order = await prisma.order.findFirst({
      where: { id, seller: { userId: session.user.id } },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (notes !== undefined) updateData.notes = notes
    if (courierId !== undefined) updateData.courierId = courierId

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true },
            },
          },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    if (status === 'DELIVERED') {
      const delivery = await prisma.delivery.findUnique({
        where: { orderId: id },
      })

      if (delivery) {
        await prisma.delivery.update({
          where: { id: delivery.id },
          data: {
            status: 'COMPLETED',
            deliveredAt: new Date(),
          },
        })
      }
    }

    if (status === 'TO_SHIP' && courierId) {
      const existingDelivery = await prisma.delivery.findUnique({
        where: { orderId: id },
      })

      if (!existingDelivery) {
        const seller = await prisma.sellerProfile.findUnique({
          where: { id: order.sellerId },
        })

        if (seller) {
          await prisma.delivery.create({
            data: {
              courierId,
              orderId: id,
              status: 'ACCEPTED',
              pickupAddress: `${seller.businessName} Warehouse`,
              deliveryAddress: order.shippingAddress,
              fee: 0,
              profit: 0,
            },
          })
        }
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
