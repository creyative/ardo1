import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url === 'your-supabase-url') {
    return 'https://placeholder.supabase.co'
  }
  return url
}

function getAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
}

function getServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createClient(getSupabaseUrl(), getAnonKey())
    }
    return (_supabase as any)[prop]
  },
})

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(getSupabaseUrl(), getServiceKey())
    }
    return (_supabaseAdmin as any)[prop]
  },
})
