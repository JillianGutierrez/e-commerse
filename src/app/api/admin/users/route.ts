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
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const query = searchParams.get('q') || ''

    const where: any = {}
    if (role && role !== 'ALL') {
      where.role = role
    }
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        contactNo: true,
        address: true,
        province: true,
        municipality: true,
        barangay: true,
        street: true,
        houseNumber: true,
        createdAt: true,
        buyerProfile: true,
        sellerProfile: {
          select: {
            id: true,
            businessName: true,
            lineOfBusiness: true,
            walletBalance: true,
          },
        },
        courierProfile: {
          select: {
            id: true,
            vehicleType: true,
            plateNumber: true,
            walletBalance: true,
            isAvailable: true,
          },
        },
        adminProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, status } = body

    if (!userId || !status) {
      return NextResponse.json({ error: 'User ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INACTIVE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
