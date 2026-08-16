'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  Truck,
  CheckCircle,
  Star,
  BarChart3,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react'

const navItems = [
  { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ClipboardList },
  { href: '/seller/reports', label: 'Reports', icon: BarChart3 },
  { href: '/seller/messages', label: 'Messages', icon: MessageSquare },
  { href: '/seller/account', label: 'Account', icon: User },
]

export function SellerSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {!collapsed && (
            <h1 className="text-lg font-bold text-slate-900">Seller Portal</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/seller' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-2">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
