import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Use BACKEND_URL (server-side) or NEXT_PUBLIC_BACKEND_URL (client-side backup)
// Fallback to the discovered live backend URL if nothing is set.
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://hassaanrashid-hiremate-backend.hf.space'

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const pathSegments = await params.path
        const path = pathSegments.join('/')
        const { searchParams } = new URL(request.url)

        // Normalization for auth/user requests (matching backend expectations)
        if (pathSegments.join('/') === 'auth/user') {
            let role = searchParams.get('role')
            if (role) {
                role = role.toLowerCase()
                if (role === 'company') searchParams.set('role', 'recruiter')
                if (role === 'candidates') searchParams.set('role', 'candidate')
            }
        }

        const queryString = searchParams.toString()

        // Normalize backend URL: remove trailing slashes and potential /api suffix
        const backendBase = BACKEND_URL.replace(/\/+$/, '').replace(/\/api$/, '')

        // Construct target URL. 
        // Most of our backend routes already expect /api prefix, but since we are capturing /api/:path,
        // we need to decide if we keep /api or not.
        // In our backend, routes are like: @router.get("/languages") in quiz.py (prefix="quiz")
        // and main.py includes it with prefix="/api".
        // So the target MUST be /api/quiz/languages.
        const targetUrl = `${backendBase}/api/${path}${queryString ? `?${queryString}` : ''}`

        console.log(`[Universal Proxy] ${request.method} -> ${targetUrl}`)

        const headers = new Headers(request.headers)
        // Avoid host header mismatch issues which can trigger security blocks on HF/Vercel
        headers.delete('host')
        headers.set('ngrok-skip-browser-warning', '69420')

        const method = request.method
        const options: RequestInit = {
            method,
            headers,
        }

        // Only forward body for appropriate methods
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const contentType = request.headers.get('content-type')
            if (contentType && !contentType.includes('multipart/form-data')) {
                options.body = await request.text()
            } else if (contentType && contentType.includes('multipart/form-data')) {
                // For file uploads, we forward as a blob/form-data
                options.body = await request.formData()
            }
        }

        const response = await fetch(targetUrl, options)

        // Handle non-JSON responses (like errors or binary data) gracefully
        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
            const data = await response.json()
            return NextResponse.json(data, { status: response.status })
        } else {
            const data = await response.blob()
            return new NextResponse(data, {
                status: response.status,
                headers: {
                    'Content-Type': contentType,
                },
            })
        }
    } catch (error: any) {
        console.error(`[Universal Proxy] Critical Error for ${request.url}:`, error)
        return NextResponse.json(
            { error: error.message || 'Internal server error during proxying' },
            { status: 500 }
        )
    }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const DELETE = proxyRequest
export const PATCH = proxyRequest
