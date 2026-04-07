'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react'

export default function Home() {
  const [logo, setLogo] = useState('')
  const [headline, setHeadline] = useState('Driving organizational excellence through digitalized assessments for training enrollment, role alignment, and workforce evaluation within ASL Group.')
  const [headlineSize, setHeadlineSize] = useState('text-4xl')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.logo_url) setLogo(d.logo_url)
        if (d.headline) setHeadline(d.headline)
        if (d.headline_size) setHeadlineSize(d.headline_size)
      })
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="relative isolate overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-sky-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_40px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-10">
            <div className="flex flex-col items-center gap-8 text-center">
              {logo && (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 shadow-lg shadow-slate-200/70">
                  <img src={logo} alt="Company Logo" className="h-16 w-16 rounded-full object-cover" />
                </div>
              )}

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">Sistem Ujian Online</p>
                <h1 className={`mt-5 font-bold tracking-tight text-slate-950 sm:${headlineSize.replace('text-', 'sm:text-').replace('xl', 'xl')} ${headlineSize}`}>
                  {headline}
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  Lakukan tes wawasan dan psikotes dengan platform modern, hasil real-time, dan interface yang responsif di semua perangkat.
                </p>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/exam/join"
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-700"
                >
                  Mulai Ujian
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-6 shadow-sm shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-900">Mobile Friendly</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Desain fleksibel untuk HP, tablet, dan desktop agar karyawan nyaman mengerjakan assessment.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-6 shadow-sm shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-900">Keamanan Lengkap</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Proteksi data dan sesi assessment yang lebih aman untuk perusahaan dan kandidat.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-6 shadow-sm shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-900">Hasil Otomatis</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Laporan cepat dan terstruktur sehingga HR bisa langsung melihat performa kandidat.
                </p>
              </div>
            </div>
          </div>

          <footer className="mt-14 text-center text-sm text-slate-500">
            © 2026 Eduardo. All rights reserved.
          </footer>
        </div>
      </div>
    </main>
  )
}
