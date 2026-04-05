'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchSessions = async () => {
    const res = await fetch('/api/sessions')
    const data = await res.json()
    setSessions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchSessions() }, [])

  const toggleActive = async (id: string, current: boolean) => {
    try {
      setUpdating(id)
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !current }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        alert('Gagal mengubah status: ' + (error.error || 'Kesalahan tidak diketahui'))
        return
      }
      
      await fetchSessions()
      alert('Status sesi berhasil diubah')
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Kesalahan jaringan'))
    } finally {
      setUpdating(null)
    }
  }

  const deleteSession = async (id: string) => {
    if (!confirm('Hapus sesi ini?')) return
    try {
      setUpdating(id)
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      
      if (!res.ok) {
        const error = await res.json()
        alert('Gagal menghapus: ' + (error.error || 'Kesalahan tidak diketahui'))
        return
      }
      
      await fetchSessions()
      alert('Sesi berhasil dihapus')
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Kesalahan jaringan'))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sesi Tes</h1>
          <Link href="/admin/sessions/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            + Buat Sesi
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Sesi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Randomize</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat...</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada sesi</td></tr>
              ) : sessions.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.type === 'wawasan' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(s.id, s.is_active)}
                      disabled={updating === s.id}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        updating === s.id 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : s.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {updating === s.id ? 'Memproses...' : (s.is_active ? 'Aktif' : 'Nonaktif')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.randomize ? 'Ya' : 'Tidak'}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link href={`/admin/sessions/${s.id}`} className="text-blue-600 hover:underline text-sm">Edit</Link>
                    <Link href={`/admin/sessions/${s.id}/questions`} className="text-green-600 hover:underline text-sm">Soal</Link>
                    <button 
                      onClick={() => deleteSession(s.id)} 
                      disabled={updating === s.id}
                      className={`text-sm ${updating === s.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:underline'}`}>
                      {updating === s.id ? 'Menghapus...' : 'Hapus'}
                    </button>
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
