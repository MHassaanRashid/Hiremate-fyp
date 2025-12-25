"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  CheckCircle, Award, User, GraduationCap, Briefcase, Code,
  ArrowRight, ArrowLeft, FileText, Save, Target, Lightbulb,
  Loader2, Sparkles, Eye, Home, BarChart3, Zap, TrendingUp,
  Clock, Download, Share2, Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { saveResume, getUserResume, saveResumeSection } from "@/lib/api/resume"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import CandidateLayout from "@/layouts/CandidateLayout"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

import {
  PersonalInfoComponent,
  ProfessionalSummaryComponent,
  ExperienceComponent,
  EducationComponent,
  SkillsComponent,
  ProjectsComponent,
  CertificatesComponent,
  ResumePreviewComponent,
  ResumeData,
} from "@/components/resume"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    id: 1,
    title: 'Personal Info',
    icon: User,
    description: 'Your contact details',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 2,
    title: 'Summary',
    icon: Target,
    description: 'Professional overview',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: 3,
    title: 'Experience',
    icon: Briefcase,
    description: 'Work history',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  {
    id: 4,
    title: 'Education',
    icon: GraduationCap,
    description: 'Academic background',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  },
  {
    id: 5,
    title: 'Skills',
    icon: Code,
    description: 'Your expertise',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700'
  },
  {
    id: 6,
    title: 'Projects',
    icon: Lightbulb,
    description: 'Notable work',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700'
  },
  {
    id: 7,
    title: 'Certificates',
    icon: Award,
    description: 'Achievements',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700'
  },
  {
    id: 8,
    title: 'Preview',
    icon: Eye,
    description: 'Final review',
    color: 'from-slate-700 to-slate-900',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700'
  }
]

