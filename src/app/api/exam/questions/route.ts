import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const randomize = searchParams.get('randomize') === 'true'

  const { data, error } = await supabaseAdmin
    .from('questions')
    .select('id, question_text, options, timer, order_num, point_map')
    .eq('session_id', sessionId)
    .order('order_num')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let questions = data || []
  if (randomize) {
    questions = questions.sort(() => Math.random() - 0.5)
  }

  return NextResponse.json(questions)
}
