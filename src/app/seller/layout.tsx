import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { SellerSidebar } from './components/seller-sidebar'

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions) as any

  if (!session) {
    redirect('/auth/login')
  }

  const rolePortal: Record<string, string> = {
    ADMIN: '/admin',
    BUYER: '/buyer',
    COURIER: '/courier',
  }
  if (session.user?.role !== 'SELLER') {
    redirect(rolePortal[session.user?.role] ?? '/')
  }

  return (
    <div className="min-h-screen bg-white">
      <SellerSidebar />
      <main className={cn('transition-all duration-300', 'ml-64')}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
