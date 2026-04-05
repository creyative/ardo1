import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Delete all related data
  // 1. Delete violation logs
  await supabaseAdmin.from('violation_logs').delete().eq('participant_id', id)

  // 2. Delete answers
  await supabaseAdmin.from('answers').delete().eq('participant_id', id)

  // 3. Delete results
  await supabaseAdmin.from('results').delete().eq('participant_id', id)

  // 4. Delete participant
  const { error } = await supabaseAdmin.from('participants').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
