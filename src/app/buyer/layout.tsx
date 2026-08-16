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

  if (session.user?.role !== 'BUYER') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <BuyerSidebar />
      <main className={cn('transition-all duration-300', 'ml-64')}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
