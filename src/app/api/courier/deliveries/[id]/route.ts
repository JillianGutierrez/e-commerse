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
    if (!session || session.user?.role !== 'COURIER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const courierProfile = await prisma.courierProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!courierProfile) {
      return NextResponse.json({ error: 'Courier profile not found' }, { status: 404 })
    }

    let delivery = await prisma.delivery.findFirst({
      where: { id, courierId: courierProfile.id },
      include: {
        order: {
          select: { id: true, orderNumber: true, shippingAddress: true, totalAmount: true, status: true, trackingNumber: true, notes: true },
        },
      },
    })

    if (!delivery && id.startsWith('del-')) {
      const orderId = id.replace('del-', '')
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          buyer: {
            select: { id: true, firstName: true, lastName: true, contactNo: true, address: true },
          },
          seller: {
            select: { id: true, businessName: true },
          },
        },
      })

      if (order && (order.status === 'TO_SHIP' || order.status === 'IN_TRANSIT')) {
        delivery = {
          id,
          courierId: '',
          orderId: order.id,
          order,
          status: 'PENDING',
          pickupAddress: order.seller.businessName,
          deliveryAddress: order.shippingAddress,
          weight: undefined,
          fee: 0,
          profit: 0,
          acceptedAt: order.createdAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        }
      }
    }

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    return NextResponse.json(delivery)
  } catch (error) {
    console.error('Failed to fetch delivery:', error)
    return NextResponse.json({ error: 'Failed to fetch delivery' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'COURIER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { status } = body

    const courierProfile = await prisma.courierProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!courierProfile) {
      return NextResponse.json({ error: 'Courier profile not found' }, { status: 404 })
    }

    if (status === 'ACCEPTED') {
      if (id.startsWith('del-')) {
        const orderId = id.replace('del-', '')
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        })

        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const seller = await prisma.sellerProfile.findUnique({
          where: { id: order.sellerId },
        })

        const delivery = await prisma.delivery.create({
          data: {
            courierId: courierProfile.id,
            orderId: order.id,
            status: 'ACCEPTED',
            pickupAddress: seller ? `${seller.businessName} Warehouse` : 'Seller Warehouse',
            deliveryAddress: order.shippingAddress,
            fee: 0,
            profit: 0,
          },
          include: {
            order: {
              select: { id: true, orderNumber: true, shippingAddress: true, totalAmount: true, status: true },
            },
          },
        })

        await prisma.order.update({
          where: { id: order.id },
          data: { courierId: courierProfile.id },
        })

        return NextResponse.json(delivery)
      }

      const delivery = await prisma.delivery.findFirst({
        where: { id, courierId: courierProfile.id },
      })

      if (!delivery) {
        return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
      }

      const updated = await prisma.delivery.update({
        where: { id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
        include: {
          order: {
            select: { id: true, orderNumber: true, shippingAddress: true, totalAmount: true, status: true },
          },
        },
      })

      return NextResponse.json(updated)
    }

    const delivery = await prisma.delivery.findFirst({
      where: { id, courierId: courierProfile.id },
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    const updateData: any = { status }

    if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date()
    } else if (status === 'COMPLETED') {
      updateData.deliveredAt = new Date()
    }

    const updated = await prisma.delivery.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: { id: true, orderNumber: true, shippingAddress: true, totalAmount: true, status: true },
        },
      },
    })

    if (status === 'COMPLETED') {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update delivery:', error)
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 })
  }
}
