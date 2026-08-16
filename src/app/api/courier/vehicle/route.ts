import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'COURIER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicleType, plateNumber } = body

    const courierProfile = await prisma.courierProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!courierProfile) {
      return NextResponse.json({ error: 'Courier profile not found' }, { status: 404 })
    }

    const updated = await prisma.courierProfile.update({
      where: { id: courierProfile.id },
      data: {
        vehicleType,
        plateNumber,
      },
    })

    return NextResponse.json({ success: true, vehicleType: updated.vehicleType, plateNumber: updated.plateNumber })
  } catch (error) {
    console.error('Failed to update vehicle info:', error)
    return NextResponse.json({ error: 'Failed to update vehicle info' }, { status: 500 })
  }
}
