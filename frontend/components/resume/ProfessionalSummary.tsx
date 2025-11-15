"use client"

import { useCallback, useEffect, memo } from "react"
import { FileText } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResumeStepProps } from "./types"

interface ProfessionalSummaryProps extends Pick<ResumeStepProps, 'data' | 'errors' | 'onChange'> {
  onValidation?: (isValid: boolean) => void
}

export const ProfessionalSummaryComponent = memo<ProfessionalSummaryProps>(({ 
  data, 
  errors = {}, 
  onChange,
  onValidation 
}) => {
  // Validation function
  const validateForm = useCallback(() => {
    const isValid = !!(data.personalInfo.summary.trim())
    onValidation?.(isValid)
    return isValid
  }, [data.personalInfo.summary, onValidation])

  // Effect to run validation when data changes
  useEffect(() => {
    validateForm()
  }, [validateForm])

  const updateSummary = useCallback((value: string) => {
    const updatedPersonalInfo = {
      ...data.personalInfo,
      summary: value
    }
    onChange('personalInfo', updatedPersonalInfo)
  }, [data.personalInfo, onChange])

  const summaryLength = data.personalInfo.summary.length
  const maxLength = 500
  const isNearLimit = summaryLength > maxLength * 0.8

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Professional Summary</h2>
        <p className="text-gray-600">Write a compelling summary that showcases your expertise</p>
      </div>
      
      <div>
        <Label htmlFor="summary">Professional Summary *</Label>
        <Textarea
          id="summary"
          value={data.personalInfo.summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="Write 3-4 sentences about your professional background, key skills, and career objectives. Highlight your unique value proposition and what makes you stand out in your field..."
          rows={6}
          className={`bg-blue-50/50 border-blue-200 resize-none transition-colors ${
            errors.summary ? 'border-red-500' : 
            isNearLimit ? 'border-yellow-400' : ''
          }`}
          maxLength={maxLength}
        />
        
        {errors.summary && (
          <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">
            💡 <strong>Tips:</strong> Focus on your unique value proposition and quantifiable achievements
          </div>
          <div className={`text-sm ${
            summaryLength > maxLength ? 'text-red-500' : 
            isNearLimit ? 'text-yellow-600' : 'text-gray-400'
          }`}>
            {summaryLength}/{maxLength} characters
          </div>
        </div>
        
        {/* Writing tips */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-800 mb-2">✨ Writing Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Start with your current role and years of experience</li>
            <li>• Mention 2-3 key skills or areas of expertise</li>
            <li>• Include a notable achievement or quantifiable result</li>
            <li>• End with your career objective or what you're seeking</li>
          </ul>
        </div>
        
        {/* Character count progress */}
        {summaryLength > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round((summaryLength / maxLength) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  summaryLength > maxLength ? 'bg-red-500' :
                  isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((summaryLength / maxLength) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ProfessionalSummaryComponent.displayName = 'ProfessionalSummaryComponent'
