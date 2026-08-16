import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function buildAddress(data: any): string {
  const parts = [
    data.houseNumber,
    data.street,
    data.barangay,
    data.municipality,
    data.province,
  ].filter(Boolean)
  return parts.join(', ')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      middleInitial,
      sex,
      contactNo,
      birthday,
      role,
      province,
      municipality,
      barangay,
      street,
      houseNumber,
      idImage,
      businessName,
      lineOfBusiness,
      businessPermit,
      vehicleType,
      plateNumber,
      orCrImage,
      licenseImage,
    } = body

    if (!email || !password || !firstName || !lastName || !sex || !contactNo || !birthday || !role) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }

    if (!province || !municipality || !barangay) {
      return NextResponse.json({ error: 'Please complete your address (province, municipality, barangay)' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const age = calculateAge(birthday)
    const address = buildAddress({ houseNumber, street, barangay, municipality, province })

    const normalizedRole = role.toUpperCase()

    if (normalizedRole === 'SELLER') {
      if (!businessName || !lineOfBusiness) {
        return NextResponse.json({ error: 'Business name and line of business are required for sellers' }, { status: 400 })
      }
    }

    if (normalizedRole === 'COURIER') {
      if (!vehicleType || !plateNumber) {
        return NextResponse.json({ error: 'Vehicle type and plate number are required for couriers' }, { status: 400 })
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${middleInitial ? middleInitial + ' ' : ''}${lastName}`,
        lastName,
        firstName,
        middleInitial: middleInitial || null,
        sex,
        contactNo,
        birthday,
        age,
        address,
        province,
        municipality,
        barangay,
        street: street || null,
        houseNumber: houseNumber || null,
        idImage: idImage || null,
        role: normalizedRole,
        status: 'PENDING',
      },
    })

    if (normalizedRole === 'SELLER') {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          businessName,
          lineOfBusiness,
          businessPermit: businessPermit || null,
        },
      })
    } else if (normalizedRole === 'COURIER') {
      await prisma.courierProfile.create({
        data: {
          userId: user.id,
          vehicleType,
          plateNumber,
          orCrImage: orCrImage || null,
          licenseImage: licenseImage || null,
        },
      })
    } else if (normalizedRole === 'ADMIN') {
      await prisma.adminProfile.create({
        data: {
          userId: user.id,
        },
      })
    } else {
      await prisma.buyerProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({
      message: 'Registration successful. Please wait for admin approval.',
      userId: user.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
