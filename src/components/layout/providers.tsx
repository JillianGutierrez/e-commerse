'use client'

import SessionProvider from '@/components/layout/session-provider'
import { ToasterProvider } from '@/components/ui/toaster'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ToasterProvider />
    </SessionProvider>
  )
}
