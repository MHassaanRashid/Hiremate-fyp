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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Info, CheckCircle2, Star, Users, Zap, Briefcase, Award, TrendingUp } from "lucide-react"

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

  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false)

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
      title: "Elevate Your Career",
      subtitle: "Master the Interview",
      text: "Join thousands of candidates who use HireMate to prepare with industry experts and land their dream jobs.",
      bg: "/auth/candidate_bg.png",
      details: {
        title: "For Candidates",
        description: "HireMate is your ultimate career growth partner.",
        features: [
          "AI-Powered Technical Quizzes",
          "Mock Interviews with Industry Experts",
          "Detailed Performance Analytics",
          "Direct Connection to Top Companies",
        ],
        stats: "10,000+ Candidates Hired",
      }
    },
    company: {
      title: "Hiring Reimagined",
      subtitle: "Scale with Confidence",
      text: "Hire smarter and faster with our vetted interviewer network and automated screening tools.",
      bg: "/auth/company_bg.png",
      details: {
        title: "For Businesses",
        description: "Streamline your recruitment pipeline with HireMate.",
        features: [
          "Vetted Technical Interviewers",
          "Automated Coding Assessments",
          "Bias-Free Evaluation Reports",
          "Integration with your ATS",
        ],
        stats: "60% Faster Time-to-Hire",
      }
    },
    interviewer: {
      title: "Expert Network",
      subtitle: "Share & Earn",
      text: "Join an elite community of experts. Help companies find talent and earn by sharing your knowledge.",
      bg: "/auth/interviewer_bg.png",
      details: {
        title: "For Interviewers",
        description: "Turn your expertise into a rewarding side hustle.",
        features: [
          "Flexible Interview Scheduling",
          "Competitive Compensation",
          "Professional Networking",
          "Impact Candidate Careers",
        ],
        stats: "$50,000+ Paid to Interviewers",
      }
    },
  }

  const roleContent = leftContent[role]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section (fixed) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-12 text-white overflow-hidden">
        {/* Background Image with Zoom Effect */}
        <div
          className="absolute inset-0 z-0 scale-105"
          style={{
            backgroundImage: `url('${roleContent.bg}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.5)'
          }}
        />

        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/80 via-indigo-900/60 to-transparent" />

        <div className="relative z-20 max-w-lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-12 bg-blue-500 rounded-full" />
            <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">
              {roleContent.subtitle}
            </span>
          </div>

          <h2 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            {roleContent.title}
          </h2>

          <p className="text-xl text-blue-50/90 mb-10 leading-relaxed font-light">
            {roleContent.text}
          </p>

          <button
            onClick={() => setIsLearnMoreOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full transition-all group font-medium"
          >
            Learn more about our platform
            <Info className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>

      </div>

      {/* Learn More Popup */}
      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <DialogHeader className="text-left">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold">{roleContent.details.title}</DialogTitle>
              <DialogDescription className="text-blue-100 text-lg">
                {roleContent.details.description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {roleContent.details.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-600 font-bold text-2xl leading-none">{roleContent.details.stats}</p>
                  <p className="text-blue-700/70 text-sm font-medium">Proven platform success</p>
                </div>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="p-8 pt-0 bg-white">
            <button
              onClick={() => setIsLearnMoreOpen(false)}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              Get Started Now
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Right Section (scrollable) */}
      <div className="w-full lg:w-1/2 bg-white p-8 overflow-y-auto">
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