export default function ResumeBuilderPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sectionCompletions, setSectionCompletions] = useState<{ [key: string]: boolean }>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: ''
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certificates: [],
  })

  const isLoadingRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const checkSectionCompletion = (section: string, data: any): boolean => {
    switch (section) {
      case 'personalInfo':
        return !!(data.fullName && data.email && data.phone && data.location)
      case 'education':
      case 'experience':
      case 'projects':
      case 'certificates':
        return Array.isArray(data) && data.length > 0
      case 'skills':
        return Array.isArray(data) && data.length > 0
      default:
        return false
    }
  }

  const isResumeComplete = useCallback((data: ResumeData): boolean => {
    const hasPersonalInfo = !!(data.personalInfo?.fullName && data.personalInfo?.email && data.personalInfo?.phone && data.personalInfo?.location && data.personalInfo?.summary)
    const hasExperience = Array.isArray(data.experience) && data.experience.length > 0
    const hasEducation = Array.isArray(data.education) && data.education.length > 0
    const hasSkills = Array.isArray(data.skills) && data.skills.length > 0
    return hasPersonalInfo && hasExperience && hasEducation && hasSkills
  }, [])

  useEffect(() => {
    const loadResumeData = async () => {
      if (isLoadingRef.current || hasLoadedRef.current || !user) return

      try {
        isLoadingRef.current = true
        const token = localStorage.getItem("access_token")
        if (!token) {
          isLoadingRef.current = false
          return
        }

        try {
          const response = await getUserResume(token)

          if (response.resume && response.resume.resumeData) {
            const apiData = response.resume.resumeData
            const loadedData: ResumeData = {
              personalInfo: {
                fullName: apiData.personalInfo?.fullName || '',
                email: apiData.personalInfo?.email || '',
                phone: apiData.personalInfo?.phone || '',
                location: apiData.personalInfo?.location || '',
                website: apiData.personalInfo?.website || '',
                linkedin: apiData.personalInfo?.linkedin || '',
                github: apiData.personalInfo?.github || '',
                summary: apiData.personalInfo?.summary || '',
              },
              education: Array.isArray(apiData.education) ? apiData.education : [],
              experience: Array.isArray(apiData.experience) ? apiData.experience : [],
              projects: Array.isArray(apiData.projects) ? apiData.projects : [],
              skills: Array.isArray(apiData.skills) ? apiData.skills : [],
              certificates: Array.isArray(apiData.certificates) ? apiData.certificates : [],
            }
            setResumeData(loadedData)

            const sections = ['personalInfo', 'experience', 'education', 'skills', 'projects', 'certificates']
            const completions: { [key: string]: boolean } = {}
            sections.forEach(section => {
              const sectionData = loadedData[section as keyof ResumeData]
              completions[section] = checkSectionCompletion(section, sectionData)
            })
            setSectionCompletions(completions)

            if (isResumeComplete(loadedData)) {
              setCurrentStep(8)
            }
          } else {
            setResumeData(prev => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                fullName: user.full_name || '',
                email: user.email || ''
              }
            }))
          }
          hasLoadedRef.current = true
        } catch (error: any) {
          setResumeData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: user.full_name || '',
              email: user.email || ''
            }
          }))
          hasLoadedRef.current = true
        }
      } catch (error: any) {
        toast.error('Failed to load resume data')
      } finally {
        setLoading(false)
        isLoadingRef.current = false
      }
    }

    loadResumeData()
  }, [user, isResumeComplete])

  const nextStep = async () => {
    if (validateCurrentStep() && currentStep < STEPS.length) {
      const currentSectionKey = getSectionKey(currentStep)
      if (currentSectionKey) {
        await saveSection(currentSectionKey, resumeData[currentSectionKey as keyof ResumeData])
      }
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (!validateCurrentStep()) {
      toast.error('Please fill in all required fields')
    }
  }

  const getSectionKey = (step: number): string | null => {
    const sectionMap: { [key: number]: string } = {
      1: 'personalInfo',
      2: 'personalInfo',
      3: 'experience',
      4: 'education',
      5: 'skills',
      6: 'projects',
      7: 'certificates'
    }
    return sectionMap[step] || null
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const saveResumeDataHandler = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        toast.error('Please login to save your resume')
        return
      }
      await saveResume(token, resumeData)
      setLastSaved(new Date())
      toast.success('✓ Resume saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resume.')
    } finally {
      setSaving(false)
    }
  }

  const saveAndContinue = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("access_token")
      if (!token) {
        toast.error('Please login to save your resume')
        return
      }
      await saveResume(token, resumeData)
      toast.success('✓ Resume saved successfully!')
      setTimeout(() => { router.push('/candidate') }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resume.')
    } finally {
      setSaving(false)
    }
  }

  const saveSection = async (section: string, data: any) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return
      setAutoSaving(true)
      await saveResumeSection(token, section, data)
      const isCompleted = checkSectionCompletion(section, data)
      setSectionCompletions(prev => ({ ...prev, [section]: isCompleted }))
      setLastSaved(new Date())
    } catch (error: any) {
      console.error(`Error saving ${section}:`, error)
    } finally {
      setAutoSaving(false)
    }
  }

  const updateResumeData = useCallback((section: keyof ResumeData, data: any) => {
    console.log('updateResumeData called:', { section, data, currentData: resumeData[section] })
    setResumeData(prev => {
      const updated = { ...prev, [section]: data }
      console.log('Updated resume data:', updated)
      return updated
    })
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const token = localStorage.getItem("access_token")
      if (!token) return
      try {
        setAutoSaving(true)
        await saveResumeSection(token, section as string, data)
        const isCompleted = checkSectionCompletion(section as string, data)
        setSectionCompletions(prev => ({ ...prev, [section]: isCompleted }))
        setLastSaved(new Date())
      } catch (error: any) {
        console.error(`Error auto-saving ${section}:`, error)
      } finally {
        setAutoSaving(false)
      }
    }, 1500)
  }, [resumeData])

  const validateCurrentStep = () => {
    const newErrors: { [key: string]: string } = {}
    switch (currentStep) {
      case 1:
        if (!resumeData.personalInfo.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!resumeData.personalInfo.email.trim()) newErrors.email = 'Email is required'
        if (!resumeData.personalInfo.phone.trim()) newErrors.phone = 'Phone is required'
        if (!resumeData.personalInfo.location.trim()) newErrors.location = 'Location is required'
        break
      case 2:
        if (!resumeData.personalInfo.summary.trim()) newErrors.summary = 'Professional summary is required'
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  if (loading) {
    return (
      <CandidateLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative">
          <div className="absolute inset-0 z-0">
            <AnimatedBackground />
          </div>

          {/* Top Bar Skeleton */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                    <div>
                      <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="h-9 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 relative z-10">
            {/* Progress Section Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-200 p-4 animate-pulse">
                <div className="h-6 w-48 bg-slate-300 rounded mb-2"></div>
                <div className="h-4 w-32 bg-slate-300 rounded"></div>
              </div>
              <div className="p-4">
                <div className="h-2 bg-slate-200 rounded-full mb-4 animate-pulse"></div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Content Skeleton */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8 md:p-10 space-y-6">
                <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Skeleton */}
            <div className="flex items-center justify-between gap-4 pb-8">
              <div className="h-12 w-32 bg-slate-200 rounded-2xl animate-pulse"></div>
              <div className="h-12 w-32 bg-slate-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  const completedSteps = Object.values(sectionCompletions).filter(Boolean).length
  const progressPercentage = Math.round((completedSteps / 6) * 100)
  const currentStepData = STEPS[currentStep - 1]

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative">
        <div className="absolute inset-0 z-0">
          <AnimatedBackground />
        </div>
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/candidate">
                  <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all hover:scale-105">
                    <Home className="w-5 h-5 text-slate-600" />
                  </button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-gradient-to-br ${currentStepData.color} rounded-xl shadow-lg`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                      Resume Builder
                    </h1>
                    <p className="text-xs text-slate-500">
                      {lastSaved && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last saved {new Date(lastSaved).toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {autoSaving && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </div>
                )}
                <Link href="/candidate/resume/analyze">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">AI Analyze</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 relative z-10">
          {/* Minimalistic Progress Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Compact Header */}
            <div className={`bg-gradient-to-r ${currentStepData.color} p-4`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <currentStepData.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{currentStepData.title}</h2>
                    <p className="text-white/90 text-xs">{currentStepData.description}</p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Step {currentStep}/{STEPS.length}
                </Badge>
              </div>
            </div>

            {/* Compact Progress Bar */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {progressPercentage}%
                </span>
              </div>

              {/* Simple Progress Bar */}
              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-2 mb-4 text-center">
                {completedSteps} of 6 sections completed
              </p>

              {/* Compact Step Navigation */}
              <div className="flex items-center gap-2 flex-wrap justify-center pt-3 border-t border-slate-200">
                {STEPS.map((step) => {
                  const Icon = step.icon
                  const isCompleted = currentStep > step.id || (getSectionKey(step.id) && sectionCompletions[getSectionKey(step.id)!])
                  const isCurrent = currentStep === step.id

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        isCurrent
                          ? `bg-gradient-to-r ${step.color} text-white shadow-md`
                          : isCompleted
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {isCompleted && !isCurrent ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{step.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 md:p-10">
              {switchResult(currentStep, resumeData, errors, updateResumeData, saving, saveAndContinue, sectionCompletions)}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pb-8">
            <Button
              size="lg"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 px-8 py-6 text-base font-semibold rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                size="lg"
                onClick={saveAndContinue}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-2xl shadow-emerald-600/40 px-10 py-6 text-base font-bold rounded-2xl hover:scale-105 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete & Save
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={nextStep}
                disabled={saving || autoSaving}
                className={`bg-gradient-to-r ${currentStepData.color} hover:opacity-90 shadow-2xl px-10 py-6 text-base font-bold rounded-2xl hover:scale-105 transition-all`}
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </CandidateLayout>
  )
}

function switchResult(step: number, data: ResumeData, errors: any, onChange: (section: keyof ResumeData, value: any) => void, saving: boolean, onFinalSave: any, completions: any) {
  // PersonalInfo and ProfessionalSummary components call onChange('personalInfo', fullObject)
  // Other components call onChange(section, array)

  switch (step) {
    case 1:
      return <PersonalInfoComponent
        data={data}
        errors={errors}
        onChange={onChange}
      />
    case 2:
      return <ProfessionalSummaryComponent
        data={data}
        errors={errors}
        onChange={onChange}
      />
    case 3:
      return <ExperienceComponent
        data={data}
        errors={errors}
        onChange={onChange}
      />
    case 4:
      return <EducationComponent
        data={data}
        errors={errors}
        onChange={onChange}
      />
    case 5:
      return <SkillsComponent
        data={data}
        errors={errors}
        onChange={onChange}
      />
    case 6:
      return <ProjectsComponent
        data={data}
        errors={errors}
        onChange={onChange}
      />
    case 7:
      return <CertificatesComponent
        data={data}
        errors={errors}
        onChange={onChange}
      />
    case 8:
      return <ResumePreviewComponent
        data={data}
        onFinalSave={onFinalSave}
        isLoading={saving}
        completedSections={completions}
      />
    default:
      return <div>Step not found</div>
  }
}