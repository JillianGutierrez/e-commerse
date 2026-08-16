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
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        complainant: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        against: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true },
        },
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Failed to fetch complaint:', error)
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { status, resolution } = body

    const updateData: any = {}
    if (status) {
      const validStatuses = ['OPEN', 'RESOLVED', 'CLOSED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updateData.status = status
    }
    if (resolution !== undefined) {
      updateData.resolution = resolution
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
      include: {
        complainant: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        against: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true },
        },
      },
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Failed to update complaint:', error)
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}
