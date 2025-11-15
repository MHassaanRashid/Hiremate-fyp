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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resume builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-blue-200/50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-800">Resume Builder</h1>
              <p className="text-gray-600">Create your professional resume step by step</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {autoSaving && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-3 h-3 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                <span className="text-sm">Auto-saving...</span>
              </div>
            )}
            <span className="text-sm text-gray-600">
              Step {currentStep} of {STEPS.length}
            </span>
            <Progress value={(currentStep / STEPS.length) * 100} className="w-32" />
            <Button
              onClick={saveResumeData}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative z-10 bg-white/60 backdrop-blur-sm border-b border-blue-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              const isClickable = index === 0 || currentStep > index

              // Check if this step's section is completed via auto-save
              const sectionKey = getSectionKey(step.id)
              const isSectionCompleted = sectionKey ? sectionCompletions[sectionKey] : false

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${isClickable ? 'hover:scale-105' : 'cursor-not-allowed opacity-50'
                      }`}
                    onClick={() => isClickable && goToStep(step.id)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative ${isCompleted || isSectionCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                        isCurrent ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' :
                          'bg-gray-200 text-gray-500'
                      }`}>
                      {(isCompleted || isSectionCompleted) ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      {isSectionCompleted && !isCompleted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-medium ${isCompleted || isCurrent || isSectionCompleted ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                        {step.title}
                      </p>
                      {isSectionCompleted && !isCompleted && (
                        <div className="text-xs text-green-600 mt-1">✓ Saved</div>
                      )}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-4 transition-all duration-500 ${isCompleted || isSectionCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-xl">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {/* Show Save and Continue button on last step, otherwise show Save & Next button */}
          {currentStep === STEPS.length ? (
            <Button
              onClick={saveAndContinue}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save and Continue to Dashboard'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={currentStep === STEPS.length || saving || autoSaving}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-purple-700"
            >
              {autoSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}