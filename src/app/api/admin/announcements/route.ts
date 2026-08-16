import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, isActive, id } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    let announcement
    if (id) {
      announcement = await prisma.announcement.update({
        where: { id },
        data: { title, content, isActive: isActive ?? true },
      })
    } else {
      announcement = await prisma.announcement.create({
        data: { title, content, isActive: isActive ?? true },
      })
    }

    return NextResponse.json(announcement, { status: id ? 200 : 201 })
  } catch (error) {
    console.error('Failed to save announcement:', error)
    return NextResponse.json({ error: 'Failed to save announcement' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    await prisma.announcement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete announcement:', error)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
