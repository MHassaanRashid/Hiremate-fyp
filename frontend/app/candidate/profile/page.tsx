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
  Edit2,
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
import { cn } from "@/lib/utils"

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
      <div className="relative group">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg ring-2 ring-border">
          <AvatarImage src={preview || undefined} className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm ring-2 ring-background">
          <Edit2 className="w-3.5 h-3.5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full z-10">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground">Profile photo</p>
          <p className="text-xs text-muted-foreground">Click the edit icon to upload.</p>
        </div>
        <div>
          {email && <p className="text-xs text-muted-foreground truncate max-w-[200px]">Signed in as {email}</p>}
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="rounded-xl bg-card border border-border px-3 py-3 shadow-sm flex items-center gap-3 hover:border-primary/50 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold line-clamp-1">{item.label}</p>
              <p className="text-sm font-bold text-foreground">{item.value}</p>
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
      <CandidateLayout>
        <div className="min-h-[70vh] flex flex-col gap-6 max-w-6xl mx-auto p-6 bg-muted/30">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
          </div>
        </div>
      </CandidateLayout>
    )
  }

  if (loading || !resumeData) {
    return (
      <CandidateLayout>
        <div className="min-h-[70vh] flex flex-col gap-6 max-w-6xl mx-auto p-6 bg-muted/30">
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
        <div className="min-h-[60vh] flex items-center justify-center bg-muted/30">
          <div className="text-center max-w-md p-6 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-red-500 mb-3 font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try refreshing the page. If the problem persists, please sign out and sign in again.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
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
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <Card className="border border-border bg-card shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50" />
            <CardContent className="px-6 pb-6 -mt-12 flex flex-col gap-6 relative">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Left: photo + basic info */}
                <div className="flex-1 space-y-4 text-center md:text-left pt-2 md:pt-0">
                  <div className="flex justify-center md:justify-start">
                    <ProfilePicture name={personalInfo.fullName || ""} email={personalInfo.email} />
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 justify-center md:justify-start">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        {personalInfo.fullName || "Your profile"}
                      </h1>
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1.5 w-max mx-auto md:mx-0 px-2.5 py-0.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" />
                        Candidate
                      </Badge>
                    </div>
                    {personalInfo.summary && (
                      <p className="text-sm text-muted-foreground max-w-2xl mx-auto md:mx-0 line-clamp-2 leading-relaxed">
                        {personalInfo.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-1">
                    {personalInfo.email && (
                      <span className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <Mail className="h-3.5 w-3.5 text-primary/70" />
                        <span className="truncate max-w-[180px] sm:max-w-xs">{personalInfo.email}</span>
                      </span>
                    )}
                    {personalInfo.phone && (
                      <span className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <Phone className="h-3.5 w-3.5 text-primary/70" />
                        <span>{personalInfo.phone}</span>
                      </span>
                    )}
                    {personalInfo.location && (
                      <span className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <MapPin className="h-3.5 w-3.5 text-primary/70" />
                        <span className="truncate max-w-[160px] sm:max-w-xs">{personalInfo.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: completion + stats */}
                <div className="w-full md:w-80 space-y-4 pt-4 md:pt-12">
                  <div className="flex flex-col gap-3">
                    <Button
                      className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                      onClick={() => window.location.href = '/candidate/resume'}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>

                    <div className="rounded-xl border border-border bg-muted/50 px-5 py-4 flex items-center gap-4">
                      <div className="relative h-14 w-14 flex-shrink-0">
                        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            className="text-muted"
                          />
                          <path
                            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeDasharray={`${profileCompletion}, 100`}
                            className="text-primary"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {profileCompletion}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-foreground">
                          Profile Completeness
                        </p>
                        <p className="text-xs font-bold text-primary">{completionLabel}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Detailed profiles get 2x more views
                        </p>
                      </div>
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

              {/* Online Presence */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Globe className="h-4 w-4 text-primary" />
                    </span>
                    Online Presence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-sm">
                  {personalInfo.website && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={personalInfo.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline break-all font-medium"
                      >
                        Portfolio Website
                      </a>
                    </div>
                  )}
                  {personalInfo.linkedin && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline break-all font-medium"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {personalInfo.github && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline break-all font-medium"
                      >
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {!personalInfo.website && !personalInfo.linkedin && !personalInfo.github && (
                    <div className="text-center py-6">
                      <Globe className="h-8 w-8 text-muted mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No social links added yet.</p>
                      <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1">Add Links</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Code className="h-4 w-4 text-primary" />
                    </span>
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {skills && skills.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {skills.map((skill, idx) => (
                        <div key={`${skill.name}-${idx}`} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground">{skill.name}</span>
                            <span className="text-muted-foreground">
                              {skill.level >= 4 ? "Advanced" : skill.level === 3 ? "Intermediate" : "Beginner"}
                            </span>
                          </div>
                          <Progress value={(skill.level / 5) * 100} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Code className="h-8 w-8 text-muted mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No skills added yet.</p>
                      <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1">Add Skills</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: summary, experience, education */}
            <div className="space-y-6 lg:col-span-2">
              {/* Summary */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </span>
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {personalInfo.summary ? (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {personalInfo.summary}
                    </p>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">No summary added yet.</p>
                      <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1">Add Summary</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </span>
                    Work Experience
                  </CardTitle>
                  {experience.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-medium">{experience.length} Positions</Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  {experience && experience.length > 0 ? (
                    experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="border-l-2 border-primary/20 pl-4 py-1 relative group">
                        <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{exp.position}</h3>
                            <p className="text-xs font-semibold text-primary">{exp.company}</p>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded">
                            {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : exp.current ? "- Present" : ""}
                          </div>
                        </div>
                        {exp.location && (
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {exp.location}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <Briefcase className="h-8 w-8 text-muted mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No work experience added yet.</p>
                      <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1">Add Experience</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </span>
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {education && education.length > 0 ? (
                    education.map((edu, idx) => (
                      <div key={edu.id || idx} className="border border-border rounded-xl bg-muted/10 p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                            </h3>
                            <p className="text-xs font-medium text-primary mt-0.5">{edu.institution}</p>
                          </div>
                          {edu.gpa && (
                            <Badge variant="outline" className="text-[10px] shrink-0">GPA: {edu.gpa}</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {edu.startDate}
                          {edu.graduationYear ? ` - ${edu.graduationYear}` : edu.current ? " - Present" : ""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <GraduationCap className="h-8 w-8 text-muted mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No education added yet.</p>
                      <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1">Add Education</Button>
                    </div>
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
