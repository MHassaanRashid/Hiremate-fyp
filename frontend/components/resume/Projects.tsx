"use client"

import { useState, useCallback, useEffect, memo } from "react"
import { 
  Lightbulb, Plus, Edit, Trash2, Calendar, 
  ExternalLink, Github, Globe, CheckCircle, X, 
  Users, Play, Pause, Clock, Star, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Project, ResumeStepProps, TECHNOLOGIES } from "./types"

interface ProjectsComponentProps extends Pick<ResumeStepProps, 'data' | 'errors' | 'onChange'> {
  onValidation?: (isValid: boolean) => void
}

interface ProjectFormData extends Omit<Project, 'id'> {}

export const ProjectsComponent = memo<ProjectsComponentProps>(({ 
  data, 
  errors = {}, 
  onChange,
  onValidation 
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    technologies: [],
    link: '',
    github: '',
    startDate: '',
    endDate: '',
    status: 'completed',
    teamSize: undefined,
    role: ''
  })
  const [newTechnology, setNewTechnology] = useState('')
  const [techSearch, setTechSearch] = useState('')

  // Generate unique ID for new items
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Validation function
  const validateForm = useCallback(() => {
    const hasProjects = data.projects.length > 0
    onValidation?.(hasProjects)
    return hasProjects
  }, [data.projects.length, onValidation])

  // Effect to run validation when data changes
  useEffect(() => {
    validateForm()
  }, [validateForm])

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
      startDate: '',
      endDate: '',
      status: 'completed',
      teamSize: undefined,
      role: ''
    })
    setNewTechnology('')
    setTechSearch('')
  }, [])

  const handleAddProject = useCallback(() => {
    setIsAddingProject(true)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleEditProject = useCallback((project: Project) => {
    setFormData({
      name: project.name,
      description: project.description,
      technologies: [...project.technologies],
      link: project.link || '',
      github: project.github || '',
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      teamSize: project.teamSize,
      role: project.role || ''
    })
    setEditingId(project.id)
    setIsAddingProject(true)
  }, [])

  const handleDeleteProject = useCallback((id: string) => {
    const updatedProjects = data.projects.filter(proj => proj.id !== id)
    onChange('projects', updatedProjects)
  }, [data.projects, onChange])

  const handleSaveProject = useCallback(() => {
    // Validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.startDate) {
      return
    }

    const projectData: Project = {
      ...formData,
      id: editingId || generateId()
    }

    let updatedProjects: Project[]
    if (editingId) {
      updatedProjects = data.projects.map(proj => 
        proj.id === editingId ? projectData : proj
      )
    } else {
      updatedProjects = [...data.projects, projectData]
    }

    // Sort by start date (most recent first)
    updatedProjects.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

    onChange('projects', updatedProjects)
    setIsAddingProject(false)
    setEditingId(null)
    resetForm()
  }, [formData, editingId, data.projects, onChange, resetForm])

  const handleCancelEdit = useCallback(() => {
    setIsAddingProject(false)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  const handleFormChange = useCallback((field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const addTechnology = useCallback((tech: string) => {
    if (tech.trim() && !formData.technologies.includes(tech.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech.trim()]
      }))
    }
  }, [formData.technologies])

  const removeTechnology = useCallback((tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }, [])

  const handleCustomTechAdd = useCallback(() => {
    if (newTechnology.trim()) {
      addTechnology(newTechnology.trim())
      setNewTechnology('')
    }
  }, [newTechnology, addTechnology])

  const getFilteredTechnologies = () => {
    return TECHNOLOGIES.filter(tech => 
      tech.toLowerCase().includes(techSearch.toLowerCase()) &&
      !formData.technologies.includes(tech)
    )
  }

  const formatDateRange = (startDate: string, endDate: string, status: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
    
    if (status === 'in-progress') {
      return `${start} - Ongoing`
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <Play className="w-4 h-4" />
      case 'on-hold': return <Pause className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600'
      case 'in-progress': return 'bg-blue-600'
      case 'on-hold': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }

  const isFormValid = formData.name.trim() && formData.description.trim() && formData.startDate

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Projects</h2>
        <p className="text-gray-600">Showcase your notable projects and technical work</p>
      </div>

      {/* Add Project Button */}
      {!isAddingProject && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAddProject}
            className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      )}

      {/* Project Form */}
      {isAddingProject && (
        <Card className="border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              {editingId ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {editingId ? 'Edit Project' : 'Add New Project'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., E-commerce Platform"
                  className="bg-green-50/50"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Project Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => handleFormChange('status', value)}
                >
                  <SelectTrigger className="bg-green-50/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Your Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  placeholder="e.g., Full Stack Developer, Lead Developer"
                  className="bg-green-50/50"
                />
              </div>

              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.teamSize || ''}
                  onChange={(e) => handleFormChange('teamSize', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 4"
                  className="bg-green-50/50"
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
                    className="pl-10 bg-green-50/50"
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
                    disabled={formData.status === 'in-progress'}
                    className="pl-10 bg-green-50/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="projectLink">Live Demo URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="projectLink"
                    type="url"
                    value={formData.link}
                    onChange={(e) => handleFormChange('link', e.target.value)}
                    placeholder="https://project-demo.com"
                    className="pl-10 bg-green-50/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="githubLink">GitHub Repository</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    id="githubLink"
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleFormChange('github', e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="pl-10 bg-green-50/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Describe the project, your contributions, challenges overcome, and key features..."
                rows={4}
                className="bg-green-50/50 resize-none"
              />
            </div>

            {/* Technologies */}
            <div>
              <Label>Technologies Used</Label>
              
              {/* Selected Technologies */}
              {formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        onClick={() => removeTechnology(tech)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Technology Search */}
              <div className="space-y-3">
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    placeholder="Search technologies..."
                    className="pl-10 bg-green-50/50"
                  />
                </div>

                {/* Technology Suggestions */}
                {techSearch && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {getFilteredTechnologies().slice(0, 12).map((tech) => (
                      <Button
                        key={tech}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          addTechnology(tech)
                          setTechSearch('')
                        }}
                        className="justify-start text-left h-8"
                      >
                        {tech}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Custom Technology */}
                <div className="flex gap-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="Add custom technology..."
                    className="bg-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomTechAdd()}
                  />
                  <Button 
                    type="button" 
                    onClick={handleCustomTechAdd}
                    disabled={!newTechnology.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
                onClick={handleSaveProject}
                disabled={!isFormValid}
                className="bg-gradient-to-r from-green-600 to-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      {data.projects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-green-600" />
            Your Projects ({data.projects.length})
          </h3>
          
          {data.projects.map((project, index) => (
            <Card key={project.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {project.name}
                      </h4>
                      <Badge className={`text-xs ${getStatusColor(project.status)} flex items-center gap-1`}>
                        {getStatusIcon(project.status)}
                        {project.status === 'in-progress' ? 'In Progress' : 
                         project.status === 'on-hold' ? 'On Hold' : 'Completed'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDateRange(project.startDate, project.endDate, project.status)}
                      </span>
                      {project.role && (
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {project.role}
                        </span>
                      )}
                      {project.teamSize && (
                        <span className="flex items-center">
                          Team of {project.teamSize}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {(project.technologies?.length ?? 0) > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies?.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-3">
                      {project.link && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(project.link, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Live Demo
                        </Button>
                      )}
                      {project.github && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(project.github, '_blank')}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          <Github className="w-4 h-4 mr-1" />
                          Code
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProject(project)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.projects.length === 0 && !isAddingProject && (
        <div className="text-center py-12 text-gray-500">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No projects added yet</p>
          <p className="text-sm">Click "Add Project" to showcase your work</p>
        </div>
      )}
    </div>
  )
})

ProjectsComponent.displayName = 'ProjectsComponent'
