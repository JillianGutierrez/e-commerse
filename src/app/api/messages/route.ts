import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversations = searchParams.get('conversations')
    const userId = searchParams.get('userId')

    if (conversations === 'true') {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
          receiver: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const conversationMap = new Map<string, Conversation>()

      for (const msg of messages) {
        const otherUserId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId
        const otherUser = msg.senderId === session.user.id ? msg.receiver : msg.sender

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: otherUser.name || otherUser.email,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: 0,
          })
        }

        const conv = conversationMap.get(otherUserId)!
        if (msg.createdAt > conv.lastMessageTime) {
          conv.lastMessage = msg.content
          conv.lastMessageTime = msg.createdAt
        }
        if (msg.receiverId === session.user.id && !msg.isRead) {
          conv.unreadCount++
        }
      }

      return NextResponse.json(Array.from(conversationMap.values()))
    }

    if (userId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: userId },
            { senderId: userId, receiverId: session.user.id },
          ],
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
          receiver: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      await prisma.message.updateMany({
        where: {
          receiverId: session.user.id,
          senderId: userId,
          isRead: false,
        },
        data: { isRead: true },
      })

      return NextResponse.json(messages)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, content, orderId } = body

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver and content are required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        orderId: orderId || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
