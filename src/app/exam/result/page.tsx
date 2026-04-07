'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ResultContent() {
  const searchParams = useSearchParams()
  const participantId = searchParams.get('participantId')
  const [result, setResult] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!participantId) return
    Promise.all([
      fetch(`/api/results/${participantId}`).then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([resultData, companyData]) => {
      setResult(resultData)
      setCompany(companyData)
      setLoading(false)
    })
  }, [participantId])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat hasil...</div>
  if (!result) return <div className="min-h-screen flex items-center justify-center text-red-600">Hasil tidak ditemukan</div>

  const participant = result.participants
  const session = participant?.sessions
  const isWawasan = session?.type === 'wawasan'
  const detail = result.detail || []

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header Perusahaan */}
        <div className="bg-white rounded-xl shadow p-6 mb-4 print:shadow-none print:border">
          <div className="flex items-center gap-4 border-b pb-4 mb-4">
            {company?.logo_url && (
              <img src={company.logo_url} alt="Logo" className="h-16 w-16 object-contain flex-shrink-0" />
            )}
            <div>
              {company?.company_name ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">{company.company_name}</h2>
                  {company.tagline && <p className="text-sm text-gray-500 italic">{company.tagline}</p>}
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    {company.address && <p>{company.address}{company.city ? `, ${company.city}` : ''}</p>}
                    {(company.phone || company.email) && (
                      <p>{[company.phone, company.email].filter(Boolean).join(' | ')}</p>
                    )}
                    {company.website && <p>{company.website}</p>}
                  </div>
                </>
              ) : (
                <h2 className="text-xl font-bold text-gray-900">Sistem Ujian Online</h2>
              )}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Hasil Ujian</h1>
            <p className="text-gray-500 text-sm">{session?.name}</p>
          </div>
        </div>

        {/* Data Peserta & Skor */}
        <div className="bg-white rounded-xl shadow p-8 mb-6 print:shadow-none print:border">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              ['Nama', participant?.name],
              ['Tanggal Lahir', participant?.birth_date || '-'],
              ['Email', participant?.email || '-'],
              ['Telepon', participant?.phone || '-'],
              ['Jenis Kelamin', participant?.gender || '-'],
              ['Pendidikan', participant?.education || '-'],
              ['Posisi', participant?.position || '-'],
              ['Kode Peserta', participant?.participant_code],
              ['Tipe Tes', isWawasan ? 'Wawasan' : 'Psikotest'],
              ['Pelanggaran', result.violations || 0],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-gray-900 text-sm">{String(value)}</p>
              </div>
            ))}
          </div>
          <div className="text-center py-6 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Skor Akhir</p>
            <p className={`text-6xl font-bold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {result.score?.toFixed(1)}
            </p>
            {isWawasan && (
              <p className="text-sm text-gray-500 mt-2">
                {result.correct_answers} jawaban benar dari {result.total_questions} soal
              </p>
            )}
          </div>
        </div>

        {/* Detail Jawaban */}
        {detail.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6 print:shadow-none print:border">
            <h2 className="font-semibold text-gray-900 mb-4">Detail Jawaban & Penjelasan</h2>
            <div className="space-y-4">
              {detail.map((d: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-lg border ${isWawasan ? (d.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-200'}`}>
                  <p className="font-medium text-sm text-gray-900 mb-2">{idx + 1}. {d.questionText}</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-1 mb-2">
                    {d.options && Object.entries(d.options).filter(([, value]) => String(value).trim()).map(([k, v]) => (
                      <span key={k} className={`text-xs px-2 py-1 rounded ${
                        isWawasan
                          ? k === d.correctAnswer ? 'bg-green-200 text-green-800 font-bold' : k === d.chosen ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-600'
                          : k === d.chosen ? 'bg-blue-200 text-blue-800 font-bold' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {k}: {v as string}
                        {d.pointMap && ` (${d.pointMap[k]}pt)`}
                      </span>
                    ))}
                  </div>
                  {isWawasan ? (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        Jawaban Anda: <strong>{d.chosen || '-'}</strong> |
                        Jawaban Benar: <strong className="text-green-700">{d.correctAnswer}</strong> |
                        {d.isCorrect ? <span className="text-green-600"> Benar</span> : <span className="text-red-600"> Salah</span>}
                      </p>
                      {d.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
                          <p className="font-medium text-blue-900 mb-1">Penjelasan:</p>
                          <p>{d.explanation}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        Pilihan: <strong>{d.chosen || '-'}</strong> | Poin: <strong>{d.point}</strong>
                      </p>
                      {d.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
                          <p className="font-medium text-blue-900 mb-1">Penjelasan:</p>
                          <p>{d.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer cetak */}
        <div className="hidden print:block text-center text-xs text-gray-400 mt-8 pt-4 border-t">
          <p>Dicetak pada {new Date().toLocaleString('id-ID')}</p>
          {company?.company_name && <p>{company.company_name} &mdash; {company.address}</p>}
        </div>

        <div className="flex gap-3 print:hidden">
          <button onClick={() => window.print()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Cetak Hasil
          </button>
          <a href="/" className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 text-center">
            Keluar
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}><ResultContent /></Suspense>
}

