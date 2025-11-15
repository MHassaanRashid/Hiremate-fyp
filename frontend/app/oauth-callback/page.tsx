"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"

export default function OAuthCallback() {
  const router = useRouter()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    let isMounted = true
    
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error.message)
          if (isMounted) router.replace("/auth?tab=login")
          return
        }
        if (!data.session) {
          console.error("No session found")
          if (isMounted) router.replace("/auth/candidate")
          return
        }
        
        console.log("OAuth session:", data.session)
        
        // Get the intended role from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search)
        const intendedRole = urlParams.get('role') || localStorage.getItem('oauth_intended_role') || 'candidate'
        localStorage.removeItem('oauth_intended_role') // Clean up
        
        if (isMounted) {
          await handleOAuthCallback(data.session.access_token, data.session.refresh_token)
        }
      } catch (error: any) {
        console.error("OAuth callback error:", error.message)
        if (isMounted) router.replace("/auth?tab=login")
      }
    }
    
    handleCallback()
    
    return () => {
      isMounted = false
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