"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import type { Provider } from "@supabase/supabase-js"

const API_URL = "/api";

// Prevent duplicate session checks (e.g. React StrictMode double-invocation in dev)
let hasSessionCheckRun = false;

interface AuthContextType {
  user: any | null
  isLoading: boolean
  loginWithEmail: (email: string, password: string, role?: string) => Promise<void>
  loginWithOAuth: (provider: Provider, intendedRole?: string) => Promise<void>
  handleOAuthCallback: (accessToken: string, refreshToken: string, intendedRole?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isCheckingSessionRef = useRef(false)
  const isProcessingOAuthRef = useRef(false)

  // Function to clear session and redirect to login
  const clearSessionAndRedirect = useCallback((redirectTo?: string) => {
    // Determine role-specific redirect before clearing localStorage
    let roleBasedRedirect = "/auth/candidate" // Default fallback

    if (!redirectTo) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/admin')) {
          roleBasedRedirect = "/admin/login";
        } else if (path.startsWith('/company')) {
          roleBasedRedirect = "/auth/company";
        } else if (path.startsWith('/interviewer')) {
          roleBasedRedirect = "/auth/interviewer";
        } else {
          // Fallback to trying to read role from local storage
          try {
            const storedUser = localStorage.getItem("user")
            if (storedUser) {
              const userData = JSON.parse(storedUser)
              const userRole = userData.role

              if (userRole === "recruiter") {
                roleBasedRedirect = "/auth/company"
              } else if (userRole === "interviewer") {
                roleBasedRedirect = "/auth/interviewer"
              } else if (userRole === "admin") {
                roleBasedRedirect = "/admin/login"
              }
            }
          } catch (error) {
            console.log("Could not determine user role, using default redirect")
          }
        }
      }
    }

    // Clear session data
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict"
    document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Strict"
    document.cookie = "user_role=; path=/; max-age=0; SameSite=Strict"
    setUser(null)

