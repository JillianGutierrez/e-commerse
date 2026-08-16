import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { DefaultSession } from 'next-auth'
import prisma from '@/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      status: string
    } & DefaultSession['user']
  }
  interface User {
    role: string
    status: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
          include: {
            buyerProfile: true,
            sellerProfile: true,
            courierProfile: true,
            adminProfile: true,
          }
        })

        if (!user || !user.password) return null

        const bcrypt = await import('bcryptjs')
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}
