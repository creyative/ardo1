'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

export default function NewSessionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', type: 'wawasan', description: '', timer_per_question: 60, randomize: false, max_violations: 3 })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.id) router.push(`/admin/sessions/${data.id}/questions`)
    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Sesi Baru</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sesi</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Tes</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="wawasan">Wawasan</option>
              <option value="psikotest">Psikotest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timer Default per Soal (detik)</label>
            <input type="number" value={form.timer_per_question} onChange={e => setForm({...form, timer_per_question: Number(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" min={10} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Pelanggaran Anti-cheat</label>
            <input type="number" value={form.max_violations} onChange={e => setForm({...form, max_violations: Number(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" min={1} max={10} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.randomize} onChange={e => setForm({...form, randomize: e.target.checked})} />
            <span className="text-sm text-gray-700">Acak urutan soal per peserta</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Menyimpan...' : 'Simpan & Upload Soal'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Batal</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
