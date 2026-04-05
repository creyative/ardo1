import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const protectedPaths = [
    '/admin/dashboard',
    '/admin/sessions',
    '/admin/questions',
    '/admin/participants',
    '/admin/results',
  ]

  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected && !token) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/sessions/:path*', '/admin/questions/:path*', '/admin/participants/:path*', '/admin/results/:path*'],
}
