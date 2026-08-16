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

    const product = await prisma.product.findFirst({
      where: { id, seller: { userId: session.user.id } },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, businessName: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
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
    const { name, description, price, discount, stock, images, categoryId, variations, vouchers, status } = body

    const product = await prisma.product.findFirst({
      where: { id, seller: { userId: session.user.id } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        discount: discount || 0,
        stock,
        images: images || product.images,
        categoryId,
        variations: variations !== undefined ? variations : product.variations,
        vouchers: vouchers !== undefined ? vouchers : product.vouchers,
        status: status || product.status,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const product = await prisma.product.findFirst({
      where: { id, seller: { userId: session.user.id } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
