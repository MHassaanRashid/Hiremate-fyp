"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import toast from "react-hot-toast"

export default function OAuthCallback() {
  const router = useRouter()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const handleCallback = async () => {
      try {
        // Get the intended role from URL parameters or localStorage BEFORE any async operations
        // Handle URL with hash (#) - remove hash before parsing
        const currentUrl = window.location.href.split('#')[0]
        const urlParams = new URLSearchParams(new URL(currentUrl).search)

        console.log("🔹 OAuth Callback Page Loaded")
        console.log("🔹 URL Search Params:", urlParams.toString())

        // Retain check: in Strict Mode, this effect runs twice. 
        // We must NOT remove the item from localStorage immediately, or the second run will fail to find it.
        const cachedRole = localStorage.getItem('oauth_intended_role')
        let intendedRoleRaw = urlParams.get('role')

        console.log(`🔹 Raw Role from URL: '${intendedRoleRaw}'`)
        console.log(`🔹 Raw Role from LocalStorage: '${cachedRole}'`)

        intendedRoleRaw = intendedRoleRaw || cachedRole || 'candidate'

        const allowed = ["candidate", "company", "interviewer"]
        const intendedRole = allowed.includes(String(intendedRoleRaw).toLowerCase()) ? String(intendedRoleRaw).toLowerCase() : "candidate"

        console.log("🔹 Final Intended Role passed to Context:", intendedRole)

        // Set a timeout to prevent infinite hanging
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.error("OAuth callback timeout - redirecting to auth page")
            toast.error("Login is taking too long. Please try again.")
            router.replace(`/auth/${intendedRole}`)
          }
        }, 30000) // 30 second timeout

        const { data, error } = await supabase.auth.getSession()

        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (error) {
          console.error("Error getting session:", error.message)
          toast.error(error.message)
          if (isMounted) router.replace(`/auth/${intendedRole}`)
          return
        }
        if (!data.session) {
          console.error("No session found")
          toast.error("No session found. Please try logging in again.")
          if (isMounted) router.replace(`/auth/${intendedRole}`)
          return
        }

        console.log("OAuth session found for user:", data.session.user.id)

        if (isMounted) {
          await handleOAuthCallback(data.session.access_token, data.session.refresh_token, intendedRole)
          // Cleanup only after success
          localStorage.removeItem('oauth_intended_role')
        }
      } catch (error: any) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        console.error("OAuth callback error:", error.message)
        toast.error(error.message || "Login failed. Please try again.")

        // Cleanup on failure too
        localStorage.removeItem('oauth_intended_role')

        if (isMounted) {
          // Get intended role again for redirect
          const currentUrl = window.location.href.split('#')[0]
          const urlParams = new URLSearchParams(new URL(currentUrl).search)
          const intendedRoleRaw = urlParams.get('role') || localStorage.getItem('oauth_intended_role') || 'candidate'
          const allowed = ["candidate", "company", "interviewer"]
          const intendedRole = allowed.includes(String(intendedRoleRaw).toLowerCase()) ? String(intendedRoleRaw).toLowerCase() : "candidate"
          // Redirect to the intended role's auth page
          router.replace(`/auth/${intendedRole}`)
        }
      }
    }

    handleCallback()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router, handleOAuthCallback])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing login...</p>
      </div>
    </div>
  )
}
