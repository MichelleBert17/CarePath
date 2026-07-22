import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

/**
 * Proxy auth requests to the Express backend.
 * This route exists as a fallback for server-side API calls
 * and for environments where direct backend access is restricted.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(request.url)
    const action = url.searchParams.get('action') ?? 'login'
    const endpoint = action === 'register' ? '/auth/register' : '/auth/login'

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.error ?? data.message ?? 'Auth request failed' },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Unable to connect to authentication service.' },
      { status: 503 },
    )
  }
}