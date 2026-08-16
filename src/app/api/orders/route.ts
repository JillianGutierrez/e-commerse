import commissionConfig from '@/data/commission-config.json'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { buyerId: buyerProfile.id }
    if (status && status !== 'ALL') {
      where.status = status
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
        seller: {
          select: { businessName: true },
        },
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, paymentMethod, shippingAddress, notes, voucherCode } = body

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { seller: true, category: true },
    })

    const productMap = new Map(products.map((p: any) => [p.id, p]))

    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId) as any
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }
      const price = product.discount
        ? product.price - (product.price * product.discount / 100)
        : product.price

      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        variation: item.variation || null,
      }
    })

    const totalAmount = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    const commission = totalAmount * ((commissionConfig as any).commissionRate ?? 0.10)

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: buyerProfile.id,
        sellerId: products[0]?.sellerId || '',
        status: 'PENDING',
        totalAmount,
        commission,
        paymentMethod,
        shippingAddress: shippingAddress || buyerProfile.user.address || '',
        notes: notes || null,
        vouchers: voucherCode || null,
        discounts: 0,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (product) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        })
      }
    }

    await prisma.cartItem.deleteMany({
      where: {
        buyerId: buyerProfile.id,
        productId: { in: productIds },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
