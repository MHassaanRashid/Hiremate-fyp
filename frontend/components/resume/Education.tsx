"use client"

import { useState, useCallback, useEffect, memo } from "react"
import { 
  GraduationCap, Plus, Edit, Trash2, Calendar, 
  Building, Award, CheckCircle, X, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Education, ResumeStepProps, COMMON_DEGREES, COMMON_FIELDS } from "./types"

interface EducationComponentProps extends Pick<ResumeStepProps, 'data' | 'errors' | 'onChange'> {
  onValidation?: (isValid: boolean) => void
}

interface EducationFormData extends Omit<Education, 'id'> {}

export const EducationComponent = memo<EducationComponentProps>(({ 
  data, 
  errors = {}, 
  onChange,
  onValidation 
}) => {
  const [isAddingEducation, setIsAddingEducation] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<EducationFormData>({
    institution: '',
    degree: '',
    field: '',
    graduationYear: '',
    gpa: '',
    achievements: [],
    startDate: '',
    current: false
  })
  const [newAchievement, setNewAchievement] = useState('')

  // Generate unique ID for new items
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Validation function
const validateForm = useCallback(() => {
  const hasEducation = Array.isArray(data?.education) && data.education.length > 0;
  onValidation?.(hasEducation);
  return hasEducation;
}, [data?.education?.length || 0, onValidation]);


  // Effect to run validation when data changes
  useEffect(() => {
    validateForm()
  }, [validateForm])

  const resetForm = useCallback(() => {
    setFormData({
      institution: '',
      degree: '',
      field: '',
      graduationYear: '',
      gpa: '',
      achievements: [],
      startDate: '',
      current: false
    })
    setNewAchievement('')
  }, [])

  const handleAddEducation = useCallback(() => {
    setIsAddingEducation(true)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleEditEducation = useCallback((education: Education) => {
    setFormData({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      graduationYear: education.graduationYear,
      gpa: education.gpa || '',
      achievements: [...(education.achievements || [])],
      startDate: education.startDate || '',
      current: education.current || false
    })
    setEditingId(education.id)
    setIsAddingEducation(true)
  }, [])

  const handleDeleteEducation = useCallback((id: string) => {
    const updatedEducation = data.education.filter(edu => edu.id !== id)
    onChange('education', updatedEducation)
  }, [data.education, onChange])

  const handleSaveEducation = useCallback(() => {
    // Validation
    if (!formData.institution.trim() || !formData.degree.trim() || !formData.field.trim()) {
      return
    }

    const educationData: Education = {
      ...formData,
      id: editingId || generateId(),
      graduationYear: formData.current ? '' : formData.graduationYear
    }

    let updatedEducation: Education[]
    if (editingId) {
      updatedEducation = data.education.map(edu => 
        edu.id === editingId ? educationData : edu
      )
    } else {
      updatedEducation = [...data.education, educationData]
    }

    // Sort by graduation year (most recent first)
    updatedEducation.sort((a, b) => {
      if (a.current) return -1
      if (b.current) return 1
      return parseInt(b.graduationYear || '0') - parseInt(a.graduationYear || '0')
    })

    onChange('education', updatedEducation)
    setIsAddingEducation(false)
    setEditingId(null)
    resetForm()
  }, [formData, editingId, data.education, onChange, resetForm])

  const handleCancelEdit = useCallback(() => {
    setIsAddingEducation(false)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleFormChange = useCallback((field: keyof EducationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleCurrentToggle = useCallback((checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      current: checked,
      graduationYear: checked ? '' : prev.graduationYear
    }))
  }, [])

  const addAchievement = useCallback(() => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()]
      }))
      setNewAchievement('')
    }
  }, [newAchievement])

  const removeAchievement = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index)
    }))
  }, [])

  const formatDateRange = (startDate?: string, graduationYear?: string, current?: boolean) => {
    if (current) {
      return startDate ? `${startDate} - Present` : 'Present'
    }
    
    if (startDate && graduationYear) {
      return `${startDate} - ${graduationYear}`
    }
    
    return graduationYear || startDate || ''
  }

  const isFormValid = formData.institution.trim() && formData.degree.trim() && formData.field.trim()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Education</h2>
        <p className="text-gray-600">Add your educational background and achievements</p>
      </div>

      {/* Add Education Button */}
      {!isAddingEducation && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAddEducation}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </div>
      )}

      {/* Education Form */}
      {isAddingEducation && (
        <Card className="border-indigo-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-700">
              {editingId ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {editingId ? 'Edit Education' : 'Add New Education'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institution">Institution Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => handleFormChange('institution', e.target.value)}
                    placeholder="e.g., Harvard University"
                    className="pl-10 bg-indigo-50/50"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="degree">Degree *</Label>
                <Select 
                  value={formData.degree} 
                  onValueChange={(value) => handleFormChange('degree', value)}
                >
                  <SelectTrigger className="bg-indigo-50/50">
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_DEGREES.map(degree => (
                      <SelectItem key={degree} value={degree}>
                        {degree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="field">Field of Study *</Label>
                <Select 
                  value={formData.field} 
                  onValueChange={(value) => handleFormChange('field', value)}
                >
                  <SelectTrigger className="bg-indigo-50/50">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_FIELDS.map(field => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gpa">GPA (Optional)</Label>
                <Input
                  id="gpa"
                  value={formData.gpa}
                  onChange={(e) => handleFormChange('gpa', e.target.value)}
                  placeholder="e.g., 3.8/4.0"
                  className="bg-indigo-50/50"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="pl-10 bg-indigo-50/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={(e) => handleFormChange('graduationYear', e.target.value)}
                    placeholder="e.g., 2024"
                    disabled={formData.current}
                    className="pl-10 bg-indigo-50/50"
                  />
                </div>
                <div className="flex items-center mt-2">
                  <Checkbox 
                    id="current"
                    checked={formData.current}
                    onCheckedChange={handleCurrentToggle}
                  />
                  <Label htmlFor="current" className="ml-2 text-sm">
                    I'm currently studying here
                  </Label>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <Label>Achievements & Honors (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add an achievement, honor, or relevant activity..."
                  className="bg-indigo-50/50"
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
              
              {formData.achievements && formData.achievements.length > 0 && (
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
                onClick={handleSaveEducation}
                disabled={!isFormValid}
                className="bg-gradient-to-r from-indigo-600 to-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Education
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education List */}
      {data.education && data.education.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
            Your Education ({data.education.length})
          </h3>
          
          {data.education.map((education, index) => (
            <Card key={education.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {education.degree} in {education.field}
                    </h4>
                    <p className="text-indigo-600 font-medium mb-2">{education.institution}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDateRange(education.startDate, education.graduationYear, education.current)}
                      </span>
                      {education.gpa && (
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          GPA: {education.gpa}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {education.degree}
                      </Badge>
                      {education.current && (
                        <Badge className="text-xs bg-green-600">Currently Studying</Badge>
                      )}
                      {education.gpa && parseFloat(education.gpa) >= 3.5 && (
                        <Badge className="text-xs bg-yellow-600">
                          <Star className="w-3 h-3 mr-1" />
                          High GPA
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEducation(education)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEducation(education.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {education.achievements && education.achievements.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2 text-sm">Achievements & Honors:</h5>
                    <ul className="space-y-1">
                      {education.achievements.map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="text-sm text-gray-600 flex items-start">
                          <Award className="w-3 h-3 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
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

      {Array.isArray(data.education) && data.education.length === 0 && !isAddingEducation && (
        <div className="text-center py-12 text-gray-500">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No education added yet</p>
          <p className="text-sm">Click "Add Education" to get started</p>
        </div>
      )}
    </div>
  )
})

EducationComponent.displayName = 'EducationComponent'
