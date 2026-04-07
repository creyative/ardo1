import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const type = searchParams.get('type')

  let results: any[] = []

  if (sessionId) {
    const { data } = await supabaseAdmin
      .from('results')
      .select('*, participants!inner(*, sessions(name, type))')
      .eq('participants.session_id', sessionId)
      .order('score', { ascending: false })
    results = data || []
  } else if (type) {
    // Get all results and filter by type
    const { data: allResults } = await supabaseAdmin
      .from('results')
      .select('*, participants(*, sessions(name, type))')
      .order('score', { ascending: false })
    results = (allResults || []).filter((r: any) => r.participants?.sessions?.type === type)
  } else {
    const { data } = await supabaseAdmin
      .from('results')
      .select('*, participants(*, sessions(name, type))')
      .order('score', { ascending: false })
    results = data || []
  }

  if (!results || results.length === 0) return NextResponse.json({ error: 'No data' }, { status: 404 })

  const rows = results.map((r: any, idx: number) => ({
    No: idx + 1,
    Nama: r.participants?.name,
    'Tanggal Lahir': r.participants?.birth_date,
    Email: r.participants?.email,
    'Kode Peserta': r.participants?.participant_code,
    Sesi: r.participants?.sessions?.name,
    'Tipe Tes': r.participants?.sessions?.type,
    Skor: r.score,
    'Total Soal': r.total_questions,
    'Jawaban Benar': r.correct_answers,
    Pelanggaran: r.violations,
    'Selesai Pada': new Date(r.finished_at).toLocaleString('id-ID'),
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Hasil Tes')
  const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="hasil-tes.xlsx"',
    },
  })
}
