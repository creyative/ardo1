'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAntiCheat } from '@/lib/anti-cheat'
import { formatTime } from '@/lib/utils'

export default function TestPage() {
  const router = useRouter()
  const [participant, setParticipant] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timer, setTimer] = useState(0)
  const [violations, setViolations] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [violationWarning, setViolationWarning] = useState('')
  const [started, setStarted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answersRef = useRef<Record<string, string>>({})
  const violationsRef = useRef(0)

  const submitExam = useCallback(async (currentAnswers: Record<string, string>, currentViolations: number) => {
    if (submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    const p = JSON.parse(sessionStorage.getItem('examParticipant') || '{}')
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: p.id, answers: currentAnswers, violations: currentViolations }),
    })
    if (res.ok) {
      sessionStorage.removeItem('examSession')
      router.push(`/exam/result?participantId=${p.id}`)
    }
  }, [router, submitting])

  const { enterFullscreen } = useAntiCheat({
    participantId: participant?.id || '',
    maxViolations: session?.max_violations || 3,
    onViolation: (count) => {
      setViolations(count)
      violationsRef.current = count
      setViolationWarning(`Peringatan! Pelanggaran ke-${count}/${session?.max_violations || 3}. Jangan berpindah tab/window!`)
      setTimeout(() => setViolationWarning(''), 4000)
    },
    onAutoSubmit: () => {
      setViolationWarning('Terlalu banyak pelanggaran. Ujian otomatis disubmit!')
      setTimeout(() => submitExam(answersRef.current, violationsRef.current + 1), 2000)
    },
  })

  useEffect(() => {
    const p = sessionStorage.getItem('examParticipant')
    const s = sessionStorage.getItem('examSession')
    if (!p || !s) { router.push('/exam/join'); return }
    const parsedP = JSON.parse(p)
    const parsedS = JSON.parse(s)
    setParticipant(parsedP)
    setSession(parsedS)
    fetch(`/api/exam/questions?sessionId=${parsedS.id}&randomize=${parsedS.randomize}`)
      .then(r => r.json())
      .then(data => {
        setQuestions(Array.isArray(data) ? data : [])
        setTimer((Array.isArray(data) && data[0]?.timer) || parsedS.timer_per_question || 60)
      })
  }, [router])

  useEffect(() => {
    if (!started || questions.length === 0 || submitting) return
    const q = questions[currentIdx]
    setTimer(q?.timer || session?.timer_per_question || 60)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, started, questions.length])

  useEffect(() => {
    if (!started || questions.length === 0 || submitting) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setCurrentIdx(i => {
            const next = i + 1
            if (next >= questions.length) {
              submitExam(answersRef.current, violationsRef.current)
            }
            return next < questions.length ? next : i
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, started, questions.length, submitting])

  const handleAnswer = (option: string) => {
    const q = questions[currentIdx]
    const newAnswers = { ...answersRef.current, [q.id]: option }
    answersRef.current = newAnswers
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      submitExam(answersRef.current, violationsRef.current)
    }
  }

  const handleStart = () => {
    enterFullscreen()
    setStarted(true)
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <h1 className="text-3xl font-bold">Siap Memulai?</h1>
          <p className="text-gray-400">Ujian akan dimulai dalam mode fullscreen</p>
          <button onClick={handleStart}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700">
            Mulai Sekarang
          </button>
        </div>
      </div>
    )
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">Menyimpan jawaban...</div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) return null

  const currentQ = questions[currentIdx]
  const progress = ((currentIdx + 1) / questions.length) * 100
  const isLast = currentIdx === questions.length - 1
  const chosenOption = answers[currentQ?.id]

  return (
    <div className="min-h-screen bg-gray-50 select-none">
      {violationWarning && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-3 z-50 font-medium">
          {violationWarning}
        </div>
      )}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-900">{session?.name}</p>
          <p className="text-xs text-gray-500">Soal {currentIdx + 1} dari {questions.length}</p>
        </div>
        <div className="flex items-center gap-4">
          {violations > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
              Pelanggaran: {violations}
            </span>
          )}
          <div className={`text-2xl font-bold font-mono ${timer <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
            {formatTime(timer)}
          </div>
        </div>
      </div>
      <div className="h-2 bg-gray-200">
        <div className="h-2 bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="max-w-2xl mx-auto p-6 mt-4">
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <p className="text-lg font-medium text-gray-900 leading-relaxed">{currentQ?.question_text}</p>
        </div>
        <div className="space-y-3">
          {currentQ?.options && Object.entries(currentQ.options).filter(([, value]) => String(value).trim()).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                chosenOption === key
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
              }`}
            >
              <span className="font-bold mr-3">{key}.</span>
              {value as string}
              {currentQ?.point_map && currentQ.point_map[key] !== undefined && <span className="float-right text-xs text-gray-400">{currentQ.point_map[key]} pt</span>}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          {isLast ? 'Selesai & Submit' : 'Soal Berikutnya'}
        </button>
      </div>
    </div>
  )
}
