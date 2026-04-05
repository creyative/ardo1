'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

export default function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/sessions/${id}`).then(r => r.json()).then(d => setForm(d))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch(`/api/sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    router.push('/admin/sessions')
  }

  if (!form) return <AdminLayout><div className="p-8 text-gray-500">Memuat...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Sesi</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sesi</label>
            <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <input type="text" value={form.type || ''} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timer Default (detik)</label>
            <input type="number" value={form.timer_per_question || 60} onChange={e => setForm({...form, timer_per_question: Number(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Pelanggaran</label>
            <input type="number" value={form.max_violations || 3} onChange={e => setForm({...form, max_violations: Number(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.randomize || false} onChange={e => setForm({...form, randomize: e.target.checked})} />
            <span className="text-sm text-gray-700">Acak urutan soal</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active || false} onChange={e => setForm({...form, is_active: e.target.checked})} />
            <span className="text-sm text-gray-700">Aktifkan sesi</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Batal</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
