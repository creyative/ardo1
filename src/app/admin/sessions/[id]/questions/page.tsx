'use client'
import { useEffect, useState, use } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default function SessionQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [session, setSession] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [showManualForm, setShowManualForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '', optionB: '', optionC: '', optionD: '', optionE: '',
    correctAnswer: 'A',
    explanation: '',
    timer: 60,
    pointA: 0, pointB: 0, pointC: 0, pointD: 0, pointE: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/sessions/${id}`).then(r => r.json()).then(d => setSession(d))
  }, [id])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session) return
    setUploading(true)
    setMessage('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('sessionId', id)
    fd.append('sessionType', session.type)
    const res = await fetch('/api/questions/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.count) {
      setMessage(`Berhasil upload ${data.count} soal`)
      setPreview(data.questions || [])
      fetch(`/api/sessions/${id}`).then(r => r.json()).then(d => setSession(d))
    } else {
      setMessage(data.error || 'Upload gagal')
    }
    setUploading(false)
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    const options: Record<string, string> = {}
    if (formData.optionA) options['A'] = formData.optionA
    if (formData.optionB) options['B'] = formData.optionB
    if (formData.optionC) options['C'] = formData.optionC
    if (formData.optionD) options['D'] = formData.optionD
    if (formData.optionE) options['E'] = formData.optionE

    if (Object.keys(options).length < 2) {
      setMessage('Minimal harus ada 2 opsi jawaban')
      setSubmitting(false)
      return
    }

    let pointMap: Record<string, number> | null = null
    if (session?.type === 'psikotest') {
      pointMap = {}
      if (formData.optionA) pointMap['A'] = formData.pointA
      if (formData.optionB) pointMap['B'] = formData.pointB
      if (formData.optionC) pointMap['C'] = formData.pointC
      if (formData.optionD) pointMap['D'] = formData.pointD
      if (formData.optionE) pointMap['E'] = formData.pointE
    }

    const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : '/api/questions/create'
    const method = editingQuestion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: id,
        questionText: formData.questionText,
        options: options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        pointMap: pointMap,
        timer: formData.timer,
      }),
    })

    const data = await res.json()
    if (data.success) {
      setMessage(editingQuestion ? 'Soal berhasil diperbarui!' : 'Soal berhasil ditambahkan!')
      setFormData({
        questionText: '',
        optionA: '', optionB: '', optionC: '', optionD: '', optionE: '',
        correctAnswer: 'A',
        explanation: '',
        timer: 60,
        pointA: 0, pointB: 0, pointC: 0, pointD: 0, pointE: 0,
      })
      setEditingQuestion(null)
      setShowManualForm(false)
      fetch(`/api/sessions/${id}`).then(r => r.json()).then(d => setSession(d))
    } else {
      setMessage(data.error || 'Gagal menyimpan soal')
    }
    setSubmitting(false)
  }

  const openEditForm = (question: any) => {
    setEditingQuestion(question)
    const options = question.options || {}
    setFormData({
      questionText: question.question_text,
      optionA: options.A || '',
      optionB: options.B || '',
      optionC: options.C || '',
      optionD: options.D || '',
      optionE: options.E || '',
      correctAnswer: question.correct_answer || 'A',
      explanation: question.explanation || '',
      timer: question.timer || 60,
      pointA: question.point_map?.A || 0,
      pointB: question.point_map?.B || 0,
      pointC: question.point_map?.C || 0,
      pointD: question.point_map?.D || 0,
      pointE: question.point_map?.E || 0,
    })
    setShowManualForm(true)
  }

  const cancelEdit = () => {
    setEditingQuestion(null)
    setFormData({
      questionText: '',
      optionA: '', optionB: '', optionC: '', optionD: '', optionE: '',
      correctAnswer: 'A',
      explanation: '',
      timer: 60,
      pointA: 0, pointB: 0, pointC: 0, pointD: 0, pointE: 0,
    })
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Hapus soal ini?')) return
    const res = await fetch(`/api/questions/${questionId}`, { method: 'DELETE' })
    if (res.ok) {
      fetch(`/api/sessions/${id}`).then(r => r.json()).then(d => setSession(d))
    } else {
      alert('Gagal menghapus soal')
    }
  }

  const questions = session?.questions || preview

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Soal: {session?.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Tipe: {session?.type}</p>
          </div>
          <Link href="/admin/sessions" className="text-sm text-gray-500 hover:text-gray-700">Kembali</Link>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">Upload Soal dari Excel</h2>
          <div className="flex gap-4 items-center mb-4 flex-wrap">
            <a href="/api/questions/template?type=wawasan"
              className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 border border-green-200">
              Download Template Wawasan
            </a>
            <a href="/api/questions/template?type=psikotest"
              className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 border border-purple-200">
              Download Template Psikotest
            </a>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700">
              {uploading ? 'Mengupload...' : 'Upload File Excel'}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          {message && <div className={`rounded-lg p-3 text-sm ${message.includes('Berhasil') || message.includes('ditambahkan') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
        </div>

        {/* Manual Add Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editingQuestion ? 'Edit Soal' : 'Tambah Soal Manual'}</h2>
            <div className="flex gap-2">
              {editingQuestion && (
                <button
                  onClick={() => { cancelEdit(); setShowManualForm(false) }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                >
                  Batal
                </button>
              )}
              <button
                onClick={() => setShowManualForm(!showManualForm)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              >
                {showManualForm ? 'Tutup Form' : editingQuestion ? 'Edit' : '+ Tambah Soal'}
              </button>
            </div>
          </div>

          {showManualForm && (
            <form onSubmit={handleAddQuestion} className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan *</label>
                <textarea
                  value={formData.questionText}
                  onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan pertanyaan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D', 'E'].map(letter => (
                  <div key={letter}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opsi {letter}</label>
                    <input
                      type="text"
                      value={formData[`option${letter}` as keyof typeof formData] as string}
                      onChange={e => setFormData({ ...formData, [`option${letter}`]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Opsi ${letter}`}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban Benar *</label>
                  <select
                    value={formData.correctAnswer}
                    onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['A', 'B', 'C', 'D', 'E'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timer (detik)</label>
                  <input
                    type="number"
                    value={formData.timer}
                    onChange={e => setFormData({ ...formData, timer: parseInt(e.target.value) || 60 })}
                    min="10"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {session?.type === 'psikotest' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scoring (Poin per opsi)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['A', 'B', 'C', 'D', 'E'].map(letter => (
                      <div key={letter}>
                        <label className="text-xs text-gray-600">{letter}</label>
                        <input
                          type="number"
                          value={formData[`point${letter}` as keyof typeof formData] as number}
                          onChange={e => setFormData({ ...formData, [`point${letter}`]: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {session?.type === 'wawasan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penjelasan Jawaban yang Benar</label>
                  <textarea
                    value={formData.explanation}
                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Penjelasan jawaban yang benar (opsional)..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {submitting ? (editingQuestion ? 'Memperbarui...' : 'Menyimpan...') : (editingQuestion ? 'Perbarui Soal' : 'Simpan Soal')}
              </button>
            </form>
          )}
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Daftar Soal ({questions.length} soal)</h2>
          </div>
          <div className="divide-y max-h-96 overflow-auto">
            {questions.map((q: any, idx: number) => (
              <div key={q.id || idx} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{idx + 1}. {q.question_text}</p>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-1">
                      {q.options && Object.entries(q.options).filter(([, value]) => String(value).trim()).map(([k, v]) => (
                        <span key={k} className={`text-xs px-2 py-1 rounded ${q.correct_answer === k ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                          {k}: {v as string}
                          {q.point_map && q.point_map[k] !== undefined && ` (${q.point_map[k]} pt)`}
                        </span>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-blue-600 mt-1">
                        <strong>Penjelasan:</strong> {q.explanation}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Timer: {q.timer}s</p>
                  </div>
                  {q.id && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditForm(q)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {questions.length === 0 && <div className="px-6 py-8 text-center text-gray-500">Belum ada soal. Upload file Excel atau tambah soal manual.</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
