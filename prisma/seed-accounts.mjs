import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbUrl = 'file:' + path.resolve(__dirname, '..', 'dev.db').replace(/\\/g, '/')

console.log('Connecting to:', dbUrl)

const adapter = new PrismaLibSql({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

const TEST_PASSWORD = 'password123'

async function upsertUser({ email, firstName, lastName, role, extraProfile }) {
  const existing = await prisma.user.findFirst({ where: { email } })
  if (existing) {
    console.log(`User already exists: ${email}`)
    return existing
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      sex: 'MALE',
      contactNo: '09123456789',
      birthday: '1990-01-01',
      age: 34,
      address: 'Test Address',
      province: 'Metro Manila',
      municipality: 'Manila',
      barangay: 'Sample',
      role,
      status: 'APPROVED',
    },
  })

  await extraProfile(user.id)
  console.log(`Created: ${email} / ${TEST_PASSWORD}`)
  return user
}

async function main() {
  await upsertUser({
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    extraProfile: (id) => prisma.adminProfile.create({ data: { userId: id } }),
  })

  await upsertUser({
    email: 'buyer@test.com',
    firstName: 'Test',
    lastName: 'Buyer',
    role: 'BUYER',
    extraProfile: (id) => prisma.buyerProfile.create({ data: { userId: id } }),
  })

  await upsertUser({
    email: 'courier@test.com',
    firstName: 'Test',
    lastName: 'Courier',
    role: 'COURIER',
    extraProfile: (id) =>
      prisma.courierProfile.create({
        data: {
          userId: id,
          vehicleType: 'Motorcycle',
          plateNumber: 'ABC 1234',
          isAvailable: true,
        },
      }),
  })

  await upsertUser({
    email: 'techstore@test.com',
    firstName: 'Tech',
    lastName: 'Store',
    role: 'SELLER',
    extraProfile: (id) =>
      prisma.sellerProfile.create({
        data: {
          userId: id,
          businessName: 'Tech Store',
          lineOfBusiness: 'Retail',
        },
      }),
  })

  console.log('\nAll test accounts ready!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
