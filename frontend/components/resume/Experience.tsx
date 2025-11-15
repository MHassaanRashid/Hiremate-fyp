"use client"

import { useState, useCallback, useEffect, memo } from "react"
import { 
  Briefcase, Plus, Edit, Trash2, Calendar, MapPin, 
  Building, User, DollarSign, Clock, CheckCircle, X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Experience, ResumeStepProps, EMPLOYMENT_TYPES } from "./types"
import { LocationSearch } from "../resume/LocationSearch"

interface ExperienceComponentProps extends Pick<ResumeStepProps, 'data' | 'errors' | 'onChange'> {
  onValidation?: (isValid: boolean) => void
}

interface ExperienceFormData extends Omit<Experience, 'id'> {}

export const ExperienceComponent = memo<ExperienceComponentProps>(({ 
  data, 
  errors = {}, 
  onChange,
  onValidation 
}) => {
  const [isAddingExperience, setIsAddingExperience] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    description: '',
    achievements: [],
    employmentType: 'full-time' as const,
    salary: ''
  })
  const [newAchievement, setNewAchievement] = useState('')

  // Generate unique ID for new items
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Validation function
  const validateForm = useCallback(() => {
    const hasExperience = data.experience.length > 0
    onValidation?.(hasExperience)
    return hasExperience
  }, [data.experience.length, onValidation])

  // Effect to run validation when data changes
  useEffect(() => {
    validateForm()
  }, [validateForm])

  const resetForm = useCallback(() => {
    setFormData({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: '',
      achievements: [],
      employmentType: 'full-time',
      salary: ''
    })
    setNewAchievement('')
  }, [])

  const handleAddExperience = useCallback(() => {
    setIsAddingExperience(true)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleEditExperience = useCallback((experience: Experience) => {
    setFormData({
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate,
      current: experience.current,
      location: experience.location,
      description: experience.description,
      achievements: [...experience.achievements],
      employmentType: experience.employmentType || 'full-time',
      salary: experience.salary || ''
    })
    setEditingId(experience.id)
    setIsAddingExperience(true)
  }, [])

  const handleDeleteExperience = useCallback((id: string) => {
    const updatedExperience = data.experience.filter(exp => exp.id !== id)
    onChange('experience', updatedExperience)
  }, [data.experience, onChange])

  const handleSaveExperience = useCallback(() => {
    // Validation
    if (!formData.company.trim() || !formData.position.trim() || !formData.startDate) {
      return
    }

    const experienceData: Experience = {
      ...formData,
      id: editingId || generateId(),
      endDate: formData.current ? '' : formData.endDate
    }

    let updatedExperience: Experience[]
    if (editingId) {
      updatedExperience = data.experience.map(exp => 
        exp.id === editingId ? experienceData : exp
      )
    } else {
      updatedExperience = [...data.experience, experienceData]
    }

    // Sort by start date (most recent first)
    updatedExperience.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

    onChange('experience', updatedExperience)
    setIsAddingExperience(false)
    setEditingId(null)
    resetForm()
  }, [formData, editingId, data.experience, onChange, resetForm])

  const handleCancelEdit = useCallback(() => {
    setIsAddingExperience(false)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleFormChange = useCallback((field: keyof ExperienceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleCurrentToggle = useCallback((checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      current: checked,
      endDate: checked ? '' : prev.endDate
    }))
  }, [])

  const addAchievement = useCallback(() => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }))
      setNewAchievement('')
    }
  }, [newAchievement])

  const removeAchievement = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }))
  }, [])

  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
    
    if (current) {
      return `${start} - Present`
    }
    
    if (!endDate) {
      return start
    }
    
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
    
    return `${start} - ${end}`
  }

  const calculateDuration = (startDate: string, endDate: string, current: boolean) => {
    const start = new Date(startDate)
    const end = current ? new Date() : new Date(endDate || new Date())
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
    
    const years = Math.floor(diffMonths / 12)
    const months = diffMonths % 12
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`
    } else {
      return `${years}y ${months}m`
    }
  }

  const isFormValid = formData.company.trim() && formData.position.trim() && formData.startDate

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Work Experience</h2>
        <p className="text-gray-600">Add your professional experience and achievements</p>
      </div>

      {/* Add Experience Button */}
      {!isAddingExperience && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAddExperience}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>
      )}

      {/* Experience Form */}
      {isAddingExperience && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              {editingId ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {editingId ? 'Edit Experience' : 'Add New Experience'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                    placeholder="Enter company name"
                    className="pl-10 bg-blue-50/50"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="position">Job Title *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleFormChange('position', e.target.value)}
                    placeholder="Enter job title"
                    className="pl-10 bg-blue-50/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select 
                  value={formData.employmentType} 
                  onValueChange={(value: any) => handleFormChange('employmentType', value)}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <LocationSearch
                    value={formData.location}
                    onChange={(val) => handleFormChange("location", val)}
                    error={errors.location}
                  />
                </div>



              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="pl-10 bg-blue-50/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    disabled={formData.current}
                    className="pl-10 bg-blue-50/50"
                  />
                </div>
                <div className="flex items-center mt-2">
                  <Checkbox 
                    id="current"
                    checked={formData.current}
                    onCheckedChange={handleCurrentToggle}
                  />
                  <Label htmlFor="current" className="ml-2 text-sm">
                    I currently work here
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="salary">Salary (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => handleFormChange('salary', e.target.value)}
                    placeholder="e.g., $80,000 or $40/hour"
                    className="pl-10 bg-blue-50/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Briefly describe your role and responsibilities..."
                rows={3}
                className="bg-blue-50/50 resize-none"
              />
            </div>

            {/* Achievements */}
            <div>
              <Label>Key Achievements</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add an achievement or accomplishment..."
                  className="bg-blue-50/50"
                  onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                />
                <Button 
                  type="button" 
                  onClick={addAchievement}
                  disabled={!newAchievement.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.achievements.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm text-gray-700 flex-1">{achievement}</span>
                      <Button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveExperience}
                disabled={!isFormValid}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Experience
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience List */}
      {data.experience.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
            Your Experience ({data.experience.length})
          </h3>
          
          {data.experience.map((experience, index) => (
            <Card key={experience.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {experience.position}
                    </h4>
                    <p className="text-blue-600 font-medium mb-2">{experience.company}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDateRange(experience.startDate, experience.endDate, experience.current)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {calculateDuration(experience.startDate, experience.endDate, experience.current)}
                      </span>
                      {experience.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {experience.location}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {EMPLOYMENT_TYPES.find(t => t.value === experience.employmentType)?.label || 'Full-time'}
                      </Badge>
                      {experience.current && (
                        <Badge className="text-xs bg-green-600">Current Position</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditExperience(experience)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteExperience(experience.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {experience.description && (
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {experience.description}
                  </p>
                )}
                
                {(experience.achievements?.length ?? 0) > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2 text-sm">Key Achievements:</h5>
                    <ul className="space-y-1">
                      {experience.achievements?.map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.experience.length === 0 && !isAddingExperience && (
        <div className="text-center py-12 text-gray-500">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No work experience added yet</p>
          <p className="text-sm">Click "Add Experience" to get started</p>
        </div>
      )}
    </div>
  )
})

ExperienceComponent.displayName = 'ExperienceComponent'
