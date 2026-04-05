import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { participantId, type } = await req.json()

  const { error } = await supabaseAdmin.from('violation_logs').insert({ participant_id: participantId, type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
