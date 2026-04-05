import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*, questions(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('[PUT Session] No session found, auth failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    
    console.log('[PUT Session] Updating session:', { id, body, adminKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing' })
    
    // Verify session exists first
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !sessionData) {
      console.error('[PUT Session] Session not found:', fetchError)
      return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 })
    }

    // Construct update object only with provided fields
    const updateObj: any = { updated_at: new Date().toISOString() }
    if (body.is_active !== undefined) updateObj.is_active = body.is_active
    if (body.name !== undefined) updateObj.name = body.name
    if (body.type !== undefined) updateObj.type = body.type
    if (body.description !== undefined) updateObj.description = body.description
    if (body.timer_per_question !== undefined) updateObj.timer_per_question = body.timer_per_question
    if (body.randomize !== undefined) updateObj.randomize = body.randomize
    if (body.max_violations !== undefined) updateObj.max_violations = body.max_violations

    console.log('[PUT Session] Update object:', updateObj)

    const { data: updatedData, error } = await supabaseAdmin
      .from('sessions')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT Session] Update error:', error)
      return NextResponse.json({ error: `Gagal update: ${error.message}` }, { status: 500 })
    }
    
    console.log('[PUT Session] Updated successfully:', updatedData)
    return NextResponse.json(updatedData)
  } catch (error) {
    console.error('[PUT Session] Unexpected error:', error)
    return NextResponse.json({ 
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin.from('sessions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
