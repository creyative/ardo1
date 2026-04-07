import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('company_settings')
    .select('*')
    .limit(1)
    .single()

  return NextResponse.json(data || {})
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Check if record exists
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('company_settings')
    .select('id')
    .limit(1)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    return NextResponse.json({ error: `Check failed: ${checkError.message}` }, { status: 500 })
  }

  let result
  const updateData = {
    company_name: body.company_name || '',
    tagline: body.tagline || '',
    address: body.address || '',
    city: body.city || '',
    phone: body.phone || '',
    email: body.email || '',
    website: body.website || '',
    logo_url: body.logo_url || '',
    favicon_url: body.favicon_url || '',
    primary_color: body.primary_color || 'blue',
    headline: body.headline || 'Assessment digital untuk rekrutmen dan evaluasi karyawan.',
  }

  const saveSettings = async (data: Record<string, any>) => {
    if (existing?.id) {
      return supabaseAdmin
        .from('company_settings')
        .update(data)
        .eq('id', existing.id)
        .select()
        .single()
    }

    return supabaseAdmin
      .from('company_settings')
      .insert(data)
      .select()
      .single()
  }

  result = await saveSettings(updateData)

  if (result.error) {
    const message = result.error.message || ''
    if (message.includes('favicon_url')) {
      return NextResponse.json({ error: 'Kolom favicon_url tidak ditemukan di database. Jalankan migrasi Supabase agar favicon dapat tersimpan.' }, { status: 500 })
    }
    if (message.includes('primary_color')) {
      return NextResponse.json({ error: 'Kolom primary_color tidak ditemukan di database. Jalankan migrasi Supabase agar warna sidebar dapat tersimpan.' }, { status: 500 })
    }
    if (message.includes('headline')) {
      return NextResponse.json({ error: 'Kolom headline tidak ditemukan di database. Jalankan migrasi Supabase agar headline dapat tersimpan.' }, { status: 500 })
    }
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json(result.data)
}
