'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

export default function NewParticipantPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionId, setSessionId] = useState('')
  const [participants, setParticipants] = useState([{ name: '', nik: '', email: '', phone: '', gender: '', education: '', position: '' }])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/sessions').then(r => r.json()).then(d => setSessions(Array.isArray(d) ? d : []))
  }, [])

  const addRow = () => setParticipants([...participants, { name: '', nik: '', email: '', phone: '', gender: '', education: '', position: '' }])
  const updateRow = (i: number, field: string, value: string) => {
    const updated = [...participants]
    updated[i] = { ...updated[i], [field]: value }
    setParticipants(updated)
  }
  const removeRow = (i: number) => setParticipants(participants.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId) return alert('Pilih sesi terlebih dahulu')
    setLoading(true)
    const res = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, participants }),
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      setResult(data)
    }
    setLoading(false)
  }

  if (result.length > 0) {
    return (
      <AdminLayout>
        <div className="p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Peserta Berhasil Ditambahkan</h1>
          <div className="bg-white rounded-xl shadow p-6 space-y-3 mb-6">
            {result.map(p => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="font-medium">{p.name}</span>
                <code className="bg-blue-50 text-blue-700 px-3 py-1 rounded font-mono font-bold">{p.participant_code}</code>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setResult([]); setParticipants([{ name: '', nik: '', email: '', phone: '', gender: '', education: '', position: '' }]) }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tambah Lagi</button>
            <button onClick={() => router.push('/admin/participants')}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Ke Daftar Peserta</button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Peserta</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sesi Tes</label>
            <select value={sessionId} onChange={e => setSessionId(e.target.value)}
              className="w-full md:w-96 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">-- Pilih Sesi --</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Data Peserta</h2>
              <button type="button" onClick={addRow} className="text-sm text-blue-600 hover:underline">+ Tambah Baris</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Nama*</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">NIK</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Telepon</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Jenis Kelamin</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Pendidikan</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Posisi</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {participants.map((p, i) => (
                    <tr key={i}>
                      {(['name', 'nik', 'email', 'phone'] as const).map(f => (
                        <td key={f} className="px-3 py-2">
                          <input type="text" value={(p as any)[f]} onChange={e => updateRow(i, f, e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required={f === 'name'} />
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <select value={p.gender} onChange={e => updateRow(i, 'gender', e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm">
                          <option value="">-</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </td>
                      {(['education', 'position'] as const).map(f => (
                        <td key={f} className="px-3 py-2">
                          <input type="text" value={(p as any)[f]} onChange={e => updateRow(i, f, e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        {participants.length > 1 && (
                          <button type="button" onClick={() => removeRow(i)} className="text-red-500 hover:text-red-700 text-xs">Hapus</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Menyimpan...' : 'Generate ID & Simpan'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Batal</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
