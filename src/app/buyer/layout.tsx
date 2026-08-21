import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    <div className="min-h-screen bg-white">
      <BuyerSidebar />

      <main className="min-h-screen pt-16 transition-all duration-300 md:ml-64 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}