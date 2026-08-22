'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wallet,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/courier', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courier/deliveries', label: 'Deliveries', icon: Package },
  { href: '/courier/active', label: 'Active', icon: ClipboardList },
  { href: '/courier/earnings', label: 'Earnings', icon: Wallet },
  { href: '/courier/account', label: 'Account', icon: User },
]

export function CourierSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const handleNavigation = () => {
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/courier" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-lg font-semibold tracking-tight">
            Shopora
          </span>
        </Link>

        <div className="h-10 w-10" />
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r border-neutral-200 bg-white transition-all duration-300',
          'w-72',
          'md:z-40',
          'md:block',
          collapsed ? 'md:w-16' : 'md:w-64',
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
            <Link
              href="/courier"
              onClick={handleNavigation}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />

              <span
                className={cn(
                  'text-lg font-semibold tracking-tight',
                  collapsed && 'md:hidden'
                )}
              >
                Shopora
              </span>
            </Link>

            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="h-8 w-8 md:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Desktop collapse button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto hidden h-8 w-8 md:flex"
              aria-label="Collapse sidebar"
            >
              {collapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/courier' &&
                  pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigation}
                  className={cn(
                    'flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-100',
                    collapsed && 'md:justify-center'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      !collapsed && 'md:mr-3'
                    )}
                  />

                  <span
                    className={cn(
                      'ml-3 md:ml-0',
                      collapsed && 'md:hidden'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-neutral-200 p-3">
            <button
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50',
                collapsed && 'md:justify-center'
              )}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut
                className={cn(
                  'h-5 w-5 shrink-0',
                  !collapsed && 'md:mr-3'
                )}
              />

              <span
                className={cn(
                  'ml-3 md:ml-0',
                  collapsed && 'md:hidden'
                )}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}