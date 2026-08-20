import { PrismaClient } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import path from 'path'

let prisma: PrismaClient

const ERP_CATEGORIES = [
  { name: 'Pet Supplies', subcategories: ['Dog Food & Treats', 'Cat Litter & Accessories', 'Aquariums & Fish Supplies', 'Bird Feeders & Food', 'Pet Grooming Products', 'Pet Health & Wellness'] },
  { name: 'Electronics and Gadgets', subcategories: ['Mobile Phones & Accessories', 'Laptops, Desktops & Monitors', 'Audio & Video Equipment', 'Smart Home Devices', 'Cameras & Photography', 'Wearable Technology'] },
  { name: "Women's Apparel", subcategories: ['Dresses & Skirts', 'Tops & Blouses', 'Activewear & Yoga Pants', 'Lingerie & Sleepwear', 'Jackets & Coats', 'Shoes & Accessories'] },
  { name: "Men's Apparel", subcategories: ['Suits & Blazers', 'Casual Shirts & Pants', 'Outerwear & Jackets', 'Activewear & Fitness Gear', 'Shoes & Accessories', 'Grooming Products'] },
  { name: 'Kids and Baby', subcategories: ['Baby Clothes & Accessories', 'Toys & Games', 'Educational Materials', 'Strollers & Gear', 'Nursery Furniture', 'Safety and Health'] },
  { name: 'Home and Garden', subcategories: ['Kitchen Appliances', 'Furniture & Decor', 'Gardening Tools', 'Outdoor Living', 'Home Improvement Tools', 'Bedding & Bath'] },
  { name: 'Sports and Outdoors', subcategories: ['Fitness Equipment', 'Camping & Hiking Gear', 'Sports Apparel', 'Cycling & Bikes', 'Water Sports', 'Team Sports Equipment'] },
  { name: 'Health and Beauty', subcategories: ['Skincare Products', 'Haircare Solutions', 'Makeup & Cosmetics', 'Personal Care Appliances', "Men's Grooming", 'Health Supplements'] },
  { name: 'Books and Media', subcategories: ['Fiction & Non-Fiction Books', 'Magazines & Periodicals', 'Music CDs & Vinyl Records', 'Movie DVDs & Blu-ray', 'Video Games & Consoles', 'Educational DVDs'] },
  { name: 'Food and Gourmet', subcategories: ['Baking Supplies & Ingredients', 'Coffee, Tea & Beverages', 'Snacks & Candy', 'Specialty Foods & International Cuisine', 'Organic and Health Foods', 'Meal Kits & Prepped Foods'] },
  { name: 'Furniture and Office Equipment', subcategories: ['Office Desks & Chairs', 'Storage Cabinets & Shelving', 'Conference & Meeting Furniture', 'Computer Tables & Workstations', 'Ergonomic Accessories', 'Office Lighting & Fixtures'] },
  { name: 'Jewelry and Watches', subcategories: ['Necklaces & Pendants', 'Rings & Earrings', 'Bracelets & Bangles', 'Watches for Men & Women', 'Fashion Jewelry', 'Jewelry Storage & Care'] },
]

