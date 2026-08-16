import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment } = body
    const { id } = await context.params

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

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

    const existingRating = await prisma.rating.findUnique({
      where: { orderId: id },
    })

    if (existingRating) {
      return NextResponse.json({ error: 'Order already rated' }, { status: 400 })
    }

    const newRating = await prisma.rating.create({
      data: {
        userId: session.user.id,
        orderId: id,
        rating,
        comment: comment || null,
      },
    })

    await prisma.order.update({
      where: { id },
      data: { status: 'DELIVERED' },
    })

    return NextResponse.json(newRating)
  } catch (error) {
    console.error('Failed to submit rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
