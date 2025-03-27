/* eslint-disable no-console */
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// eslint-disable-next-line node/prefer-global/process
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

console.log('API URL:', API_URL)

export async function GET(request: NextRequest) {
  const { pathname, search } = new URL(request.url)
  const path = pathname.replace('/api/proxy', '')
  const fullUrl = `${API_URL}${path}${search}`

  console.log('Proxy GET request:', { path, fullUrl })

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
      console.error('Proxy error:', {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
      })

      const errorText = await response.text()
      console.error('Error response:', errorText)

      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  }
  catch (error) {
    console.error('Proxy error:', {
      error,
      url: fullUrl,
    })
    return NextResponse.json(
      { error: `Failed to fetch data: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/proxy', '')
  const fullUrl = `${API_URL}${path}`

  console.log('Proxy POST request:', { path, fullUrl })

  const sessionToken = (await cookies()).get('session_token')
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('Request body:', body)

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error('Proxy error:', {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
      })

      const errorText = await response.text()
      console.error('Error response:', errorText)

      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  }
  catch (error) {
    console.error('Proxy error:', {
      error,
      url: fullUrl,
    })
    return NextResponse.json(
      { error: `Failed to fetch data: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
