import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, contactNo, address, province, municipality, barangay, street, houseNumber } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        email,
        name: `${firstName} ${lastName}`,
        contactNo,
        address,
        province,
        municipality,
        barangay,
        street,
        houseNumber,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        contactNo: true,
        address: true,
        province: true,
        municipality: true,
        barangay: true,
        street: true,
        houseNumber: true,
        role: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
