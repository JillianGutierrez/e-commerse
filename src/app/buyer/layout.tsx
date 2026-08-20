import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { BuyerSidebar } from './components/buyer-sidebar'

export default async function BuyerLayout({
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
    SELLER: '/seller',
    COURIER: '/courier',
  }
  if (session.user?.role !== 'BUYER') {
    redirect(rolePortal[session.user?.role] ?? '/')
  }

  return (
    <div className="min-h-screen bg-white">
      <BuyerSidebar />
      <main className={cn('transition-all duration-300', 'ml-64')}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
