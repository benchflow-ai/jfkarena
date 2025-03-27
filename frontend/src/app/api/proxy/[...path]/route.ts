import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { joinURL } from 'ufo'
// eslint-disable-next-line node/prefer-global/process
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/proxy', '')
  const { searchParams } = new URL(request.url)
  const search = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const fullUrl = joinURL(API_URL, path, search)

  const sessionToken = (await cookies()).get('session_token')
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}`, errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  }
  catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch data: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/proxy', '')
  const fullUrl = joinURL(API_URL, path)

  const sessionToken = (await cookies()).get('session_token')
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}`, errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  }
  catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch data: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
