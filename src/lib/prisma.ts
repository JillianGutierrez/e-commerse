import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = (global as any).prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  ;(global as any).prisma = prisma
}

export default prisma
