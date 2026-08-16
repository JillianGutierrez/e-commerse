import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update password:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
