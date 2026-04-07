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

  useEffect(() => {
    const inactivityTimeout = 5 * 60 * 1000
    let timer: ReturnType<typeof setTimeout>

    const resetTimer = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        signOut({ callbackUrl: '/admin/login' })
      }, inactivityTimeout)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(eventName => window.addEventListener(eventName, resetTimer))
    resetTimer()

    return () => {
      if (timer) clearTimeout(timer)
      events.forEach(eventName => window.removeEventListener(eventName, resetTimer))
    }
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen flex-col md:flex-row">
        <aside suppressHydrationWarning className={`w-full md:w-72 ${colors.bg} shadow-lg flex flex-col`}>
          <div className="p-6 border-b border-white/20">
            <h2 suppressHydrationWarning className="text-xl font-bold text-white">{companyName}</h2>
            <p className="text-sm text-white/70 mt-1">Admin Panel</p>
          </div>
          <nav className="flex flex-wrap gap-2 p-4 md:flex-col md:space-y-1 md:gap-0">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`block flex-1 min-w-[48%] rounded-lg px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname.startsWith(item.href)
                    ? `${colors.lightBg} ${colors.text}`
                    : 'text-white/80 hover:bg-white/20'
                } md:min-w-full md:text-left`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-white/20">
            <p className="text-xs text-white/70 mb-2 truncate">{session?.user?.name || 'Admin'}</p>
          <p className="text-xs text-white/60 mb-3">Logout otomatis setelah 5 menit tidak aktif.</p>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 transition-colors"
            >
              Keluar
            </button>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
