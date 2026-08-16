import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'COURIER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courierProfile = await prisma.courierProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!courierProfile) {
      return NextResponse.json({ error: 'Courier profile not found' }, { status: 404 })
    }

    return NextResponse.json({ isAvailable: courierProfile.isAvailable })
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'COURIER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isAvailable } = body

    const courierProfile = await prisma.courierProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!courierProfile) {
      return NextResponse.json({ error: 'Courier profile not found' }, { status: 404 })
    }

    const updated = await prisma.courierProfile.update({
      where: { id: courierProfile.id },
      data: { isAvailable },
    })

    return NextResponse.json({ isAvailable: updated.isAvailable })
  } catch (error) {
    console.error('Failed to update availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}
