'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function PsikotestResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchResults = async () => {
    setLoading(true)
    const url = sessionId ? `/api/results?sessionId=${sessionId}` : '/api/results?type=psikotest'
    const res = await fetch(url)
    const data = await res.json()
    setResults(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/sessions?type=psikotest').then(r => r.json()).then(d => setSessions(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => { fetchResults() }, [sessionId])

  const avgScore = results.length > 0 ? results.reduce((s, r) => s + (r.score || 0), 0) / results.length : 0
  const maxScore = results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0
  const minScore = results.length > 0 ? Math.min(...results.map(r => r.score || 0)) : 0

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hasil Psikotest</h1>
          <a href={`/api/results/export${sessionId ? `?sessionId=${sessionId}&type=psikotest` : '?type=psikotest'}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            Export Excel
          </a>
        </div>
        <div className="mb-4">
          <select value={sessionId} onChange={e => setSessionId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Sesi Psikotest</option>
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
              <div key={stat.label} className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peserta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Benar/Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggaran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Memuat...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Belum ada hasil psikotest</td></tr>
              ) : results.map(r => (
                <tr key={r.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.participants?.name}</td>
                  <td className="px-6 py-4"><code className="text-xs bg-gray-100 px-2 py-1 rounded">{r.participants?.participant_code}</code></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.participants?.sessions?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-lg ${r.score >= 70 ? 'text-green-600' : r.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {r.score?.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.correct_answers || '-'}/{r.total_questions}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.violations || 0}</td>
                  <td className="px-6 py-4">
                    <a href={`/exam/result?participantId=${r.participant_id}`} target="_blank"
                      className="text-blue-600 hover:underline text-sm">Lihat Detail</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}