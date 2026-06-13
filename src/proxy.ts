import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow login page without auth
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Simply check if token cookie exists — actual JWT validation
  // is done client-side via /api/auth/me (Node.js runtime)
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
