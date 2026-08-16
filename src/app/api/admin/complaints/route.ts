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
    const status = searchParams.get('status')
    const query = searchParams.get('q') || ''
    const typeFilter = searchParams.get('type')

    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (query) {
      where.OR = [
        { reason: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { complainant: { firstName: { contains: query, mode: 'insensitive' } } },
        { complainant: { lastName: { contains: query, mode: 'insensitive' } } },
        { against: { firstName: { contains: query, mode: 'insensitive' } } },
        { against: { lastName: { contains: query, mode: 'insensitive' } } },
      ]
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        complainant: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        against: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const filtered = complaints.filter((c: any) => {
      if (!typeFilter || typeFilter === 'ALL') return true
      return c.reason === typeFilter
    })

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Failed to fetch complaints:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { complaintId, status, resolution } = body

    if (!complaintId || !status) {
      return NextResponse.json({ error: 'Complaint ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['OPEN', 'RESOLVED', 'CLOSED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: any = { status }
    if (resolution !== undefined) {
      updateData.resolution = resolution
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
      include: {
        complainant: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        against: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Failed to update complaint:', error)
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}
