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

    const cartItems = await prisma.cartItem.findMany({
      where: { buyerId: buyerProfile.id },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity, variation } = body

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        buyerId: buyerProfile.id,
        productId,
        variation: variation || null,
      },
    })

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity
      if (newQuantity > product.stock) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
      }

      const updated = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      })
      return NextResponse.json(updated)
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        buyerId: buyerProfile.id,
        productId,
        quantity,
        variation: variation || null,
      },
      include: {
        product: { include: { category: true } },
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('Failed to add to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cartItemId, quantity } = body

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, buyerId: buyerProfile.id },
      include: { product: true },
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    if (cartItem.product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: { include: { category: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    await prisma.cartItem.deleteMany({
      where: { id: itemId, buyerId: buyerProfile.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
