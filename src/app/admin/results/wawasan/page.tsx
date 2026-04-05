'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function WawasanResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchResults = async () => {
    setLoading(true)
    const url = sessionId ? `/api/results?sessionId=${sessionId}` : '/api/results?type=wawasan'
    const res = await fetch(url)
    const data = await res.json()
    setResults(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/sessions?type=wawasan').then(r => r.json()).then(d => setSessions(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => { fetchResults() }, [sessionId])

  const avgScore = results.length > 0 ? results.reduce((s, r) => s + (r.score || 0), 0) / results.length : 0
  const maxScore = results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0
  const minScore = results.length > 0 ? Math.min(...results.map(r => r.score || 0)) : 0

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hasil Wawasan</h1>
          <a href={`/api/results/export${sessionId ? `?sessionId=${sessionId}&type=wawasan` : '?type=wawasan'}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            Export Excel
          </a>
        </div>
        <div className="mb-4">
          <select value={sessionId} onChange={e => setSessionId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Sesi Wawasan</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Rata-rata Skor', value: avgScore.toFixed(1) },
              { label: 'Skor Tertinggi', value: maxScore.toFixed(1) },
              { label: 'Skor Terendah', value: minScore.toFixed(1) },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Hasil</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sesi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Soal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggaran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selesai</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Memuat...</td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Tidak ada hasil</td>
                  </tr>
                ) : (
                  results.map(result => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.participants?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.participants?.sessions?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.score?.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.correct_answers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.total_questions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.violations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.finished_at).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}