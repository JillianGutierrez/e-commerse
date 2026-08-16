import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, lineOfBusiness, businessPermit } = body

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerProfile.id },
      data: {
        businessName,
        lineOfBusiness,
        businessPermit: businessPermit || null,
      },
    })

    return NextResponse.json({ success: true, businessName: updated.businessName })
  } catch (error) {
    console.error('Failed to update business info:', error)
    return NextResponse.json({ error: 'Failed to update business info' }, { status: 500 })
  }
}
