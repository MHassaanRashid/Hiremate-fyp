// frontend/app/resume/page.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  CheckCircle, Award, User, GraduationCap, Briefcase, Code, Plus, X, Brain,
  ArrowRight, ArrowLeft, FileText, Star, MapPin, Phone, Mail, Calendar,
  Download, Eye, Edit3, Save, Sparkles, Target, Trophy, Book, Lightbulb,
  Globe, Linkedin, Github, ExternalLink, Trash2, Edit, ChevronDown, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveResume, getUserResume, saveResumeSection, getResumeSection } from "@/lib/api/resume"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

// Import the resume components
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
  PersonalInfo,
  Experience,
  Education,
  Project,
  Skill,
  Certificate
} from "@/components/resume"

// Milestone Steps
const STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Basic information about you' },
  { id: 2, title: 'Professional Summary', icon: FileText, description: 'Your career objective' },
  { id: 3, title: 'Experience', icon: Briefcase, description: 'Work history and achievements' },
  { id: 4, title: 'Education', icon: GraduationCap, description: 'Academic background' },
  { id: 5, title: 'Skills', icon: Code, description: 'Technical and soft skills' },
  { id: 6, title: 'Projects', icon: Lightbulb, description: 'Notable projects and work' },
  { id: 7, title: 'Certificates', icon: Award, description: 'Certifications and achievements' },
  { id: 8, title: 'Preview', icon: Eye, description: 'Review your resume' }
]

