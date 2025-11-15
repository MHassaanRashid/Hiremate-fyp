"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import type { Provider } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL environment variable");
}
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Prevent duplicate session checks (e.g. React StrictMode double-invocation in dev)
let hasSessionCheckRun = false;

interface AuthContextType {
  user: any | null
  isLoading: boolean
  loginWithEmail: (email: string, password: string) => Promise<void>
  loginWithOAuth: (provider: Provider, intendedRole?: string) => Promise<void>
  handleOAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>
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
  const clearSessionAndRedirect = useCallback(() => {
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict"
    document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Strict"
    setUser(null)
    // Only redirect if not already on auth page
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      router.replace("/auth/candidate")
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
        headers: { Authorization: `Bearer ${accessToken}` },
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

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || "Login failed")

      // Store tokens securely (Secure flag only in production)
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `access_token=${data.access_token}; path=/; max-age=3600; SameSite=Strict${secure}`
      document.cookie = `refresh_token=${data.refresh_token}; path=/; max-age=604800; SameSite=Strict${secure}`

      // Store user data
      const userData = {
        ...data.user,
        access_token: data.access_token,
        loginTime: new Date().toISOString()
      }
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("access_token", data.access_token)
      setUser(userData)

      // Map backend role to frontend role for routing
      const frontendRole = data.user.role === "recruiter" ? "company" : data.user.role
      const dashboardPath = frontendRole === "company"
        ? "/company"
        : frontendRole === "interviewer"
        ? "/interviewer"
        : "/candidate"
      
      // Use router.push for seamless navigation (no page refresh)
      router.push(dashboardPath)
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
      // Store the intended role for OAuth callback
      if (intendedRole) {
        localStorage.setItem('oauth_intended_role', intendedRole)
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: window.location.origin + `/oauth-callback${intendedRole ? `?role=${intendedRole}` : ''}` 
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

  const handleOAuthCallback = async (accessToken: string, refreshToken: string) => {
    // Prevent duplicate calls
    if (isProcessingOAuthRef.current) {
      return
    }

    setIsLoading(true)
    isProcessingOAuthRef.current = true
    
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await response.json()
      if (!response.ok || !data.user) throw new Error(data.detail || data.error || "Failed to fetch user data")

      // Store tokens securely (Secure flag only in production)
      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Strict${secure}`
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Strict${secure}`

      // Store user data with OAuth info
      const userData = {
        ...data.user,
        access_token: accessToken,
        loginTime: new Date().toISOString(),
        loginMethod: 'oauth'
      }
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("access_token", accessToken)
      setUser(userData)

      // Map backend role to frontend role for routing
      const frontendRole = data.user.role === "recruiter" ? "company" : data.user.role
      const dashboardPath = frontendRole === "company"
        ? "/company"
        : frontendRole === "interviewer"
        ? "/interviewer"
        : "/candidate"
      
      // Use router.push for seamless navigation
      router.push(dashboardPath)
    } catch (error: any) {
      console.error("OAuth callback error:", error.message)
      throw new Error(error.message)
    } finally {
      setIsLoading(false)
      // Reset after a short delay to allow navigation
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
      (window as any).checkAuthSession = checkSession
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