    // Only redirect if not already on auth page
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      router.replace(redirectTo || roleBasedRedirect)
    }
  }, [router])

  // Check session validity
  const checkSession = useCallback(async (): Promise<boolean> => {
    const storedUser = localStorage.getItem("user")
    const accessToken = localStorage.getItem("access_token")

    if (!storedUser || !accessToken) {
      return false
    }

    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "69420"
        },
      })

      if (response.ok) {
        const data = await response.json()
        const parsedUser = JSON.parse(storedUser)
        // Update user data if it changed
        const updatedUser = {
          ...parsedUser,
          ...data.user
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))

        // Sync with Supabase client session
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: localStorage.getItem("refresh_token") || ""
        })

        return true
      } else {
        // Token invalid - session expired
        clearSessionAndRedirect()
        return false
      }
    } catch (error) {
      console.log("Token validation failed")
      clearSessionAndRedirect()
      return false
    }
  }, [clearSessionAndRedirect])

  useEffect(() => {
    const getSession = async () => {
      // Skip if we're on OAuth callback page (it will handle the session)
      if (typeof window !== 'undefined' && window.location.pathname === '/oauth-callback') {
        setIsLoading(false)
        return
      }

      // Prevent duplicate calls (e.g. React StrictMode in dev) or if OAuth is being processed
      if (hasSessionCheckRun || isCheckingSessionRef.current || isProcessingOAuthRef.current) {
        setIsLoading(false)
        return
      }

      try {
        hasSessionCheckRun = true
        isCheckingSessionRef.current = true
        await checkSession()
      } catch (error) {
        console.error("Session restoration error:", error)
      } finally {
        setIsLoading(false)
        isCheckingSessionRef.current = false
      }
    }
    getSession()
  }, [checkSession])

  // Periodic session check (every 5 minutes)
  useEffect(() => {
    if (!user || isProcessingOAuthRef.current) return

    const interval = setInterval(async () => {
      if (!isProcessingOAuthRef.current) {
        await checkSession()
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [user, checkSession])

  const loginWithEmail = async (email: string, password: string, role?: string) => {
    setIsLoading(true)
    try {
      // Map frontend role to backend role for the API call
      // Frontend uses "company" but backend uses "recruiter"
      let backendRole = role
      if (role === "company") {
        backendRole = "recruiter"
      }

      console.log("Login with email, role:", role, "mapped to backend role:", backendRole)

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({ email, password, role: backendRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || "Login failed")

      console.log("Login response user data:", data.user)

      // Store tokens securely (Secure flag only in production)
      // Use Lax for SameSite to ensure cookies are sent during top-level navigations (redirects)
      // Strict can sometimes block cookies on initial redirect flows depending on browser/origin
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `access_token=${data.access_token}; path=/; max-age=3600; SameSite=Lax${secure}`
      document.cookie = `refresh_token=${data.refresh_token}; path=/; max-age=604800; SameSite=Lax${secure}`
      // Store user role cookie for session expiration redirects (longer expiry)
      document.cookie = `user_role=${data.user.role}; path=/; max-age=2592000; SameSite=Lax${secure}`

      // Store user data
      const userData = {
        ...data.user,
        access_token: data.access_token,
        loginTime: new Date().toISOString()
      }
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)

      // Sync with Supabase client session
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })

      setUser(userData)

      // Map backend role to frontend role for routing
      // Backend returns "recruiter" but frontend routes use "company"
      const backendRoleFromResponse = data.user.role
      const dashboardPath = backendRoleFromResponse === "recruiter"
        ? "/company"
        : backendRoleFromResponse === "interviewer"
          ? "/interviewer"
          : backendRoleFromResponse === "admin"
            ? "/admin/dashboard"
            : "/candidate"

      console.log("Redirecting to dashboard:", dashboardPath, "based on role:", backendRoleFromResponse)

      // Navigate immediately
      router.replace(dashboardPath)
    } catch (err: any) {
      console.error("Login error:", err.message)
      throw new Error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithOAuth = async (provider: Provider, intendedRole?: string) => {
    setIsLoading(true)
    try {
      const allowed = ["candidate", "company", "interviewer"]
      const safeRole = allowed.includes(String(intendedRole).toLowerCase()) ? String(intendedRole).toLowerCase() : "candidate"

      // Store in localStorage as a backup
      localStorage.setItem('oauth_intended_role', safeRole)

      console.log(`Starting OAuth for role: ${safeRole}`)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Pass role in queryParams (some providers might pass this back, but primarily for Supabase hooks if needed)
          queryParams: {
            role: safeRole
          },
          // Crucial: Pass role in redirectTo so it comes back to our callback page
          redirectTo: `${window.location.origin}/oauth-callback?role=${safeRole}`
        },
      })
      if (error) throw new Error(error.message)
    } catch (error: any) {
      console.error("OAuth login error:", error.message)
      throw new Error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthCallback = async (
    accessToken: string,
    refreshToken: string,
    intendedRole?: string
  ) => {
    if (isProcessingOAuthRef.current) return

    setIsLoading(true)
    isProcessingOAuthRef.current = true

    try {
      // ✅ STEP 1: Trust the URL role. Backend is the boss.
      const backendRole = intendedRole || "candidate"
      console.log(`📡 Sending OAuth Role to Backend: ${backendRole}`)

      // ✅ STEP 2: Call backend with role AS-IS
      const query = `?role=${encodeURIComponent(backendRole)}`
      const apiUrl = `/api/auth/user${query}`
      console.log(`📡 Backend API URL: ${apiUrl}`)


      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "69420"
        },
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Failed to fetch user")
      }

      const data = await response.json()
      if (!data.user) {
        throw new Error("User data missing from backend")
      }

      console.log("✅ Backend response user:", data.user)

      // ✅ STEP 3: Store session
      const secure = window.location.protocol === "https:" ? "; Secure" : ""
      document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Strict${secure}`
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Strict${secure}`
      // Store user role cookie for session expiration redirects (longer expiry)
      document.cookie = `user_role=${data.user.role}; path=/; max-age=2592000; SameSite=Strict${secure}`

      const userData = {
        ...data.user,
        access_token: accessToken,
        loginMethod: "oauth",
        loginTime: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("refresh_token", refreshToken)

      // Sync with Supabase client session
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      setUser(userData)

      // ✅ STEP 4: Redirect based on BACKEND role only
      let dashboard = "/candidate"
      if (data.user.role === "recruiter") dashboard = "/company"
      else if (data.user.role === "interviewer") dashboard = "/interviewer"
      else if (data.user.role === "admin") dashboard = "/admin/dashboard"

      console.log(`🔀 Redirecting to dashboard: ${dashboard} (Role: ${data.user.role})`)

      router.push(dashboard)
    } catch (error: any) {
      console.error("OAuth callback failed:", error.message)

      await supabase.auth.signOut()
      clearSessionAndRedirect(`/auth/${intendedRole || "candidate"}`)
      throw error
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        isProcessingOAuthRef.current = false
      }, 1000)
    }
  }


  const logout = async () => {
    await supabase.auth.signOut()
    clearSessionAndRedirect()
  }

  // Export checkSession for use in API calls
  useEffect(() => {
    // Make checkSession available globally for API error handling
    if (typeof window !== 'undefined') {
      (window as any).checkAuthSession = checkSession;
      (window as any).clearAuthSession = clearSessionAndRedirect
    }
  }, [checkSession, clearSessionAndRedirect])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, loginWithEmail, loginWithOAuth, handleOAuthCallback, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
