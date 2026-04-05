import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { code } = await req.json()

  const { data: participant, error } = await supabaseAdmin
    .from('participants')
    .select('*, sessions(*)')
    .eq('participant_code', code.toUpperCase())
    .single()

  if (error || !participant) return NextResponse.json({ error: 'Kode tidak ditemukan' }, { status: 404 })
  if (participant.status === 'finished') return NextResponse.json({ error: 'Tes sudah selesai dikerjakan' }, { status: 400 })
  if (!participant.sessions.is_active) return NextResponse.json({ error: 'Sesi tes tidak aktif' }, { status: 400 })

  return NextResponse.json({ participant, session: participant.sessions })
}
