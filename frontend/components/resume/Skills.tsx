"use client"

import { useState, useCallback, useEffect, memo } from "react"
import {
  Code, Plus, X, Search, CheckCircle, Star, Award, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skill, ResumeStepProps } from "./types"
import { SKILL_CATEGORIES, SKILL_CATEGORIES_WITH_METADATA } from "./skillCategories"

interface SkillsComponentProps extends Pick<ResumeStepProps, 'data' | 'errors' | 'onChange'> {
  onValidation?: (isValid: boolean) => void
}

export const SkillsComponent = memo<SkillsComponentProps>(({ 
  data, 
  errors = {}, 
  onChange,
  onValidation 
}) => {
  // ✅ Normalize safely
  const skills: Skill[] = Array.isArray(data?.skills) ? data.skills : []

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('')
  const [isAddingCustomSkill, setIsAddingCustomSkill] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')

  // ✅ Validation
  const validateForm = useCallback(() => {
    const hasSkills = skills.length > 0
    onValidation?.(hasSkills)
    return hasSkills
  }, [skills.length, onValidation])

  useEffect(() => {
    validateForm()
  }, [validateForm])

  // ✅ Handlers
  const addSkill = useCallback((skillName: string, category: string, level: number = 3) => {
    if (skills.some(s => s?.name?.toLowerCase() === skillName.toLowerCase())) return
    const newSkill: Skill = { name: skillName, level, category, years: undefined, certified: false }
    onChange('skills', [...skills, newSkill])
  }, [skills, onChange])

  const removeSkill = useCallback((skillName: string) => {
    onChange('skills', skills.filter(s => s.name !== skillName))
  }, [skills, onChange])

  const updateSkillLevel = useCallback((skillName: string, level: number) => {
    onChange('skills', skills.map(s => s.name === skillName ? { ...s, level } : s))
  }, [skills, onChange])

  const updateSkillYears = useCallback((skillName: string, years: number | undefined) => {
    onChange('skills', skills.map(s => s.name === skillName ? { ...s, years } : s))
  }, [skills, onChange])

  const toggleSkillCertified = useCallback((skillName: string) => {
    onChange('skills', skills.map(s => s.name === skillName ? { ...s, certified: !s.certified } : s))
  }, [skills, onChange])

  const handleCustomSkillAdd = useCallback(() => {
    if (newSkillName.trim() && newSkillCategory.trim()) {
      addSkill(newSkillName.trim(), newSkillCategory.trim())
      setNewSkillName('')
      setNewSkillCategory('')
      setIsAddingCustomSkill(false)
    }
  }, [newSkillName, newSkillCategory, addSkill])

  // Helpers
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Basic'
      case 3: return 'Intermediate'
      case 4: return 'Advanced'
      case 5: return 'Expert'
      default: return 'Intermediate'
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500'
      case 2: return 'bg-orange-500'
      case 3: return 'bg-yellow-500'
      case 4: return 'bg-green-500'
      case 5: return 'bg-blue-500'
      default: return 'bg-yellow-500'
    }
  }

  const getSkillsByCategory = () => {
    const grouped: Record<string, Skill[]> = {}
    skills.forEach(skill => {
      if (!grouped[skill.category]) grouped[skill.category] = []
      grouped[skill.category].push(skill)
    })
    return grouped
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Code className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Skills & Expertise</h2>
        <p className="text-gray-600">Select your skills and rate your proficiency level</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Browse Skills
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Manage Skills ({skills.length})
          </TabsTrigger>
        </TabsList>

        {/* ============ BROWSE TAB ============ */}
        <TabsContent value="browse" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search skills..."
                className="pl-10 bg-blue-50/50"
              />
            </div>
            <div className="w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-blue-50/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(SKILL_CATEGORIES).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Skill Add */}
          <Card className="border-dashed border-2 border-blue-300">
            <CardContent className="p-4">
              {!isAddingCustomSkill ? (
                <Button
                  onClick={() => setIsAddingCustomSkill(true)}
                  variant="ghost"
                  className="w-full h-16 border-none text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Custom Skill
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Skill name (e.g., React Native)"
                      className="bg-white"
                    />
                    <Input
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      placeholder="Category (e.g., Frontend Development)"
                      className="bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsAddingCustomSkill(false)
                        setNewSkillName('')
                        setNewSkillCategory('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCustomSkillAdd}
                      disabled={!newSkillName.trim() || !newSkillCategory.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Skill
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Categories */}
          <div className="space-y-6">
            {Object.entries(SKILL_CATEGORIES_WITH_METADATA).map(([category, metadata]) => {
              const filteredSkills = metadata.skills.filter(skill =>
                (selectedCategory === 'all' || selectedCategory === category) &&
                skill.toLowerCase().includes(searchTerm.toLowerCase())
              )

              if (filteredSkills.length === 0) return null

              const CategoryIcon = metadata.icon

              return (
                <Card key={category} className={`border-2 ${metadata.bgColor} border-opacity-50`}>
                  <CardHeader className="pb-4">
                    <CardTitle className={`flex items-center ${metadata.color}`}>
                      <CategoryIcon className="w-5 h-5 mr-2" />
                      {category}
                      <Badge variant="secondary" className="ml-2">
                        {filteredSkills.length}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{metadata.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {filteredSkills.map((skill: string) => {
                        const isSelected = skills.some(s => s.name === skill)
                        return (
                          <Button
                            key={skill}
                            onClick={() => 
                              isSelected ? removeSkill(skill) : addSkill(skill, category)
                            }
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={`justify-start text-left h-auto py-2 px-3 transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            {isSelected && <CheckCircle className="w-3 h-3 mr-1" />}
                            <span className="text-sm">{skill}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ============ MANAGE TAB ============ */}
        <TabsContent value="manage" className="space-y-6">
          {skills.length > 0 ? (
            Object.entries(getSkillsByCategory()).map(([category, catSkills]) => {
              const metadata = SKILL_CATEGORIES_WITH_METADATA[category]
              const CategoryIcon = metadata?.icon || Code
              const color = metadata?.color || "text-blue-600"
              const bgColor = metadata?.bgColor || "bg-blue-50"
              
              return (
              <Card key={category} className={`border-2 ${bgColor} border-opacity-30`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${color}`}>
                    <CategoryIcon className="w-5 h-5 mr-2" />
                    {category}
                    <Badge variant="outline" className="ml-2">{catSkills.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {catSkills.map((skill) => (
                    <div key={skill.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{skill.name}</span>
                          {skill.certified && (
                            <Badge className="bg-green-600 text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSkill(skill.name)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Level */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Proficiency Level</Label>
                            <span className="text-sm text-gray-600">{getLevelLabel(skill.level)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                onClick={() => updateSkillLevel(skill.name, level)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                                  level <= skill.level
                                    ? getLevelColor(skill.level) + ' text-white shadow-md'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {level === 5 ? <Star className="w-4 h-4" /> : level}
                              </button>
                            ))}
                          </div>
                          <Progress value={(skill.level / 5) * 100} className="mt-2 h-2" />
                        </div>

                        {/* Years + Cert */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Years of Experience</Label>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              value={skill.years || ''}
                              onChange={(e) =>
                                updateSkillYears(skill.name, e.target.value ? parseInt(e.target.value) : undefined)
                              }
                              placeholder="e.g., 3"
                              className="mt-1 bg-white"
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              size="sm"
                              variant={skill.certified ? "default" : "outline"}
                              onClick={() => toggleSkillCertified(skill.name)}
                              className={`w-full ${
                                skill.certified
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'hover:bg-green-50 hover:border-green-300'
                              }`}
                            >
                              <Award className="w-4 h-4 mr-2" />
                              {skill.certified ? 'Certified' : 'Add Certification'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No skills selected yet</p>
              <p className="text-sm">Switch to the "Browse Skills" tab to add skills</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
})

SkillsComponent.displayName = 'SkillsComponent'
