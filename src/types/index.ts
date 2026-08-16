export type UserRole = 'BUYER' | 'SELLER' | 'COURIER' | 'ADMIN'
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'INACTIVE'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'TO_SHIP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'
export type DeliveryStatus = 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED'
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'GCASH' | 'PAYPAL' | 'CREDIT_CARD'

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  status: UserStatus
  lastName: string
  firstName: string
  middleInitial?: string
  sex: string
  contactNo: string
  birthday: string
  age: number
  address: string
  province: string
  municipality: string
  barangay: string
  street?: string
  houseNumber?: string
  idImage?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discount?: number
  stock: number
  images: string
  categoryId: string
  category?: Category
  sellerId: string
  seller?: SellerProfile
  variations?: string
  vouchers?: string
  status: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  children?: Category[]
}

export interface CartItem {
  id: string
  buyerId: string
  productId: string
  product?: Product
  quantity: number
  variation?: string
}

export interface Order {
  id: string
  orderNumber: string
  buyerId: string
  sellerId: string
  courierId?: string
  status: OrderStatus
  totalAmount: number
  commission?: number
  paymentMethod: PaymentMethod
  shippingAddress: string
  trackingNumber?: string
  notes?: string
  items?: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  price: number
  variation?: string
}

export interface Delivery {
  id: string
  courierId: string
  orderId: string
  order?: Order
  status: DeliveryStatus
  fee: number
  profit: number
  acceptedAt: string
}

export interface Rating {
  id: string
  rating: number
  comment?: string
  user?: User
  order?: Order
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  orderId?: string
  createdAt: string
}

export interface Complaint {
  id: string
  complainantId: string
  againstId: string
  orderId?: string
  reason: string
  description: string
  status: ComplaintStatus
  resolution?: string
}

export interface SellerProfile {
  id: string
  userId: string
  businessName: string
  lineOfBusiness: string
  businessPermit?: string
  walletBalance: number
}

export interface CourierProfile {
  id: string
  userId: string
  vehicleType: string
  plateNumber: string
  orCrImage?: string
  licenseImage?: string
  walletBalance: number
  isAvailable: boolean
}

export interface AddressData {
  province: string
  municipality: string
  barangay: string
  street?: string
  houseNumber?: string
}
