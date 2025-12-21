"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  CheckCircle, Award, User, GraduationCap, Briefcase, Code,
  ArrowRight, ArrowLeft, FileText, Save, Target, Lightbulb,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { saveResume, getUserResume, saveResumeSection } from "@/lib/api/resume"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import CandidateLayout from "@/layouts/CandidateLayout"

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
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Summary', icon: Target },
  { id: 3, title: 'Experience', icon: Briefcase },
  { id: 4, title: 'Education', icon: GraduationCap },
  { id: 5, title: 'Skills', icon: Code },
  { id: 6, title: 'Projects', icon: Lightbulb },
  { id: 7, title: 'Certificates', icon: Award },
  { id: 8, title: 'Preview', icon: FileText }
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
      toast.success('Resume saved successfully!')
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
      toast.success('Resume saved successfully!')
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
    } catch (error: any) {
      console.error(`Error saving ${section}:`, error)
    } finally {
      setAutoSaving(false)
    }
  }

  const updateResumeData = useCallback((section: keyof ResumeData, data: any) => {
    setResumeData(prev => ({ ...prev, [section]: data }))
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const token = localStorage.getItem("access_token")
      if (!token) return
      try {
        setAutoSaving(true)
        await saveResumeSection(token, section as string, data)
        const isCompleted = checkSectionCompletion(section as string, data)
        setSectionCompletions(prev => ({ ...prev, [section]: isCompleted }))
      } catch (error: any) {
        console.error(`Error auto-saving ${section}:`, error)
      } finally {
        setAutoSaving(false)
      }
    }, 1500)
  }, [])

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      </CandidateLayout>
    )
  }

  const completedSteps = Object.values(sectionCompletions).filter(Boolean).length
  const progressPercentage = Math.round((completedSteps / 6) * 100)

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Resume Builder
              </h1>
              <p className="text-slate-600 text-lg">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {autoSaving && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </div>
              )}
              <Button
                onClick={saveResumeDataHandler}
                disabled={saving}
                variant="outline"
                className="border-slate-200"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Progress */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                    <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = currentStep > step.id || (getSectionKey(step.id) && sectionCompletions[getSectionKey(step.id)!])
                  const isCurrent = currentStep === step.id

                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        onClick={() => setCurrentStep(step.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[100px]",
                          isCurrent ? "bg-blue-600 text-white" : isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isCurrent ? "bg-blue-700" : isCompleted ? "bg-emerald-100" : "bg-slate-100"
                        )}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className="text-xs font-medium">{step.title}</span>
                      </button>
                      {index < STEPS.length - 1 && (
                        <div className={cn(
                          "h-0.5 w-4 mx-1",
                          isCompleted ? "bg-emerald-500" : "bg-slate-200"
                        )} />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Form Content */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              {switchResult(currentStep, resumeData, errors, updateResumeData, saving, saveAndContinue, sectionCompletions)}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                onClick={saveAndContinue}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30"
              >
                {saving ? 'Saving...' : 'Save & Continue to Dashboard'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={saving || autoSaving}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30"
              >
                Save & Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </CandidateLayout >
  )
}

function switchResult(step: number, data: any, errors: any, onChange: any, saving: boolean, onFinalSave: any, completions: any) {
  switch (step) {
    case 1: return <PersonalInfoComponent data={data} errors={errors} onChange={onChange} />
    case 2: return <ProfessionalSummaryComponent data={data} errors={errors} onChange={onChange} />
    case 3: return <ExperienceComponent data={data} errors={errors} onChange={onChange} />
    case 4: return <EducationComponent data={data} errors={errors} onChange={onChange} />
    case 5: return <SkillsComponent data={data} errors={errors} onChange={onChange} />
    case 6: return <ProjectsComponent data={data} errors={errors} onChange={onChange} />
    case 7: return <CertificatesComponent data={data} errors={errors} onChange={onChange} />
    case 8: return <ResumePreviewComponent data={data} onFinalSave={onFinalSave} isLoading={saving} completedSections={completions} />
    default: return <div>Step not found</div>
  }
}