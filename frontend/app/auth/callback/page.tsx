"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // Get current session after OAuth redirect
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Auth error:", error)
        router.replace("/auth?tab=login")
        return
      }

      if (data.session) {
        const user = data.session.user

        // Get role from query param
        const roleFromQuery = new URLSearchParams(window.location.search).get("role") as
          | "candidates"
          | "company"
          | null

        // If role is passed and not already set, update user metadata
        if (roleFromQuery && !user.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: { role: roleFromQuery },
          })
        }

        // Use the updated role or default
        const userRole = user.user_metadata?.role || roleFromQuery || "candidates"

        // Redirect to the role-based dashboard
        router.replace(
          userRole === "company"
            ? "/company"
            : "/candidates"
        )
      } else {
        router.replace("/auth?tab=login")
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
