"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import {
  Calendar,
  Globe,
  Linkedin,
  Github,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
  Briefcase,
  GraduationCap,
  Code,
  Eye,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import CandidateLayout from "@/layouts/CandidateLayout"
import { getUserResume } from "@/lib/api/resume"
import { getDashboardStats } from "@/lib/api/dashboard"
import type { ResumeData } from "@/components/resume"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

// ---------------------------
// Types
// ---------------------------
interface ProfileStats {
  applicationsSubmitted: number
  interviewsScheduled: number
  profileViews: number
  profileScore: number
}

// ---------------------------
// Reusable UI Pieces
// ---------------------------
const ProfilePicture = ({
  name,
  email,
}: {
  name: string
  email?: string
}) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const initials = useMemo(
    () =>
      name
        ?.split(" ")
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase())
        .join("") || "HM",
    [name]
  )

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // TODO: connect to real avatar upload endpoint when available
    setIsUploading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-blue-100 shadow-md shadow-blue-500/20">
          <AvatarImage src={preview || undefined} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white text-2xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-900">Profile photo</p>
          <p className="text-xs text-gray-500">Click to upload a professional headshot.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 cursor-pointer transition-colors">
            <span>Upload image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {email && <p className="text-xs text-gray-500 truncate max-w-[200px]">Signed in as {email}</p>}
        </div>
      </div>
    </div>
  )
}