export default function ResumeBuilderPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create')
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

  // Ref to prevent duplicate API calls
  const isLoadingRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if section has meaningful data for completion
  const checkSectionCompletion = (section: string, data: any): boolean => {
    switch (section) {
      case 'personalInfo':
        return !!(data.fullName && data.email && data.phone && data.location)
      case 'education':
        return Array.isArray(data) && data.length > 0 && data[0]?.institution
      case 'experience':
        return Array.isArray(data) && data.length > 0 && data[0]?.company
      case 'skills':
        return Array.isArray(data) && data.length > 0
      case 'projects':
        return Array.isArray(data) && data.length > 0 && data[0]?.name
      case 'certificates':
        return Array.isArray(data) && data.length > 0 && data[0]?.name
      case 'languages':
        return Array.isArray(data) && data.length > 0
      default:
        return false
    }
  }

  // Check if resume is complete
  const isResumeComplete = useCallback((data: ResumeData): boolean => {
    const hasPersonalInfo = !!(data.personalInfo?.fullName && data.personalInfo?.email && data.personalInfo?.phone && data.personalInfo?.location && data.personalInfo?.summary)
    const hasExperience = Array.isArray(data.experience) && data.experience.length > 0
    const hasEducation = Array.isArray(data.education) && data.education.length > 0
    const hasSkills = Array.isArray(data.skills) && data.skills.length > 0

    return hasPersonalInfo && hasExperience && hasEducation && hasSkills
  }, [])

  // Load existing resume data
  useEffect(() => {
    const loadResumeData = async () => {
      // Prevent duplicate calls
      if (isLoadingRef.current || hasLoadedRef.current || !user) return

      try {
        isLoadingRef.current = true
        const token = localStorage.getItem("access_token")
        if (!token) {
          isLoadingRef.current = false
          return
        }

        try {
          // Try to load existing resume from API
          const response = await getUserResume(token)

          if (response.resume && response.resume.resumeData) {
            const apiData = response.resume.resumeData
            // Normalize API data to ensure all arrays/objects exist to match ResumeData type
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
            setMode('edit') // User has existing resume

            // Check completion status and mark sections
            const sections = ['personalInfo', 'experience', 'education', 'skills', 'projects', 'certificates']
            const completions: { [key: string]: boolean } = {}
            sections.forEach(section => {
              const sectionData = loadedData[section as keyof ResumeData]
              completions[section] = checkSectionCompletion(section, sectionData)
            })
            setSectionCompletions(completions)

            // If resume is complete, show preview. Otherwise, restore last step or default to step 1
            if (isResumeComplete(loadedData)) {
              setCurrentStep(8) // Show preview
              setMode('view')
            } else {
              // Restore last step from localStorage
              const savedStep = localStorage.getItem('resume_current_step')
              if (savedStep && !isNaN(Number(savedStep)) && Number(savedStep) >= 1 && Number(savedStep) <= 8) {
                setCurrentStep(Number(savedStep))
              }
            }
          } else {
            // No existing resume, populate with user info
            setResumeData(prev => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                fullName: user.full_name || '',
                email: user.email || ''
              }
            }))
            // Restore last step from localStorage
            const savedStep = localStorage.getItem('resume_current_step')
            if (savedStep && !isNaN(Number(savedStep)) && Number(savedStep) >= 1 && Number(savedStep) <= 8) {
              setCurrentStep(Number(savedStep))
            }
          }
          hasLoadedRef.current = true
        } catch (error: any) {
          // Check if it's a session expiration error
          if (error.message && error.message.includes('Session expired')) {
            // Session expired - will be handled by handleResponse, just return
            isLoadingRef.current = false
            return
          }
          // Populate with user info for new resume
          setResumeData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: user.full_name || '',
              email: user.email || ''
            }
          }))
          // Restore last step from localStorage
          const savedStep = localStorage.getItem('resume_current_step')
          if (savedStep && !isNaN(Number(savedStep)) && Number(savedStep) >= 1 && Number(savedStep) <= 8) {
            setCurrentStep(Number(savedStep))
          }
          hasLoadedRef.current = true
        }
      } catch (error: any) {
        // Check if it's a session expiration error
        if (error.message && error.message.includes('Session expired')) {
          // Session expired - will be handled by handleResponse, just return
          isLoadingRef.current = false
          return
        }
        toast.error('Failed to load resume data')
      } finally {
        setLoading(false)
        isLoadingRef.current = false
      }
    }

    loadResumeData()
  }, [user, isResumeComplete])

  // Save current step to localStorage
  useEffect(() => {
    if (currentStep && !loading) {
      localStorage.setItem('resume_current_step', currentStep.toString())
    }
  }, [currentStep, loading])

  // Navigation handlers with validation
  const nextStep = async () => {
    if (validateCurrentStep() && currentStep < STEPS.length) {
      // Save current section before moving to next
      const currentSectionKey = getSectionKey(currentStep)
      if (currentSectionKey) {
        await saveSection(currentSectionKey, resumeData[currentSectionKey as keyof ResumeData])
      }
      const nextStepNum = currentStep + 1
      setCurrentStep(nextStepNum)
      localStorage.setItem('resume_current_step', nextStepNum.toString())
    } else if (!validateCurrentStep()) {
      toast.error('Please fill in all required fields')
    }
  }

  // Get section key for current step
  const getSectionKey = (step: number): string | null => {
    const sectionMap: { [key: number]: string } = {
      1: 'personalInfo',
      2: 'personalInfo', // Summary is part of personalInfo
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
      const prevStepNum = currentStep - 1
      setCurrentStep(prevStepNum)
      localStorage.setItem('resume_current_step', prevStepNum.toString())
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    localStorage.setItem('resume_current_step', step.toString())
  }

  // Save resume data
  const saveResumeData = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        toast.error('Please login to save your resume')
        return
      }

      // Prepare data for saving - map to database schema
      const saveData = {
        full_name: resumeData.personalInfo.fullName,
        email: resumeData.personalInfo.email,
        phone: resumeData.personalInfo.phone,
        location: resumeData.personalInfo.location,
        website: resumeData.personalInfo.website,
        linkedin: resumeData.personalInfo.linkedin,
        github: resumeData.personalInfo.github,
        summary: resumeData.personalInfo.summary,
        education: resumeData.education,
        experience: resumeData.experience,
        skills: resumeData.skills,
        projects: resumeData.projects,
        certificates: resumeData.certificates,
        resume_uploaded: true
      }

      await saveResume(token, resumeData)

      toast.success('Resume saved successfully!')
      setMode('edit') // Switch to edit mode after first save
    } catch (error: any) {
      toast.error(error.message || 'Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Save and continue to dashboard - final comprehensive save
  const saveAndContinue = async () => {
    try {
      setSaving(true)

      const token = localStorage.getItem("access_token")
      if (!token) {
        toast.error('Please login to save your resume')
        return
      }

      // Final comprehensive save - ensure all sections are saved
      const finalResumeData = {
        resumeData: {
          personalInfo: resumeData.personalInfo,
          education: resumeData.education,
          experience: resumeData.experience,
          skills: resumeData.skills,
          projects: resumeData.projects,
          certificates: resumeData.certificates,

        }
      }

      await saveResume(token, resumeData)

      toast.success('🎉 Resume saved successfully! Redirecting to dashboard...')

      // Small delay to show success message
      setTimeout(() => {
        router.push('/candidate')
      }, 1500)

    } catch (error: any) {
      toast.error(error.message || 'Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Auto-save section when data changes (explicit save)
  const saveSection = async (section: string, data: any) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      setAutoSaving(true)
      await saveResumeSection(token, section, data)

      // Mark section as completed if it has meaningful data
      const isCompleted = checkSectionCompletion(section, data)
      setSectionCompletions(prev => ({ ...prev, [section]: isCompleted }))

      // Check if resume is now complete
      const updatedData = { ...resumeData, [section]: data }
      if (isResumeComplete(updatedData as ResumeData) && currentStep < 8) {
        // Don't auto-navigate, but user can manually go to preview
      }
    } catch (error: any) {
      console.error(`Error saving ${section}:`, error)
      toast.error(`Failed to save ${section}`)
    } finally {
      setAutoSaving(false)
    }
  }

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])


  // Helper function to update resume data with auto-save
  const updateResumeData = useCallback((section: keyof ResumeData, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }))

    // Debounced auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      const token = localStorage.getItem("access_token")
      if (!token) return

      try {
        setAutoSaving(true)
        await saveResumeSection(token, section as string, data)

        // Mark section as completed if it has meaningful data
        const isCompleted = checkSectionCompletion(section as string, data)
        setSectionCompletions(prev => ({ ...prev, [section]: isCompleted }))
      } catch (error: any) {
        console.error(`Error auto-saving ${section}:`, error)
        // Don't show toast for auto-save errors to avoid spam
      } finally {
        setAutoSaving(false)
      }
    }, 1500) // Wait 1.5 seconds after user stops typing
  }, [])

  // Get section title for notifications
  const getSectionTitle = (section: string): string => {
    const titles = {
      personalInfo: 'Personal Information',
      education: 'Education',
      experience: 'Experience',
      skills: 'Skills',
      projects: 'Projects',
      certificates: 'Certificates',
      languages: 'Languages'
    }
    return titles[section as keyof typeof titles] || section
  }

  // Generate unique ID for new items
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Validation function
  const validateCurrentStep = () => {
    const newErrors: { [key: string]: string } = {}

    switch (currentStep) {
      case 1: // Personal Info
        if (!resumeData.personalInfo.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!resumeData.personalInfo.email.trim()) newErrors.email = 'Email is required'
        if (!resumeData.personalInfo.phone.trim()) newErrors.phone = 'Phone is required'
        if (!resumeData.personalInfo.location.trim()) newErrors.location = 'Location is required'
        break
      case 2: // Summary
        if (!resumeData.personalInfo.summary.trim()) newErrors.summary = 'Professional summary is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const renderCurrentStep = () => {
    const currentSectionKey = getSectionKey(currentStep);

    switch (currentStep) {
      case 1: // Personal Info
        return (
          <PersonalInfoComponent
            data={resumeData}
            errors={errors}
            onChange={updateResumeData}
          />
        );

      case 2: // Professional Summary
        return (
          <ProfessionalSummaryComponent
            data={resumeData}
            errors={errors}
            onChange={updateResumeData}
          />
        );

      case 3: // Experience
        return (
          <ExperienceComponent
            data={resumeData}
            errors={errors}
            onChange={updateResumeData}
          />
        );

      case 4: // Education
        return (
          <EducationComponent
            data={resumeData}
            errors={errors}
            onChange={updateResumeData}
          />
        );

      case 5: // Skills
        return (
          <SkillsComponent
            data={resumeData}
            errors={errors}
            onChange={updateResumeData}
          />
        );

      case 6: // Projects
        return (
          <ProjectsComponent
            data={resumeData}
            errors={errors}
            onChange={updateResumeData}
          />
        );

      case 7: // Certificates
        return (
          <CertificatesComponent
            data={resumeData}
            errors={errors}
            onChange={updateResumeData}
          />
        );

      case 8: // Preview
        return (
          <ResumePreviewComponent
            data={resumeData}
            onFinalSave={saveAndContinue}
            isLoading={saving}
            completedSections={sectionCompletions}
          />
        );

      default:
        return <div>Step not found</div>;
    }
  };


  // Render content or loader
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 min-w-0 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-t-4 border-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading your resume data...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 min-w-0">
        <Card className="bg-card border-border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <CardHeader className="bg-muted/30 border-b border-border py-4 px-6 md:px-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
                {(() => {
                  const StepIcon = STEPS[currentStep - 1]?.icon || FileText
                  return <StepIcon className="w-5 h-5 text-primary" />
                })()}
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{STEPS[currentStep - 1]?.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1]?.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 flex-1">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {renderCurrentStep()}
            </div>
          </CardContent>

          {/* Footer / Navigation */}
          <div className="bg-muted/30 border-t border-border p-4 md:p-6 flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                onClick={saveAndContinue}
                disabled={saving}
                className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Finish & Go to Dashboard'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={currentStep === STEPS.length || saving || autoSaving}
                className="gap-2 shadow-sm"
              >
                {autoSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm px-6 py-4 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="ml-4 hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">Resume Builder</h1>
              <p className="text-sm text-muted-foreground">Create your professional resume</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            {autoSaving && (
              <div className="flex items-center space-x-2 text-primary/80 hidden sm:flex">
                <div className="w-3.5 h-3.5 border-2 border-primary/50 rounded-full animate-spin border-t-transparent"></div>
                <span className="text-xs font-medium">Auto-saving...</span>
              </div>
            )}

            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-foreground">
                Step {currentStep} of {STEPS.length}
              </span>
              <Progress value={(currentStep / STEPS.length) * 100} className="w-24 h-1.5 mt-1" />
            </div>

            <Button
              onClick={saveResumeData}
              disabled={saving}
              variant="outline"
              size="sm"
              className="hidden md:flex gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>

            <div className="h-6 w-px bg-border hidden md:block" />

            <Button
              onClick={() => router.push('/candidate')}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <span className="hidden sm:inline">Back to Dashboard</span>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row gap-8 relative z-10">

        {/* Sidebar Steps (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0 space-y-2 sticky top-24 self-start">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            const isClickable = index === 0 || currentStep > index
            const sectionKey = getSectionKey(step.id)
            const isSectionCompleted = sectionKey ? sectionCompletions[sectionKey] : false

            return (
              <div
                key={step.id}
                onClick={() => isClickable && goToStep(step.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border",
                  isCurrent
                    ? "bg-card border-primary ring-1 ring-primary shadow-sm"
                    : "border-transparent hover:bg-black/5 dark:hover:bg-white/5",
                  !isClickable && "opacity-50 cursor-not-allowed",
                  isClickable && !isCurrent && "cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm",
                  isCurrent ? "bg-primary text-primary-foreground" :
                    (isCompleted || isSectionCompleted) ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {(isCompleted || isSectionCompleted) && !isCurrent ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", isCurrent ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
                  {isCurrent && <p className="text-[10px] text-primary font-medium">Editing now</p>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Steps Indicator */}
        <div className="md:hidden sticky top-[72px] z-10 bg-background/95 backdrop-blur border-b border-border -mx-4 px-4 py-3 overflow-x-auto scrollbar-hide flex gap-3 shadow-sm">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isCurrent = currentStep === step.id
            const isClickable = index === 0 || currentStep > index
            const isCompleted = currentStep > step.id

            return (
              <div
                key={step.id}
                onClick={() => isClickable && goToStep(step.id)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[64px] transition-all",
                  !isClickable && "opacity-40"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-all ring-offset-2 ring-offset-background",
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-2 ring-primary scale-110"
                    : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium text-center whitespace-nowrap",
                  isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Main Content Area */}
        {renderContent()}
      </div>
    </div>
  )
}