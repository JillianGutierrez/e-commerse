import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? 'file:dev.db'
  const dbUrl = rawUrl.startsWith('file:')
    ? `file:${path.resolve(rawUrl.replace('file:', '').replace(/^\.\//, '')).replace(/\\/g, '/')}`
    : rawUrl

  const adapter = new PrismaLibSql({ url: dbUrl })
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
