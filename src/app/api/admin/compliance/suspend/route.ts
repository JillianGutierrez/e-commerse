import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sellerId } = body

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      include: { user: true },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    if (seller.user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Seller is already suspended' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: seller.userId },
      data: { status: 'SUSPENDED' },
    })

    return NextResponse.json({
      success: true,
      message: `Seller ${seller.user.firstName} ${seller.user.lastName} has been suspended`,
    })
  } catch (error) {
    console.error('Failed to suspend seller:', error)
    return NextResponse.json({ error: 'Failed to suspend seller' }, { status: 500 })
  }
}
