'use client'
import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchParticipants = async () => {
    const res = await fetch('/api/participants')
    const data = await res.json()
    setParticipants(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchParticipants() }, [])

  const filtered = participants.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.participant_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.birth_date?.toString().includes(search)
  )

  const exportCodes = () => {
    const text = filtered.map(p => `${p.name} | ${p.participant_code} | ${p.sessions?.name}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kode-peserta.txt'
    a.click()
  }

  const exportToExcel = () => {
    const rows = filtered.map((p: any, idx: number) => ({
      No: idx + 1,
      Nama: p.name,
      'Kode Peserta': p.participant_code,
      Tanggal Lahir: p.birth_date ? new Date(p.birth_date).toLocaleDateString('id-ID') : '-',
      Email: p.email || '-',
      Telepon: p.phone || '-',
      'Jenis Kelamin': p.gender || '-',
      Pendidikan: p.education || '-',
      Posisi: p.position || '-',
      Sesi: p.sessions?.name || '-',
      'Tipe Tes': p.sessions?.type || '-',
      Status: p.status === 'finished' ? 'Selesai' : p.status === 'in_progress' ? 'Sedang Tes' : 'Terdaftar',
      'Skor Terakhir': getLatestScore(p),
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta')
    XLSX.writeFile(wb, 'data-peserta.xlsx')
  }

  const handleDelete = async (participantId: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/participants/${participantId}`, { method: 'DELETE' })
      if (res.ok) {
        setParticipants(participants.filter(p => p.id !== participantId))
        setDeleteModal(null)
      } else {
        alert('Gagal menghapus peserta')
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getLatestScore = (participant: any) => {
    const result = participant.results
    if (!result) return '-'
    if (Array.isArray(result)) return result[0]?.score ?? '-'
    return result.score ?? '-'
  }

  const exportParticipantPdf = (participant: any) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const sessionName = participant.sessions?.name || '-'
    const sessionType = participant.sessions?.type || '-'
    const score = getLatestScore(participant)

    doc.setFontSize(18)
    doc.text('Laporan Peserta', 40, 50)
    doc.setFontSize(12)
    doc.text(`Nama: ${participant.name || '-'}`, 40, 80)
    doc.text(`Kode Peserta: ${participant.participant_code || '-'}`, 40, 100)
    doc.text(`Sesi: ${sessionName}`, 40, 120)
    doc.text(`Tipe Tes: ${sessionType}`, 40, 140)
    doc.text(`Skor Terakhir: ${score}`, 40, 160)
    doc.text(`Status: ${participant.status || '-'}`, 40, 180)
    doc.text(`Tanggal Lahir: ${participant.birth_date ? new Date(participant.birth_date).toLocaleDateString('id-ID') : '-'}`, 40, 200)
    doc.text(`Email: ${participant.email || '-'}`, 40, 220)
    doc.text(`Telepon: ${participant.phone || '-'}`, 40, 240)

    doc.save(`laporan-${participant.participant_code || 'peserta'}.pdf`)
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Peserta</h1>
          <div className="flex gap-3">
            <button onClick={exportCodes} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Export Kode</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Export Excel</button>
            <Link href="/admin/participants/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">+ Tambah Peserta</Link>
          </div>
        </div>
        <div className="mb-4">
          <input type="text" placeholder="Cari nama, kode, atau tanggal lahir..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full md:w-96 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Peserta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe Tes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor Terakhir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Lahir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{p.participant_code}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.sessions?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.sessions?.type || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{getLatestScore(p)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      p.status === 'finished' ? 'bg-green-100 text-green-700' :
                      p.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status === 'finished' ? 'Selesai' : p.status === 'in_progress' ? 'Sedang Tes' : 'Terdaftar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.birth_date ? new Date(p.birth_date).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => exportParticipantPdf(p)} className="text-blue-600 hover:underline text-sm">Cetak</button>
                      <button onClick={() => setDeleteModal(p)} className="text-red-600 hover:underline text-sm">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Peserta?</h2>
              <p className="text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus peserta <strong>{deleteModal.name}</strong> ({deleteModal.participant_code})? Data ini tidak bisa dipulihkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.id)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
