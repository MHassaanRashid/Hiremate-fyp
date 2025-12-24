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
  Camera,
  ExternalLink,
  ChevronRight,
  Trophy,
  Edit,
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

interface ProfileStats {
  applicationsSubmitted: number
  interviewsScheduled: number
  profileViews: number
  profileScore: number
}

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (loading || !resumeData) {
    return (
      <CandidateLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-full w-full rounded-xl lg:col-span-2" />
            </div>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  const { personalInfo, skills, experience, education, projects, certificates } = resumeData

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24 border-4 border-blue-100 shadow-lg">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold">
                      {personalInfo.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {personalInfo.fullName || "Your Profile"}
                      </h1>
                      {personalInfo.summary && (
                        <p className="text-slate-600 max-w-2xl">
                          {personalInfo.summary}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => window.location.href = '/candidate/resume'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    {personalInfo.email && (
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {personalInfo.email}
                      </span>
                    )}
                    {personalInfo.phone && (
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {personalInfo.phone}
                      </span>
                    )}
                    {personalInfo.location && (
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {personalInfo.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats & Profile Strength */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats && (
              <>
                <StatCard icon={Eye} label="Profile Views" value={stats.profileViews} color="blue" />
                <StatCard icon={Briefcase} label="Applications" value={stats.applicationsSubmitted} color="emerald" />
                <StatCard icon={Calendar} label="Interviews" value={stats.interviewsScheduled} color="purple" />
                <StatCard icon={Target} label="Profile Score" value={`${stats.profileScore}%`} color="amber" />
              </>
            )}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-2xl font-bold">{profileCompletion}%</span>
                </div>
                <p className="text-sm font-medium text-white/90">Profile Complete</p>
                <Progress value={profileCompletion} className="h-2 mt-3 bg-white/20" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="space-y-8">
              {/* Social Links */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold">Connect</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {personalInfo.linkedin && (
                    <SocialLink icon={Linkedin} label="LinkedIn" url={personalInfo.linkedin} />
                  )}
                  {personalInfo.github && (
                    <SocialLink icon={Github} label="GitHub" url={personalInfo.github} />
                  )}
                  {personalInfo.website && (
                    <SocialLink icon={Globe} label="Website" url={personalInfo.website} />
                  )}
                  {!personalInfo.linkedin && !personalInfo.github && !personalInfo.website && (
                    <p className="text-sm text-slate-500 text-center py-4">No social links added</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {skills && skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-50 border-slate-200">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No skills added</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Experience */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Experience
                  </CardTitle>
                  {experience.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-medium">{experience.length} Positions</Badge>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  {experience && experience.length > 0 ? (
                    <div className="space-y-6">
                      {experience.map((exp) => (
                        <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                          <h4 className="font-semibold text-slate-900">{exp.position}</h4>
                          <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {exp.startDate} - {exp.endDate || (exp.current ? 'Present' : '')}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No experience added</p>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {education && education.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {education.map((edu) => (
                        <div key={edu.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                          <p className="text-sm text-blue-600 font-medium">{edu.institution}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {edu.startDate} - {edu.graduationYear || (edu.current ? 'Present' : '')}
                          </p>
                          {edu.gpa && (
                            <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-200">
                              GPA: {edu.gpa}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No education added</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CandidateLayout >
  )
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number | string;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg mb-4",
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
        <p className="text-sm text-slate-600 font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}

function SocialLink({ icon: Icon, label, url }: { icon: any; label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </a>
  );
}
