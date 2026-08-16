import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (session) {
      return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
    }
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
  }
}
