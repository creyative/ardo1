import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: admin, error } = await supabaseAdmin
    .from('admins')
    .select('id, username, email, email_verified, role, created_at')
    .eq('username', session.user?.name)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(admin)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { currentPassword, newUsername, newPassword, newEmail } = body

  // Get current admin
  const { data: admin, error: fetchError } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('username', session.user?.name)
    .single()

  if (fetchError || !admin) return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 })

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash)
  if (!isValidPassword) return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 })

  const updateData: Record<string, any> = {}

  // Update username if provided
  if (newUsername && newUsername !== admin.username) {
    const { data: existing } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('username', newUsername)
      .single()

    if (existing) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    updateData.username = newUsername
  }

  // Update password if provided
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    updateData.password_hash = hashedPassword
  }

  // Update email if provided
  if (newEmail && newEmail !== admin.email) {
    updateData.email = newEmail
    updateData.email_verified = false
  }

  const { data: updatedAdmin, error: updateError } = await supabaseAdmin
    .from('admins')
    .update(updateData)
    .eq('id', admin.id)
    .select('id, username, email, email_verified, role, created_at')
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json(updatedAdmin)
}
