import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CourierSidebar } from './components/courier-sidebar'

export default async function CourierLayout({
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
    SELLER: '/seller',
  }

  if (session.user?.role !== 'COURIER') {
    redirect(rolePortal[session.user?.role] ?? '/')
  }

  return (
    <div className="min-h-screen bg-white">
      <CourierSidebar />

      <main className="min-h-screen pt-16 transition-all duration-300 md:ml-64 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}