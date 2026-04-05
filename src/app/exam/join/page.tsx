'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/exam/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Kode tidak valid')
    } else {
      sessionStorage.setItem('examParticipant', JSON.stringify(data.participant))
      sessionStorage.setItem('examSession', JSON.stringify(data.session))
      router.push('/exam/biodata')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Masuk Ujian</h1>
        <p className="text-center text-gray-500 mb-8">Masukkan kode peserta yang telah diberikan</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Peserta</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: WS-A3X9K2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              required
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Hubungi panitia jika belum memiliki kode peserta
        </p>
      </div>
    </div>
  )
}
