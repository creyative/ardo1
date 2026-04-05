'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BiodataPage() {
  const router = useRouter()
  const [participant, setParticipant] = useState<any>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const p = sessionStorage.getItem('examParticipant')
    const s = sessionStorage.getItem('examSession')
    if (!p || !s) { router.push('/exam/join'); return }
    setParticipant(JSON.parse(p))
    setSession(JSON.parse(s))
  }, [router])

  const handleStart = () => {
    router.push('/exam/test')
  }

  if (!participant) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Konfirmasi Biodata</h1>
        <div className="space-y-3 mb-6">
          {[
            ['Nama', participant.name],
            ['NIK', participant.nik || '-'],
            ['Email', participant.email || '-'],
            ['Telepon', participant.phone || '-'],
            ['Jenis Kelamin', participant.gender || '-'],
            ['Pendidikan', participant.education || '-'],
            ['Posisi', participant.position || '-'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium">Informasi Ujian</p>
          <p className="text-sm text-blue-700 mt-1">Sesi: {session?.name}</p>
          <p className="text-sm text-blue-700">Tipe: {session?.type === 'wawasan' ? 'Tes Wawasan' : 'Psikotest'}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          <p className="font-medium mb-1">Perhatian:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pastikan koneksi internet stabil</li>
            <li>Setiap soal memiliki batas waktu</li>
            <li>Tidak boleh membuka tab/window lain</li>
            <li>Pelanggaran berulang akan otomatis submit</li>
          </ul>
        </div>
        <button onClick={handleStart}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Mulai Ujian
        </button>
      </div>
    </div>
  )
}
