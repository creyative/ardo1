import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Sistem Ujian Online',
  description: 'Platform ujian wawasan dan psikotest',
  viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover' },
  themeColor: '#2563eb',
  icons: {
    icon: [
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' }
    ],
    shortcut: { url: '/icon-192.png', type: 'image/png' },
    apple: [{ url: '/apple-touch-icon.png' }]
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