const StatsStrip = ({ stats }: { stats: ProfileStats | null }) => {
  if (!stats) return null

  const items = [
    { label: "Profile views", value: stats.profileViews, icon: Eye },
    { label: "Applications", value: stats.applicationsSubmitted, icon: Briefcase },
    { label: "Interviews", value: stats.interviewsScheduled, icon: Calendar },
    { label: "Profile score", value: `${stats.profileScore}%`, icon: Target },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="rounded-xl bg-white/80 border border-blue-100 px-3 py-2 shadow-sm flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------
// Main Page Component
// ---------------------------
export default function CandidateProfilePage() {
  const { user, isLoading: authLoading } = useAuth()

  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [profileCompletion, setProfileCompletion] = useState<number>(0)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("access_token")
        if (!token) {
          setError("Please sign in to view your profile.")
          return
        }

        const [resumeRes, statsRes] = await Promise.all([
          getUserResume(token),
          getDashboardStats(token),
        ])

        // Map resume data into a view model (read-only)
        if (resumeRes?.resume?.resumeData) {
          const apiData = resumeRes.resume.resumeData as ResumeData
          const mapped: ResumeData = {
            personalInfo: {
              fullName: apiData.personalInfo?.fullName || user.full_name || "",
              email: apiData.personalInfo?.email || user.email || "",
              phone: apiData.personalInfo?.phone || "",
              location: apiData.personalInfo?.location || "",
              website: apiData.personalInfo?.website || "",
              linkedin: apiData.personalInfo?.linkedin || "",
              github: apiData.personalInfo?.github || "",
              summary: apiData.personalInfo?.summary || "",
            },
            education: Array.isArray(apiData.education) ? apiData.education : [],
            experience: Array.isArray(apiData.experience) ? apiData.experience : [],
            projects: Array.isArray(apiData.projects) ? apiData.projects : [],
            skills: Array.isArray(apiData.skills) ? apiData.skills : [],
            certificates: Array.isArray(apiData.certificates) ? apiData.certificates : [],
          }
          setResumeData(mapped)

          const sections = {
            personalInfo:
              !!mapped.personalInfo.fullName &&
              !!mapped.personalInfo.email &&
              !!mapped.personalInfo.phone &&
              !!mapped.personalInfo.location,
            summary: !!mapped.personalInfo.summary,
            experience: mapped.experience.length > 0,
            education: mapped.education.length > 0,
            skills: mapped.skills.length > 0,
            projects: mapped.projects.length > 0,
            certificates: mapped.certificates.length > 0,
          }
          const keys = Object.keys(sections) as (keyof typeof sections)[]
          const completed = keys.filter((k) => sections[k]).length
          setProfileCompletion(Math.round((completed / keys.length) * 100))
        } else {
          // No resume yet; build a minimal profile from auth user
          const base: ResumeData = {
            personalInfo: {
              fullName: user.full_name || "",
              email: user.email || "",
              phone: "",
              location: "",
              website: "",
              linkedin: "",
              github: "",
              summary: "",
            },
            education: [],
            experience: [],
            projects: [],
            skills: [],
            certificates: [],
          }
          setResumeData(base)
          setProfileCompletion(10)
        }

        if (statsRes) {
          setStats(statsRes.stats)
        }
      } catch (err: any) {
        console.error("Error loading profile page", err)
        setError(err?.message || "Failed to load profile.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      load()
    }
  }, [authLoading, user])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Checking your session...</p>
        </div>
      </div>
    )
  }

  if (loading || !resumeData) {
    return (
      <CandidateLayout>
        <div className="min-h-[70vh] flex flex-col gap-6 max-w-6xl mx-auto p-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
          </div>
        </div>
      </CandidateLayout>
    )
  }

  if (error) {
    return (
      <CandidateLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-600 mb-3 font-medium">{error}</p>
            <p className="text-sm text-gray-500 mb-4">
              Try refreshing the page. If the problem persists, please sign out and sign in again.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Retry loading profile
            </Button>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  const completionLabel =
    profileCompletion >= 90
      ? "Excellent"
      : profileCompletion >= 70
        ? "Strong"
        : profileCompletion >= 40
          ? "In progress"
          : "Getting started"

  const { personalInfo, skills, experience, education } = resumeData

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <Card className="border border-blue-100/70 bg-white/90 backdrop-blur-xl shadow-lg shadow-blue-100">
            <CardContent className="p-4 sm:p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Left: photo + basic info */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="flex justify-center md:justify-start">
                    <ProfilePicture name={personalInfo.fullName || ""} email={personalInfo.email} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 justify-center md:justify-start">
                      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                        {personalInfo.fullName || "Your profile"}
                      </h1>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 w-max mx-auto md:mx-0">
                        <Sparkles className="h-3 w-3" />
                        Candidate profile
                      </Badge>
                    </div>
                    {personalInfo.summary && (
                      <p className="text-sm text-gray-600 max-w-xl mx-auto md:mx-0 line-clamp-2">
                        {personalInfo.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-gray-500">
                    {personalInfo.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[180px] sm:max-w-xs">{personalInfo.email}</span>
                      </span>
                    )}
                    {personalInfo.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{personalInfo.phone}</span>
                      </span>
                    )}
                    {personalInfo.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[160px] sm:max-w-xs">{personalInfo.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: completion + stats */}
                <div className="w-full md:w-72 space-y-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 flex items-center gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#DBEAFE"
                          strokeWidth={3}
                        />
                        <path
                          d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeDasharray={`${profileCompletion}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {profileCompletion}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                        Profile completeness
                      </p>
                      <p className="text-xs text-blue-800">{completionLabel}</p>
                      <p className="text-[11px] text-blue-900/80">
                        Complete your experience, education and skills to stand out.
                      </p>
                    </div>
                  </div>

                  <StatsStrip stats={stats} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left column: personal info + social links */}
            <div className="space-y-6 lg:col-span-1">
              {/* Personal info */}
              <Card className="border border-blue-100 bg-white/90 backdrop-blur-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                    </span>
                    Personal information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span>{personalInfo.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span>{personalInfo.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{personalInfo.location || "Not provided"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Social links */}
              <Card className="border border-blue-100 bg-white/90 backdrop-blur-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                      <Globe className="h-3.5 w-3.5 text-blue-600" />
                    </span>
                    Online presence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm text-gray-700">
                  {personalInfo.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <a
                        href={personalInfo.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {personalInfo.website}
                      </a>
                    </div>
                  )}
                  {personalInfo.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-500" />
                      <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {personalInfo.linkedin}
                      </a>
                    </div>
                  )}
                  {personalInfo.github && (
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4 text-gray-800" />
                      <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {personalInfo.github}
                      </a>
                    </div>
                  )}
                  {!personalInfo.website && !personalInfo.linkedin && !personalInfo.github && (
                    <p className="text-xs text-gray-500">No social links added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: summary, skills, experience, education */}
            <div className="space-y-6 lg:col-span-2">
              {/* Summary */}
              <Card className="border border-blue-100 bg-white/90 backdrop-blur-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                      <Target className="h-3.5 w-3.5 text-blue-600" />
                    </span>
                    Professional summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {personalInfo.summary ? (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {personalInfo.summary}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">No summary added yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border border-blue-100 bg-white/90 backdrop-blur-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                      <Code className="h-3.5 w-3.5 text-blue-600" />
                    </span>
                    Skills & expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {skills && skills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {skills.map((skill, idx) => (
                        <div key={`${skill.name}-${idx}`} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-800">{skill.name}</span>
                            <span className="text-gray-500">
                              {skill.level >= 4 ? "Advanced" : skill.level === 3 ? "Intermediate" : "Beginner"}
                            </span>
                          </div>
                          <Progress value={(skill.level / 5) * 100} className="h-1.5 bg-blue-50" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No skills added yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="border border-blue-100 bg-white/90 backdrop-blur-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                      <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                    </span>
                    Work experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {experience && experience.length > 0 ? (
                    experience.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-blue-100 pl-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{exp.position}</p>
                            <p className="text-xs text-blue-600">{exp.company}</p>
                          </div>
                          <div className="text-[11px] text-gray-500 text-right">
                            <p>
                              {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : exp.current ? "- Present" : ""}
                            </p>
                            {exp.location && <p>{exp.location}</p>}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-xs text-gray-700 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No work experience added yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="border border-blue-100 bg-white/90 backdrop-blur-xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                    </span>
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {education && education.length > 0 ? (
                    education.map((edu) => (
                      <div key={edu.id} className="border rounded-lg border-blue-50 bg-blue-50/40 p-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                        </p>
                        <p className="text-xs text-blue-700">{edu.institution}</p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {edu.startDate}
                          {edu.graduationYear ? ` - ${edu.graduationYear}` : edu.current ? " - Present" : ""}
                        </p>
                        {edu.gpa && (
                          <p className="text-[11px] text-gray-600 mt-1">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No education added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  )
}
