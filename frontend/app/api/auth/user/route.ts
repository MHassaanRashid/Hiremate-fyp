import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RAW_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Normalize backend base URL and avoid self-calls
    const currentOrigin = new URL(request.url).origin
    let backendBase = RAW_BACKEND_URL.replace(/\/+$/, '')
    if (backendBase.startsWith(currentOrigin)) {
      backendBase = 'http://localhost:8000'
    }
    backendBase = backendBase.replace(/\/api$/, '')

    // Get the role query parameter
    const { searchParams } = new URL(request.url)
    let role = searchParams.get('role')
    if (role) {
      role = role.toLowerCase()
      if (role === 'company') role = 'recruiter'
      if (role === 'candidates') role = 'candidate'
      if (!['candidate', 'recruiter', 'interviewer'].includes(role)) role = 'candidate'
    }

    // Get the authorization header from the request
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      )
    }

    // Build the backend URL with role parameter if provided
    let backendUrl = `${backendBase}/api/auth/user`
    if (role) {
      backendUrl += `?role=${encodeURIComponent(role)}`
    }

    console.log(`[API Proxy] Proxying request to: ${backendUrl}`)
    console.log(`[API Proxy] Role parameter: ${role}`)

    // Forward the request to the backend with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let response: Response
    try {
      response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw fetchError
    }

    const data = await response.json()

    console.log(`[API Proxy] Backend response status: ${response.status}`)
    console.log(`[API Proxy] Backend response data:`, data)

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('[API Proxy] Error proxying request:', error)

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. Backend server may be unavailable.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

