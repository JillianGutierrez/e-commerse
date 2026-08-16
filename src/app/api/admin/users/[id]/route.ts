import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        buyerProfile: {
          include: {
            orders: {
              include: {
                items: { include: { product: { select: { id: true, name: true, price: true } } } },
                seller: { select: { businessName: true } },
                courier: { select: { vehicleType: true, plateNumber: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        sellerProfile: {
          include: {
            products: { orderBy: { createdAt: 'desc' }, take: 5 },
            orders: {
              include: {
                items: { include: { product: { select: { id: true, name: true, price: true } } } },
                buyer: { select: { firstName: true, lastName: true, email: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        courierProfile: {
          include: {
            deliveries: {
              include: {
                order: {
                  include: {
                    items: { include: { product: { select: { id: true, name: true, price: true } } } },
                    buyer: { select: { firstName: true, lastName: true } },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            orders: {
              include: {
                items: { include: { product: { select: { id: true, name: true, price: true } } } },
                buyer: { select: { firstName: true, lastName: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        adminProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