const SAMPLE_PRODUCTS = [
  { name: 'Premium Dog Food', category: 'Pet Supplies', price: 45.99, description: 'High-quality nutrition for your furry friend', stock: 100, variation: JSON.stringify([{ name: 'Small (5kg)' }, { name: 'Medium (10kg)' }, { name: 'Large (20kg)' }]) },
  { name: 'Wireless Bluetooth Earbuds', category: 'Electronics and Gadgets', price: 29.99, description: 'Crystal clear sound with noise cancellation', stock: 50, discount: 15, variation: JSON.stringify([{ name: 'Black' }, { name: 'White' }, { name: 'Blue' }]) },
  { name: 'Summer Floral Dress', category: "Women's Apparel", price: 39.99, description: 'Elegant floral dress perfect for summer outings', stock: 30, variation: JSON.stringify([{ size: 'S' }, { size: 'M' }, { size: 'L' }, { size: 'XL' }]) },
  { name: 'Casual Linen Shirt', category: "Men's Apparel", price: 34.99, description: 'Comfortable linen shirt for everyday wear', stock: 45, variation: JSON.stringify([{ size: 'S' }, { size: 'M' }, { size: 'L' }, { size: 'XL' }]) },
  { name: 'Baby Onesie Set', category: 'Kids and Baby', price: 24.99, description: 'Soft cotton onesies for newborns', stock: 60, variation: JSON.stringify([{ size: '0-3M' }, { size: '3-6M' }, { size: '6-12M' }]) },
  { name: 'Coffee Table', category: 'Home and Garden', price: 199.99, description: 'Modern wooden coffee table for living room', stock: 15, discount: 10 },
  { name: 'Yoga Mat Premium', category: 'Sports and Outdoors', price: 35.99, description: 'Non-slip yoga mat with carrying strap', stock: 40, variation: JSON.stringify([{ name: 'Purple' }, { name: 'Blue' }, { name: 'Green' }]) },
  { name: 'Vitamin C Serum', category: 'Health and Beauty', price: 22.99, description: 'Brightening serum for radiant skin', stock: 75, discount: 20 },
  { name: 'Bestselling Novel', category: 'Books and Media', price: 14.99, description: 'Award-winning fiction novel', stock: 100 },
  { name: 'Organic Honey', category: 'Food and Gourmet', price: 18.99, description: 'Pure organic honey from local farms', stock: 50 },
  { name: 'Ergonomic Office Chair', category: 'Furniture and Office Equipment', price: 299.99, description: 'Adjustable ergonomic chair for long work sessions', stock: 20, discount: 5, variation: JSON.stringify([{ name: 'Black' }, { name: 'Gray' }]) },
  { name: 'Silver Pendant Necklace', category: 'Jewelry and Watches', price: 59.99, description: 'Elegant sterling silver pendant on delicate chain', stock: 25, variation: JSON.stringify([{ name: 'Silver' }, { name: 'Gold Plated' }]) },
  { name: 'Smart Watch Pro', category: 'Electronics and Gadgets', price: 249.99, description: 'Advanced fitness tracking and notifications', stock: 35, discount: 10, variation: JSON.stringify([{ name: '40mm' }, { name: '44mm' }]) },
  { name: 'Running Shoes', category: "Women's Apparel", price: 89.99, description: 'Lightweight running shoes with great cushioning', stock: 40, variation: JSON.stringify([{ size: '6' }, { size: '7' }, { size: '8' }, { size: '9' }]) },
  { name: 'Gardening Tool Set', category: 'Home and Garden', price: 54.99, description: 'Complete 12-piece gardening tool set with bag', stock: 30 },
  { name: 'Dumbbell Set', category: 'Sports and Outdoors', price: 129.99, description: 'Adjustable dumbbell set 5-50 lbs', stock: 20, discount: 15 },
]

const TEST_PASSWORD = 'password123'

