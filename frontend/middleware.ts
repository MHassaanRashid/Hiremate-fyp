import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

async function fetchUserRole(
  accessToken: string,
  retries: number = 2,
  delay: number = 100
): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use the environment variable or fallback to localhost:8000
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const response = await fetch(`${backendUrl}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const data = await response.json()
      console.log("Middleware /auth/user response:", data)

      if (response.ok && data.user && data.user.role) {
        return data.user.role
      }
      console.log(`Attempt ${attempt} failed:`, data)
    } catch (error) {
      console.error(`Attempt ${attempt} error fetching user:`, error)
    }

    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return null
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value
  const { pathname } = request.nextUrl
  console.log("Middleware triggered:", { pathname, accessToken })

  // ✅ Redirect plain /auth → /auth/candidate
  if (pathname === "/auth") {
    return NextResponse.redirect(new URL("/auth/candidate", request.url))
  }

  // ✅ Allow access to oauth-callback always
  if (pathname === "/oauth-callback") {
    console.log("Allowing access to /oauth-callback")
    return NextResponse.next()
  }

  // ✅ Unauthenticated → redirect to role-specific auth page if role cookie exists
  if (!accessToken && !pathname.startsWith("/auth")) {
    // Check if we have a role cookie from previous session
    const userRole = request.cookies.get("user_role")?.value
    let authRedirect = "/auth/candidate" // Default fallback

    if (userRole === "recruiter") {
      authRedirect = "/auth/company"
    } else if (userRole === "interviewer") {
      authRedirect = "/auth/interviewer"
    }

    console.log(`No access token, redirecting to ${authRedirect}`)
    return NextResponse.redirect(new URL(authRedirect, request.url))
  }

  // ✅ Authenticated → redirect away from /auth/*
  if (accessToken && pathname.startsWith("/auth")) {
    const role = await fetchUserRole(accessToken)
    if (!role) {
      // Check if we have a role cookie as fallback
      const userRole = request.cookies.get("user_role")?.value
      let authRedirect = "/auth/candidate" // Default fallback

      if (userRole === "recruiter") {
        authRedirect = "/auth/company"
      } else if (userRole === "interviewer") {
        authRedirect = "/auth/interviewer"
      }

      console.log(`Failed to fetch valid user role, redirecting to ${authRedirect}`)
      return NextResponse.redirect(new URL(authRedirect, request.url))
    }

    // 🔹 Map role → new clean paths
    const redirectPath = role === "recruiter" ? "/company" :
      role === "interviewer" ? "/interviewer" : "/candidate"
    console.log("Authenticated user, redirecting to:", redirectPath)

    const response = NextResponse.redirect(new URL(redirectPath, request.url))
    response.cookies.set("user_role", role, {
      path: "/",
      maxAge: 3600,
      sameSite: "strict",
    })
    return response
  }

  // ✅ Allow dashboards if authenticated
  if (accessToken && (pathname === "/company" || pathname === "/candidate" || pathname === "/interviewer")) {
    console.log("Authenticated, allowing access to:", pathname)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/company",
    "/candidate",
    "/interviewer",
    "/interviewer/:path*",
    "/oauth-callback"
  ],
}
