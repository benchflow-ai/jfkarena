/* eslint-disable node/prefer-global/process */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API_TOKEN = process.env.JFK_ARENA_TOKEN
const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_TOKEN) {
  throw new Error('JFK_ARENA_TOKEN environment variable is not set')
}

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

export async function GET() {
  const sessionToken = (await cookies()).get('session_token')

  if (!sessionToken || sessionToken.value !== API_TOKEN) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}

export async function POST() {
  if (!API_TOKEN) {
    return NextResponse.json({ error: 'Token not configured' }, { status: 500 })
  }

  (await cookies()).set('session_token', API_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  return NextResponse.json({ success: true })
}