async function main() {
  // Use absolute path directly - avoids env var resolution issues on Windows
  const dbUrl = `file:${path.resolve(__dirname, '..', 'dev.db').replace(/\\/g, '/')}`
  console.log('DB URL:', dbUrl)
  const adapter = new PrismaLibSql({ url: dbUrl })
  prisma = new PrismaClient({ adapter })

  console.log('Starting seed...')

  const existingCategories = await prisma.category.count()
  if (existingCategories > 0) {
    console.log('Categories already seeded. Skipping...')
  } else {
    for (const category of ERP_CATEGORIES) {
      const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      await prisma.category.create({
        data: {
          name: category.name,
          slug,
        },
      })
    }
    console.log(`Seeded ${ERP_CATEGORIES.length} categories`)
  }

  const existingProducts = await prisma.product.count()
  if (existingProducts > 0) {
    console.log('Products already seeded. Skipping...')
  } else {
    const categories = await prisma.category.findMany()
    const categoryMap = new Map(categories.map(c => [c.name, c.id]))

    const seller1 = await createSeller('Tech Store')
    const seller2 = await createSeller('Fashion Hub')
    const seller3 = await createSeller('Home Essentials')
    const seller4 = await createSeller('Sports World')
    const seller5 = await createSeller('Beauty Corner')
    const seller6 = await createSeller('Food Market')

    const sellers = [seller1, seller2, seller3, seller4, seller5, seller6]

    for (const productData of SAMPLE_PRODUCTS) {
      const categoryId = categoryMap.get(productData.category)
      if (!categoryId) continue

      const seller = sellers[Math.floor(Math.random() * sellers.length)]

      await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          discount: productData.discount || null,
          stock: productData.stock,
          images: '',
          categoryId,
          sellerId: seller.id,
          variations: productData.variation || null,
          status: 'ACTIVE',
        },
      })
    }
    console.log(`Seeded ${SAMPLE_PRODUCTS.length} products`)
  }

  const adminExists = await prisma.user.findFirst({ where: { email: 'admin@test.com' } })
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin User',
        lastName: 'User',
        firstName: 'Admin',
        sex: 'MALE',
        contactNo: '09123456789',
        birthday: '1990-01-01',
        age: 34,
        address: 'Admin Address',
        province: 'Metro Manila',
        municipality: 'Manila',
        barangay: 'Sample',
        role: 'ADMIN',
        status: 'APPROVED',
      },
    })
    await prisma.adminProfile.create({
      data: { userId: admin.id },
    })
    console.log('Created admin user: admin@test.com / password123')
  }

  const buyerExists = await prisma.user.findFirst({ where: { email: 'buyer@test.com' } })
  if (!buyerExists) {
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12)
    const buyer = await prisma.user.create({
      data: {
        email: 'buyer@test.com',
        password: hashedPassword,
        name: 'Test Buyer',
        lastName: 'Buyer',
        firstName: 'Test',
        sex: 'FEMALE',
        contactNo: '09234567890',
        birthday: '1995-05-15',
        age: 29,
        address: 'Buyer Address',
        province: 'Cebu',
        municipality: 'Cebu City',
        barangay: 'Sample',
        role: 'BUYER',
        status: 'APPROVED',
      },
    })
    await prisma.buyerProfile.create({
      data: { userId: buyer.id },
    })
    console.log('Created buyer user: buyer@test.com / password123')
  }

  const courierExists = await prisma.user.findFirst({ where: { email: 'courier@test.com' } })
  if (!courierExists) {
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12)
    const courier = await prisma.user.create({
      data: {
        email: 'courier@test.com',
        password: hashedPassword,
        name: 'Test Courier',
        lastName: 'Courier',
        firstName: 'Test',
        sex: 'MALE',
        contactNo: '09345678901',
        birthday: '1992-08-20',
        age: 32,
        address: 'Courier Address',
        province: 'Davao del Sur',
        municipality: 'Davao City',
        barangay: 'Sample',
        role: 'COURIER',
        status: 'APPROVED',
      },
    })
    await prisma.courierProfile.create({
      data: {
        userId: courier.id,
        vehicleType: 'Motorcycle',
        plateNumber: 'ABC 1234',
        isAvailable: true,
      },
    })
    console.log('Created courier user: courier@test.com / password123')
  }

  console.log('Seed completed!')
}

async function createSeller(name: string): Promise<{ id: string }> {
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12)
  const email = `${name.toLowerCase().replace(/\s+/g, '')}@test.com`
  const existing = await prisma.user.findFirst({ where: { email } })
  if (existing) {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: existing.id } })
    return { id: profile?.id || '' }
  }
  const seller = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name,
      lastName: 'Owner',
      firstName: name.split(' ')[0],
      sex: 'MALE',
      contactNo: '09123456789',
      birthday: '1990-01-01',
      age: 34,
      address: 'Seller Address',
      province: 'Metro Manila',
      municipality: 'Manila',
      barangay: 'Sample',
      role: 'SELLER',
      status: 'APPROVED',
    },
  })
  const profile = await prisma.sellerProfile.create({
    data: {
      userId: seller.id,
      businessName: name,
      lineOfBusiness: 'Retail',
    },
  })
  return { id: profile.id }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
