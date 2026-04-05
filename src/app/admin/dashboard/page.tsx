'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({ sessions: 0, participants: 0, results: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/participants').then(r => r.json()),
      fetch('/api/results').then(r => r.json()),
    ]).then(([sessions, participants, results]) => {
      setStats({
        sessions: Array.isArray(sessions) ? sessions.length : 0,
        participants: Array.isArray(participants) ? participants.length : 0,
        results: Array.isArray(results) ? results.length : 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Total Sesi', value: stats.sessions, href: '/admin/sessions', color: 'bg-blue-500' },
    { label: 'Total Peserta', value: stats.participants, href: '/admin/participants', color: 'bg-green-500' },
    { label: 'Telah Selesai', value: stats.results, href: '/admin/results', color: 'bg-purple-500' },
  ]

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cards.map(card => (
            <Link key={card.href} href={card.href}>
              <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${card.color} rounded-lg mb-4 flex items-center justify-center`}>
                  <span className="text-white text-xl font-bold">{card.value}</span>
                </div>
                <p className="text-gray-600 text-sm">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/sessions/new" className="px-4 py-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium text-center hover:bg-blue-100">
              Buat Sesi Baru
            </Link>
            <Link href="/admin/participants/new" className="px-4 py-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium text-center hover:bg-green-100">
              Tambah Peserta
            </Link>
            <Link href="/admin/results" className="px-4 py-3 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium text-center hover:bg-purple-100">
              Lihat Hasil
            </Link>
            <a href="/api/results/export?format=excel" className="px-4 py-3 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium text-center hover:bg-orange-100">
              Export Hasil
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
