import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import { parseWawasanExcel, parsePsikotestExcel } from '@/lib/excel-parser'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const sessionId = formData.get('sessionId') as string
  const sessionType = formData.get('sessionType') as string

  if (!file || !sessionId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  let questions: any[] = []

  if (sessionType === 'wawasan') {
    const parsed = parseWawasanExcel(buffer)
    questions = parsed.map((q, idx) => ({
      session_id: sessionId,
      question_text: q.pertanyaan,
      options: {
        A: q.pilihanA,
        B: q.pilihanB,
        C: q.pilihanC,
        D: q.pilihanD,
        ...(q.pilihanE ? { E: q.pilihanE } : {}),
      },
      correct_answer: q.jawabanBenar,
      explanation: q.penjelasan || null,
      point_map: null,
      timer: q.timer,
      order_num: idx + 1,
    }))
  } else {
    const parsed = parsePsikotestExcel(buffer)
    questions = parsed.map((q, idx) => ({
      session_id: sessionId,
      question_text: q.pertanyaan,
      options: {
        A: q.pilihanA,
        B: q.pilihanB,
        C: q.pilihanC,
        D: q.pilihanD,
        ...(q.pilihanE ? { E: q.pilihanE } : {}),
      },
      correct_answer: null,
      explanation: null,
      point_map: {
        A: q.pointA,
        B: q.pointB,
        C: q.pointC,
        D: q.pointD,
        ...(q.pointE !== undefined ? { E: q.pointE } : {}),
      },
      timer: q.timer,
      order_num: idx + 1,
    }))
  }

  // Delete existing questions for this session
  await supabaseAdmin.from('questions').delete().eq('session_id', sessionId)

  const { data, error } = await supabaseAdmin.from('questions').insert(questions).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ count: data.length, questions: data })
}
