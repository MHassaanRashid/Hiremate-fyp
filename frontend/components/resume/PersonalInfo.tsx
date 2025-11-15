"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { User, Linkedin, Github, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PersonalInfo, ResumeStepProps } from "./types"
import { LocationSearch } from "./LocationSearch" // Adjust path as needed

interface PersonalInfoComponentProps extends Pick<ResumeStepProps, 'data' | 'errors' | 'onChange'> {
  onValidation?: (isValid: boolean) => void
}

export const PersonalInfoComponent = memo<PersonalInfoComponentProps>(({ 
  data, 
  errors = {}, 
  onChange,
  onValidation 
}) => {
  // Validation function
  const validateForm = useCallback(() => {
    const personalInfo = data.personalInfo
    const isValid = !!(
      personalInfo.fullName.trim() &&
      personalInfo.email.trim() &&
      personalInfo.phone.trim() &&
      personalInfo.location.trim()
    )
    
    onValidation?.(isValid)
    return isValid
  }, [data.personalInfo, onValidation])

  // Effect to run validation when data changes
  useEffect(() => {
    validateForm()
  }, [validateForm])

  const updatePersonalInfo = useCallback((field: keyof PersonalInfo, value: string) => {
    const updatedPersonalInfo = {
      ...data.personalInfo,
      [field]: value
    }
    onChange('personalInfo', updatedPersonalInfo)
  }, [data.personalInfo, onChange])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={data.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            placeholder="Enter your full name"
            className={`bg-blue-50/50 border-blue-200 ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.personalInfo.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            placeholder="your.email@example.com"
            className={`bg-blue-50/50 border-blue-200 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={data.personalInfo.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={`bg-blue-50/50 border-blue-200 ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        <div className="location-search-container">
          <Label htmlFor="location">Location *</Label>
          <LocationSearch
            value={data.personalInfo.location}
            onChange={(location) => updatePersonalInfo('location', location)}
            error={errors.location}
          />
        </div>
        
        <div>
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              id="linkedin"
              value={data.personalInfo.linkedin || ''}
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="bg-blue-50/50 border-blue-200 pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="github">GitHub Profile</Label>
          <div className="relative">
            <Github className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              id="github"
              value={data.personalInfo.github || ''}
              onChange={(e) => updatePersonalInfo('github', e.target.value)}
              placeholder="https://github.com/yourusername"
              className="bg-blue-50/50 border-blue-200 pl-10"
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="website">Personal Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              id="website"
              value={data.personalInfo.website || ''}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="bg-blue-50/50 border-blue-200 pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
})

PersonalInfoComponent.displayName = 'PersonalInfoComponent'