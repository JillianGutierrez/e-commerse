import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { sellerId: sellerProfile.id }
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
        buyer: {
          select: { id: true, firstName: true, lastName: true, email: true, contactNo: true },
        },
        courier: {
          select: { id: true, vehicleType: true, plateNumber: true },
        },
        delivery: true,
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
