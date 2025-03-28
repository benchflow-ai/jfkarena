import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
// eslint-disable-next-line node/prefer-global/process
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/api/proxy/')) {
    const sessionToken = request.cookies.get('session_token')
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${sessionToken.value}`)
    requestHeaders.set('Content-Type', 'application/json')

    const nextUrl = new URL(pathname.replace('/api/proxy/', ''), API_URL)
    // eslint-disable-next-line no-console
    console.log(`rewrite to `, nextUrl.toString())
    return NextResponse.rewrite(
      nextUrl,
      { headers: requestHeaders },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/proxy/:path*',
}
