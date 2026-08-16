'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Grid3x3,
  Search,
  ShoppingCart,
  Package,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/buyer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/buyer/categories', label: 'Categories', icon: Grid3x3 },
  { href: '/buyer/search', label: 'Search', icon: Search },
  { href: '/buyer/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/buyer/orders', label: 'Orders', icon: Package },
  { href: '/buyer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/buyer/account', label: 'Account', icon: User },
]

export function BuyerSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-neutral-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          {!collapsed && (
            <Link href="/buyer" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-lg font-semibold tracking-tight">Shopora</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 ml-auto"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/buyer' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-neutral-200 p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50',
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
