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
      <div className="p-6 lg:p-8">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">Dashboard Admin</h1>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Ringkasan cepat sesi, peserta, dan hasil assessment untuk karyawan.
              </p>
            </div>
            <div className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
              Mobile friendly & PWA ready
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3 mb-8">
          {cards.map(card => (
            <Link key={card.href} href={card.href}>
              <div className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl ${card.color} text-white shadow-lg shadow-slate-200/30`}>
                  <span className="text-xl font-semibold">{card.value}</span>
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{card.value}</p>
                <div className="mt-5 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Lihat detail
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Aksi Cepat</h2>
            <p className="mt-2 text-sm text-slate-600">Kelola sesi dan peserta dengan cepat langsung dari dashboard.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link href="/admin/sessions/new" className="rounded-3xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100">
                Buat Sesi Baru
              </Link>
              <Link href="/admin/participants/new" className="rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                Tambah Peserta
              </Link>
              <Link href="/admin/results" className="rounded-3xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
                Lihat Hasil
              </Link>
              <a href="/api/results/export?format=excel" className="rounded-3xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100">
                Export Hasil
              </a>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Ringkasan Sistem</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Sinkronisasi otomatis</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Data sesi dan peserta selalu up-to-date.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Pengalaman PWA</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Dashboard dapat dijalankan dengan lancar pada perangkat mobile.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Antarmuka profesional</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Tampilan yang rapi untuk pengelolaan HR dan rekrutmen.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
