import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const type = searchParams.get('type')

  if (sessionId) {
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('*, participants!inner(*, sessions(name, type))')
      .eq('participants.session_id', sessionId)
      .order('finished_at', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (type) {
    // Get all results with participants and sessions
    const { data: allResults, error: fetchError } = await supabaseAdmin
      .from('results')
      .select('*, participants(*, sessions(name, type))')
      .order('finished_at', { ascending: false })
    
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
    
    // Filter by session type on the client side
    const filtered = allResults.filter((result: any) => 
      result.participants?.sessions?.type === type
    )
    
    return NextResponse.json(filtered)
  }

  // If no filters, return all results
  const { data, error } = await supabaseAdmin
    .from('results')
    .select('*, participants(*, sessions(name, type))')
    .order('finished_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
