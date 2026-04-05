'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/sessions', label: 'Sesi Tes' },
  { href: '/admin/participants', label: 'Peserta' },
  { href: '/admin/results/wawasan', label: 'Hasil Wawasan' },
  { href: '/admin/results/psikotest', label: 'Hasil Psikotest' },
  { href: '/admin/settings', label: 'Pengaturan Perusahaan' },
  { href: '/admin/account', label: 'Akun Admin' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [primaryColor, setPrimaryColor] = useState<string>('blue')
  const [companyName, setCompanyName] = useState<string>('Sistem Ujian')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedColor = localStorage.getItem('primaryColor')
    const savedCompany = localStorage.getItem('companyName')
    if (savedColor) setPrimaryColor(savedColor)
    if (savedCompany) setCompanyName(savedCompany)

    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.primary_color) {
          setPrimaryColor(d.primary_color)
          localStorage.setItem('primaryColor', d.primary_color)
        }
        if (d.company_name) {
          setCompanyName(d.company_name)
          localStorage.setItem('companyName', d.company_name)
        }
        setMounted(true)
      })
      .catch(() => setMounted(true))
  }, [])

  const colorClasses = {
    'blue': { bg: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200' },
    'purple': { bg: 'bg-purple-600', text: 'text-purple-600', lightBg: 'bg-purple-50', border: 'border-purple-200' },
    'green': { bg: 'bg-green-600', text: 'text-green-600', lightBg: 'bg-green-50', border: 'border-green-200' },
    'red': { bg: 'bg-red-600', text: 'text-red-600', lightBg: 'bg-red-50', border: 'border-red-200' },
    'indigo': { bg: 'bg-indigo-600', text: 'text-indigo-600', lightBg: 'bg-indigo-50', border: 'border-indigo-200' },
  } as Record<string, any>

  const colors = colorClasses[primaryColor] || colorClasses['blue']

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside suppressHydrationWarning className={`w-64 ${colors.bg} shadow-lg flex flex-col`}>
        <div className="p-6 border-b border-white/20">
          <h2 suppressHydrationWarning className="text-xl font-bold text-white">{companyName}</h2>
          <p className="text-sm text-white/70 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? `${colors.lightBg} ${colors.text}`
                  : 'text-white/80 hover:bg-white/20'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <p className="text-xs text-white/70 mb-2">{session?.user?.name}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-sm text-white hover:bg-white/20 rounded px-2 py-1 text-left transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
