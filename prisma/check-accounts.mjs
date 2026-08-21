import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbUrl = 'file:' + path.resolve(__dirname, '..', 'dev.db').replace(/\\/g, '/')

const adapter = new PrismaLibSql({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

const emails = ['admin@test.com', 'buyer@test.com', 'courier@test.com', 'techstore@test.com']

for (const email of emails) {
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      buyerProfile: true,
      sellerProfile: true,
      courierProfile: true,
      adminProfile: true,
    }
  })
  if (!user) { console.log(email, '=> NOT FOUND'); continue }
  const valid = await bcrypt.compare('password123', user.password ?? '')
  console.log(
    email,
    '| role:', user.role,
    '| status:', user.status,
    '| password valid:', valid,
    '| adminProfile:', !!user.adminProfile,
    '| sellerProfile:', !!user.sellerProfile,
    '| buyerProfile:', !!user.buyerProfile,
    '| courierProfile:', !!user.courierProfile,
  )
}

await prisma.$disconnect()
