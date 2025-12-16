"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import SocialLogin from "@/components/auth/social-login"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface AuthPageInnerProps {
  role: "candidate" | "company" | "interviewer"
}

export default function AuthPageInner({ role }: AuthPageInnerProps) {
  const { isLoading, loginWithEmail, loginWithOAuth } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role,
  })

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      toast.error(decodeURIComponent(error))
      // Clean up URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])



  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Use the auth context login method
      await loginWithEmail(formData.email, formData.password, role)
      toast.success("Login successful!")
      // Redirect is handled by the auth context
    } catch (err: any) {
      console.error("Login error:", err)
      toast.error(err.message || "Login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Map frontend role to backend role
      const backendRole = role === "company" ? "recruiter" : role
      const registrationData = { 
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: backendRole 
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      })
      const data = await response.json()
      if (response.ok) {
        const userEmail = data.user?.email || formData.email
        toast.success(
          `Successfully Registered. An email has been sent to ${userEmail} Please verify.`,
          { duration: 4000 }
        )
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setActiveTab("login")
          setFormData({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            role,
          })
        }, 2000)
      } else {
        const errorMsg = data.detail || data.error || "Failed to create account."
        // Check for email validation error
        if (errorMsg.includes("invalid") || errorMsg.includes("Email")) {
          toast.error(`Please use a valid email address (Gmail, Outlook, etc.)`)
        } else {
          toast.error(errorMsg)
        }
      }
    } catch (err) {
      console.error("Registration error:", err)
      toast.error("An error occurred during registration.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOAuthLogin = async (provider: "google") => {
    setIsSubmitting(true)
    try {
      await loginWithOAuth(provider, role)
      // OAuth redirect is handled by the auth context after successful login
    } catch (err) {
      console.error("OAuth login error:", err)
      toast.error("OAuth login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const leftContent = {
    candidate: {
      title: "Mock Interviews",
      text: "Prepare with industry experts and get feedback that improves your chances of landing your dream job.",
    },
    company: {
      title: "Business",
      text: "Hire smarter with faster candidate evaluations powered by vetted interviewers.",
    },
    interviewer: {
      title: "Interviewer",
      text: "Join our network of expert interviewers and earn by sharing your knowledge.",
    },
  }

  return (
    <div className="flex h-screen">
      {/* Left Section (fixed) */}
      <div className="w-1/2 bg-gray-100 p-8 flex flex-col justify-center sticky top-0 h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{leftContent[role].title}</h2>
        <p className="text-gray-600 mb-6">{leftContent[role].text}</p>
        <a href="#" className="text-blue-600 text-sm">
          Learn more →
        </a>
      </div>

      {/* Right Section (scrollable) */}
      <div className="w-1/2 bg-white p-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-2">
            <Link href="/" className="flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold italic font-mono text-xl">HM</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-800">HireMate</span>
            </Link>
            <div className="bg-blue-600 text-white rounded-sm my-4 px-3 py-1 text-sm w-fit mx-auto">
              {leftContent[role].title.toUpperCase()}
            </div>
            <h2 className="text-3xl font-mono font-semibold">
              {activeTab === "login" ? `Login as ${role}` : `Register as ${role}`}
            </h2>
          </div>

          <Card className="w-full border-0 shadow-md">
            <CardContent className="p-6">
              <SocialLogin mode={activeTab} handleOAuthLogin={handleOAuthLogin} />

              {activeTab === "login" ? (
                <>
                  <LoginForm
                    role={role}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleLogin={handleLogin}
                    isLoading={isSubmitting}
                  />

                  <div className="text-center mt-4">
                    <a href="#" className="text-gray-500 text-sm">
                      Forgot password?
                    </a>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      No account?{" "}
                      <button
                        onClick={() => setActiveTab("signup")}
                        className="text-blue-600 hover:underline"
                      >
                        Join now! Create an account
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <RegisterForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleRegister={handleRegister}
                    isLoading={isSubmitting}
                  />

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button
                        onClick={() => setActiveTab("login")}
                        className="text-blue-600 hover:underline"
                      >
                        Log in
                      </button>
                    </p>
                  </div>
                </>
              )}

              <p className="text-center text-gray-500 text-xs mt-4">
                This site is protected by the Intervues's Privacy Policy and Terms of Service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
