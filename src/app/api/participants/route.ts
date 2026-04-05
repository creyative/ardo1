import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import { generateParticipantCode } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')

  let query = supabaseAdmin
    .from('participants')
    .select('*, sessions(name, type), results(score, finished_at)')
    .order('created_at', { ascending: false })
  if (sessionId) query = query.eq('session_id', sessionId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { sessionId, participants } = body

  const { data: sessionData } = await supabaseAdmin.from('sessions').select('type').eq('id', sessionId).single()
  if (!sessionData) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const records = participants.map((p: any) => ({
    session_id: sessionId,
    participant_code: generateParticipantCode(sessionData.type),
    name: p.name,
    nik: p.nik,
    email: p.email,
    phone: p.phone,
    birth_date: p.birthDate || null,
    gender: p.gender,
    education: p.education,
    position: p.position,
    status: 'registered',
  }))

  const { data, error } = await supabaseAdmin.from('participants').insert(records).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
