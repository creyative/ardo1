import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { participantId, answers, violations } = await req.json()

  const { data: participant } = await supabaseAdmin
    .from('participants')
    .select('session_id, sessions(type, randomize)')
    .eq('id', participantId)
    .single()

  if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 })

  const { data: questions } = await supabaseAdmin
    .from('questions')
    .select('*')
    .eq('session_id', participant.session_id)

  if (!questions) return NextResponse.json({ error: 'No questions' }, { status: 400 })

  const answerRecords = Object.entries(answers).map(([questionId, chosenOption]) => ({
    participant_id: participantId,
    question_id: questionId,
    chosen_option: chosenOption as string,
    time_taken: 0,
  }))

  await supabaseAdmin.from('answers').upsert(answerRecords, { onConflict: 'participant_id,question_id' })

  const session = participant.sessions as any
  let score = 0
  let correctAnswers = 0
  const detail: any[] = []

  for (const q of questions) {
    const chosen = answers[q.id] as string
    if (session.type === 'wawasan') {
      const isCorrect = chosen?.toUpperCase() === q.correct_answer?.toUpperCase()
      if (isCorrect) correctAnswers++
      detail.push({
        questionId: q.id,
        questionText: q.question_text,
        chosen,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation,
        options: q.options,
        pointMap: null,
      })
    } else {
      const pointMap = q.point_map as Record<string, number>
      const point = chosen ? (pointMap?.[chosen] || 0) : 0
      score += point
      detail.push({
        questionId: q.id,
        questionText: q.question_text,
        chosen,
        point,
        explanation: q.explanation,
        options: q.options,
        pointMap,
      })
    }
  }

  if (session.type === 'wawasan') {
    score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0
  }

  const { data: result, error } = await supabaseAdmin
    .from('results')
    .upsert({
      participant_id: participantId,
      score: Math.round(score * 100) / 100,
      total_questions: questions.length,
      correct_answers: correctAnswers,
      detail,
      violations: violations || 0,
      finished_at: new Date().toISOString(),
    }, { onConflict: 'participant_id' })
    .select()
    .single()

  await supabaseAdmin.from('participants').update({ status: 'finished' }).eq('id', participantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ result, sessionType: session.type })
}
