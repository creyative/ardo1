'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [logo, setLogo] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.logo_url) setLogo(d.logo_url)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
      <div className="text-center space-y-8 p-8">
        {logo && (
          <div className="mb-4">
            <img src={logo} alt="Company Logo" className="h-20 mx-auto" />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Sistem Ujian Online</h1>
          <p className="text-lg text-gray-600">Platform ujian wawasan dan psikotest</p>
        </div>
        <div className="flex justify-center">
          <Link
            href="/exam/join"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Ikuti Ujian
          </Link>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        © 2026 Eduardo. All rights reserved.
      </div>
    </div>
  )
}
