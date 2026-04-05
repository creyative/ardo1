import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ participantId: string }> }) {
  const { participantId } = await params
  const { data, error } = await supabaseAdmin
    .from('results')
    .select('*, participants(*, sessions(*))')
    .eq('participant_id', participantId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}
