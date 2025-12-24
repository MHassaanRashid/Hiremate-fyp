"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hash = window.location.hash
        const role = searchParams.get("role") || "candidate"

        // console.log("🔹 Auth Callback - Hash:", hash)
        // console.log("🔹 Auth Callback - Role:", role)

        // Get current session after redirect
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth error:", error)
          toast.error("Authentication failed.")
          router.replace(`/auth/${role}`)
          return
        }

        if (data.session) {
          const user = data.session.user
          // console.log("✓ User authenticated:", user.id)

          // Verify email confirmed
          if (user.email_confirmed_at) {
            toast.success("Email verified successfully!")

            // Map backend role to frontend role
            const roleMap: { [key: string]: string } = {
              "recruiter": "company",
              "candidate": "candidate",
              "interviewer": "interviewer"
            }
            const dashboardRole = roleMap[role] || role

            // Redirect to dashboard
            setTimeout(() => {
              router.replace(`/${dashboardRole}`)
            }, 1000)
          } else {
            // Email not yet verified, but they clicked the link
            toast.success("Email verified! You can now log in.")
            setTimeout(() => {
              router.replace(`/auth/${role}`)
            }, 1500)
          }
        } else {
          toast.error("Session not found. Please log in.")
          router.replace(`/auth/${role}`)
        }
      } catch (error: any) {
        console.error("Auth callback error:", error)
        toast.error(error.message || "An error occurred.")
        router.replace("/auth/candidate")
      }
    }

    handleAuth()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Verifying your email...</h2>
        <p className="text-sm text-muted-foreground mt-1">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
