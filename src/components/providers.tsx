'use client'
import { SessionProvider } from 'next-auth/react'
import { FaviconManager } from './FaviconManager'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FaviconManager />
      {children}
    </SessionProvider>
  )
}
