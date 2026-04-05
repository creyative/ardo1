import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type } = await req.json() // 'email_verification' or 'password_reset'

  const { data: admin, error: fetchError } = await supabaseAdmin
    .from('admins')
    .select('id, email')
    .eq('username', session.user?.name)
    .single()

  if (fetchError || !admin) return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 })
  if (!admin.email) return NextResponse.json({ error: 'Email tidak terdaftar' }, { status: 400 })

  // Delete unused codes for this admin
  await supabaseAdmin
    .from('admin_verification_codes')
    .delete()
    .eq('admin_id', admin.id)
    .eq('used', false)

  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  const { error: insertError } = await supabaseAdmin
    .from('admin_verification_codes')
    .insert({
      admin_id: admin.id,
      code,
      type,
      expires_at: expiresAt.toISOString(),
    })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // TODO: Send email with code
  // For now, return code in development (remove in production)
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({ 
      message: 'Kode verifikasi telah dikirim ke email Anda',
      devCode: code // Remove this in production
    })
  }

  return NextResponse.json({ message: 'Kode verifikasi telah dikirim ke email Anda' })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, type } = await req.json()

  const { data: admin, error: fetchError } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('username', session.user?.name)
    .single()

  if (fetchError || !admin) return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 })

  // Get verification code
  const { data: verification, error: verifyError } = await supabaseAdmin
    .from('admin_verification_codes')
    .select('*')
    .eq('admin_id', admin.id)
    .eq('code', code)
    .eq('type', type)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (verifyError || !verification) return NextResponse.json({ error: 'Kode tidak valid atau sudah expired' }, { status: 400 })

  // Mark code as used
  await supabaseAdmin
    .from('admin_verification_codes')
    .update({ used: true })
    .eq('id', verification.id)

  // Mark email as verified if email_verification type
  if (type === 'email_verification') {
    await supabaseAdmin
      .from('admins')
      .update({ email_verified: true })
      .eq('id', admin.id)
  }

  return NextResponse.json({ message: 'Verifikasi berhasil' })
}
