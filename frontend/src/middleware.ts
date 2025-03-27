import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// eslint-disable-next-line node/prefer-global/process
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/proxy/')) {
    const sessionToken = request.cookies.get('session_token')
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/proxy/:path*',
}
