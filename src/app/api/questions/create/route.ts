import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { sessionId, questionText, options, correctAnswer, explanation, pointMap, timer } = body

  // Get the next order number
  const { data: existingQuestions } = await supabaseAdmin
    .from('questions')
    .select('order_num')
    .eq('session_id', sessionId)
    .order('order_num', { ascending: false })
    .limit(1)

  const nextOrder = (existingQuestions?.[0]?.order_num || 0) + 1

  const { data, error } = await supabaseAdmin
    .from('questions')
    .insert({
      session_id: sessionId,
      question_text: questionText,
      options: options,
      correct_answer: correctAnswer,
      explanation: explanation || null,
      point_map: pointMap || null,
      timer: timer || 60,
      order_num: nextOrder,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
