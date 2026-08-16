import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Truck,
  ShoppingCart,
  FileText,
} from 'lucide-react'
import { notFound } from 'next/navigation'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-gray-100 text-gray-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    TO_SHIP: 'bg-orange-100 text-orange-800',
    IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
    OUT_FOR_DELIVERY: 'bg-pink-100 text-pink-800',
    ACTIVE: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    OUT_OF_STOCK: 'bg-red-100 text-red-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    PICKED_UP: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      buyerProfile: {
        include: {
          orders: {
            include: {
              items: { include: { product: { select: { id: true, name: true, price: true } } } },
              seller: { select: { businessName: true } },
              courier: { select: { vehicleType: true, plateNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      sellerProfile: {
        include: {
          products: { orderBy: { createdAt: 'desc' }, take: 5 },
          orders: {
            include: {
              items: { include: { product: { select: { id: true, name: true, price: true } } } },
              buyer: { select: { firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      courierProfile: {
        include: {
          deliveries: {
            include: {
              order: {
                include: {
                  items: { include: { product: { select: { id: true, name: true, price: true } } } },
                  buyer: { select: { firstName: true, lastName: true } },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          orders: {
            include: {
              items: { include: { product: { select: { id: true, name: true, price: true } } } },
              buyer: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      adminProfile: true,
    },
  })

  if (!user) {
    notFound()
  }

  const roleLabel = user.role
  const profile = user.buyerProfile || user.sellerProfile || user.courierProfile || user.adminProfile

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Details</h1>
          <p className="text-slate-600 mt-1">Viewing profile for {user.name || `${user.firstName} ${user.lastName}`}</p>
        </div>
        <Link href="/admin/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-600">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-lg">{user.name || `${user.firstName} ${user.lastName}`}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Role:</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Status:</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Contact:</span>
                  <span>{user.contactNo || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Joined:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <span className="text-slate-600">
                  {user.houseNumber} {user.street}, {user.barangay}, {user.municipality}, {user.province}
                </span>
              </div>
            </CardContent>
          </Card>

          {user.sellerProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Seller Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-600">Business Name:</span>
                  <span className="ml-2 font-medium">{user.sellerProfile.businessName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Line of Business:</span>
                  <span className="ml-2">{user.sellerProfile.lineOfBusiness}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Wallet Balance:</span>
                  <span className="ml-2 font-medium">{formatCurrency(user.sellerProfile.walletBalance)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {user.courierProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Courier Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-600">Vehicle Type:</span>
                  <span className="ml-2 font-medium">{user.courierProfile.vehicleType}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Plate Number:</span>
                  <span className="ml-2">{user.courierProfile.plateNumber}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Available:</span>
                  <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${user.courierProfile.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.courierProfile.isAvailable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">Wallet Balance:</span>
                  <span className="ml-2 font-medium">{formatCurrency(user.courierProfile.walletBalance)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {user.buyerProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Buyer Orders ({user.buyerProfile.orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.buyerProfile.orders.length === 0 ? (
                  <p className="text-sm text-slate-500">No orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {user.buyerProfile.orders.map((order: any) => (
                      <div key={order.id} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">#{order.orderNumber}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Seller: {order.seller?.businessName || 'N/A'} &bull;{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium mt-1">{formatCurrency(order.totalAmount)}</p>
                        {order.items && order.items.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {order.items.map((item: any) => (
                              <p key={item.id} className="text-xs text-slate-500">
                                {item.product?.name} x {item.quantity} - {formatCurrency(item.price * item.quantity)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user.sellerProfile && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Products ({user.sellerProfile.products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.sellerProfile.products.length === 0 ? (
                    <p className="text-sm text-slate-500">No products yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {user.sellerProfile.products.map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-slate-500">{formatCurrency(product.price)} &bull; Stock: {product.stock}</p>
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orders ({user.sellerProfile.orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.sellerProfile.orders.length === 0 ? (
                    <p className="text-sm text-slate-500">No orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {user.sellerProfile.orders.map((order: any) => (
                        <div key={order.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">#{order.orderNumber}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Buyer: {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'N/A'} &bull;{' '}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium mt-1">{formatCurrency(order.totalAmount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {user.courierProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Deliveries ({user.courierProfile.deliveries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.courierProfile.deliveries.length === 0 ? (
                  <p className="text-sm text-slate-500">No deliveries yet.</p>
                ) : (
                  <div className="space-y-4">
                    {user.courierProfile.deliveries.map((delivery: any) => (
                      <div key={delivery.id} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">Order #{delivery.order?.orderNumber || 'N/A'}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                            {delivery.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          From: {delivery.pickupAddress} &rarr; To: {delivery.deliveryAddress}
                        </p>
                        <p className="text-sm font-medium mt-1">Fee: {formatCurrency(delivery.fee)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
