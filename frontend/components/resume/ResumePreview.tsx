"use client"

import { memo } from "react"
import { 
  Eye, Download, Mail, Phone, MapPin, Globe, 
  Linkedin, Github, Calendar, Star, Award, 
  ExternalLink, CheckCircle, Users, Clock,
  Briefcase, GraduationCap, Lightbulb, Code
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ResumeData } from "./types"

interface ResumePreviewProps {
  data: ResumeData
  onFinalSave?: () => Promise<void>
  isLoading?: boolean
  completedSections?: {[key: string]: boolean}
}

export const ResumePreviewComponent = memo<ResumePreviewProps>(({ data, onFinalSave, isLoading = false, completedSections = {} }) => {
  
  const handleDownload = () => {
    // Create a printable version
    const printContent = document.getElementById('resume-preview-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      printWindow?.document.write(`
        <html>
          <head>
            <title>${data.personalInfo.fullName} - Resume</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 210mm;
                margin: 0 auto;
                padding: 20px;
                background: white;
              }
              .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
              .name { font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
              .contact-info { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 14px; color: #6b7280; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 20px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
              .item { margin-bottom: 20px; }
              .item-title { font-weight: bold; font-size: 16px; color: #374151; }
              .item-subtitle { color: #2563eb; font-weight: 600; margin-bottom: 5px; }
              .item-meta { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
              .description { margin-bottom: 10px; text-align: justify; }
              .achievements { list-style: none; padding: 0; }
              .achievements li { padding-left: 20px; position: relative; margin-bottom: 5px; }
              .achievements li:before { content: "•"; color: #2563eb; position: absolute; left: 0; }
              .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
              .skill-category { margin-bottom: 15px; }
              .skill-category-title { font-weight: bold; color: #374151; margin-bottom: 8px; }
              .skill-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
              .skill-level { width: 100px; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden; }
              .skill-level-fill { height: 100%; background: #2563eb; }
              .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
              .badge { background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
              .summary { text-align: justify; font-style: italic; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              @media print { body { margin: 0; padding: 15px; font-size: 12px; } .name { font-size: 28px; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `)
      printWindow?.document.close()
      printWindow?.focus()
      printWindow?.print()
    }
  }

  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }) : ''
    
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

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Basic'
      case 3: return 'Intermediate'
      case 4: return 'Advanced'
      case 5: return 'Expert'
      default: return 'Intermediate'
    }
  }

  // Ensure arrays are always defined to avoid runtime errors when backend data is partial
  const safeSkills = Array.isArray(data.skills) ? data.skills : []
  const safeExperience = Array.isArray(data.experience) ? data.experience : []
  const safeEducation = Array.isArray(data.education) ? data.education : []
  const safeProjects = Array.isArray(data.projects) ? data.projects : []
  const safeCertificates = Array.isArray(data.certificates) ? data.certificates : []

  // Group skills by category
  const skillsByCategory = safeSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, typeof safeSkills>)

  // Calculate completion stats
  const sections = [
    { key: 'personalInfo', label: 'Personal Information', hasData: !!(data.personalInfo.fullName && data.personalInfo.email) },
    { key: 'experience', label: 'Experience', hasData: safeExperience.length > 0 },
    { key: 'education', label: 'Education', hasData: safeEducation.length > 0 },
    { key: 'skills', label: 'Skills', hasData: safeSkills.length > 0 },
    { key: 'projects', label: 'Projects', hasData: safeProjects.length > 0 },
    { key: 'certificates', label: 'Certificates', hasData: safeCertificates.length > 0 }
  ]
  
  const completedCount = sections.filter(s => s.hasData).length
  const completionPercentage = Math.round((completedCount / sections.length) * 100)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Resume Preview</h2>
        <p className="text-gray-600">Review your complete resume before saving</p>
        
        {/* Completion Status */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-4 mb-3">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{completionPercentage}%</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Resume Completion</h3>
              <p className="text-sm text-gray-600">{completedCount} of {sections.length} sections completed</p>
            </div>
          </div>
          
          {/* Section Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {sections.map((section) => (
              <div key={section.key} className={`flex items-center space-x-1 px-2 py-1 rounded ${
                section.hasData ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
              }`}>
                {section.hasData ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                )}
                <span>{section.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <Button 
          onClick={handleDownload}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Resume
        </Button>
        
        {onFinalSave && (
          <Button 
            onClick={onFinalSave}
            disabled={isLoading || completionPercentage < 60}
            className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent mr-2"></div>
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Saving...' : 'Save & Continue to Dashboard'}
          </Button>
        )}
      </div>
      
      {completionPercentage < 60 && onFinalSave && (
        <div className="text-center mb-4">
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
            <span className="font-medium">Tip:</span> Complete at least 60% of your resume sections before final save
          </p>
        </div>
      )}

      {/* Resume Content */}
      <Card className="shadow-2xl">
        <CardContent className="p-0">
          <div id="resume-preview-content" className="bg-white">
            
            {/* Header */}
            <div className="header bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 text-center">
              <h1 className="name text-4xl font-bold mb-4">{data.personalInfo.fullName}</h1>
              <div className="contact-info flex justify-center items-center flex-wrap gap-6 text-blue-100">
                {data.personalInfo.email && (
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {data.personalInfo.email}
                  </span>
                )}
                {data.personalInfo.phone && (
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {data.personalInfo.phone}
                  </span>
                )}
                {data.personalInfo.location && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {data.personalInfo.location}
                  </span>
                )}
                {data.personalInfo.website && (
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </span>
                )}
                {data.personalInfo.linkedin && (
                  <span className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-2" />
                    <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      LinkedIn
                    </a>
                  </span>
                )}
                {data.personalInfo.github && (
                  <span className="flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      GitHub
                    </a>
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              
              {/* Professional Summary */}
              {data.personalInfo.summary && (
                <div className="section">
                  <h3 className="section-title text-xl font-bold text-blue-700 mb-4 flex items-center">
                    Professional Summary
                  </h3>
                  <div className="summary bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
                  </div>
                </div>
              )}

              {/* Experience */}
              {safeExperience.length > 0 && (
                <div className="section">
                  <h3 className="section-title text-xl font-bold text-blue-700 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Professional Experience
                  </h3>
                  <div className="space-y-6">
                    {safeExperience.map((exp, index) => (
                      <div key={exp.id} className="item border-l-2 border-blue-200 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="item-title text-lg font-semibold text-gray-800">{exp.position}</h4>
                            <div className="item-subtitle text-blue-600 font-medium">{exp.company}</div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                            </div>
                            {exp.location && (
                              <div className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {exp.location}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {exp.employmentType || 'Full-time'}
                          </Badge>
                          {exp.current && (
                            <Badge className="text-xs bg-green-600">Current Position</Badge>
                          )}
                        </div>

                        {exp.description && (
                          <p className="description text-gray-700 mb-3">{exp.description}</p>
                        )}

                        {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">Key Achievements:</h5>
                            <ul className="achievements">
                              {exp.achievements.map((achievement, i) => (
                                <li key={i} className="text-gray-700">{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {safeEducation.length > 0 && (
                <div className="section">
                  <h3 className="section-title text-xl font-bold text-blue-700 mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {safeEducation.map((edu, index) => (
                      <div key={edu.id} className="item border-l-2 border-blue-200 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="item-title text-lg font-semibold text-gray-800">
                              {edu.degree} in {edu.field}
                            </h4>
                            <div className="item-subtitle text-blue-600 font-medium">{edu.institution}</div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateRange(edu.startDate || '', edu.graduationYear, edu.current || false)}
                            </div>
                            {edu.gpa && (
                              <div className="flex items-center mt-1">
                                <Star className="w-4 h-4 mr-1" />
                                GPA: {edu.gpa}
                              </div>
                            )}
                          </div>
                        </div>

                        {edu.achievements && edu.achievements.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">Achievements:</h5>
                            <ul className="achievements">
                              {edu.achievements.map((achievement, i) => (
                                <li key={i} className="text-gray-700">{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {safeSkills.length > 0 && (
                <div className="section">
                  <h3 className="section-title text-xl font-bold text-blue-700 mb-4 flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Skills & Expertise
                  </h3>
                  <div className="skills-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                      <div key={category} className="skill-category">
                        <h4 className="skill-category-title font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                          {category}
                        </h4>
                        <div className="space-y-2">
                          {skills.map((skill) => (
                            <div key={skill.name} className="skill-item">
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                  <span className="text-xs text-gray-500">{getLevelText(skill.level)}</span>
                                </div>
                                <div className="skill-level">
                                  <div 
                                    className="skill-level-fill"
                                    style={{ width: `${(skill.level / 5) * 100}%` }}
                                  />
                                </div>
                                {(skill.years || skill.certified) && (
                                  <div className="flex gap-2 mt-1">
                                    {skill.years && (
                                      <span className="text-xs text-gray-500">{skill.years} years</span>
                                    )}
                                    {skill.certified && (
                                      <span className="text-xs text-green-600 flex items-center">
                                        <Award className="w-3 h-3 mr-1" />
                                        Certified
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {safeProjects.length > 0 && (
                <div className="section">
                  <h3 className="section-title text-xl font-bold text-blue-700 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Notable Projects
                  </h3>
                  <div className="space-y-6">
                    {safeProjects.map((project, index) => (
                      <div key={project.id} className="item border-l-2 border-blue-200 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="item-title text-lg font-semibold text-gray-800">{project.name}</h4>
                            {project.role && (
                              <div className="item-subtitle text-blue-600 font-medium">Role: {project.role}</div>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateRange(project.startDate, project.endDate, project.status === 'in-progress')}
                            </div>
                            {project.teamSize && (
                              <div className="flex items-center mt-1">
                                <Users className="w-4 h-4 mr-1" />
                                Team of {project.teamSize}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <Badge 
                            className={`text-xs ${
                              project.status === 'completed' ? 'bg-green-600' :
                              project.status === 'in-progress' ? 'bg-blue-600' : 'bg-yellow-600'
                            }`}
                          >
                            {project.status === 'in-progress' ? 'In Progress' : 
                             project.status === 'on-hold' ? 'On Hold' : 'Completed'}
                          </Badge>
                        </div>

                        <p className="description text-gray-700 mb-3">{project.description}</p>

                        {(project.technologies?.length ?? 0) > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium text-gray-800 mb-2">Technologies:</h5>
                            <div className="badges flex flex-wrap gap-2">
                              {project.technologies?.map((tech) => (
                                <span key={tech} className="badge text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          {project.link && (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center text-sm"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Live Demo
                            </a>
                          )}
                          {project.github && (
                            <a 
                              href={project.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:underline flex items-center text-sm"
                            >
                              <Github className="w-3 h-3 mr-1" />
                              Source Code
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {safeCertificates.length > 0 && (
                <div className="section">
                  <h3 className="section-title text-xl font-bold text-blue-700 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Certifications
                  </h3>
                  <div className="space-y-4">
                    {safeCertificates.map((cert, index) => (
                      <div key={cert.id} className="item border-l-2 border-blue-200 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="item-title text-lg font-semibold text-gray-800">{cert.name}</h4>
                            <div className="item-subtitle text-blue-600 font-medium">{cert.issuer}</div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </div>
                            {cert.expiryDate && (
                              <div className="flex items-center mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                Expires: {new Date(cert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                              </div>
                            )}
                          </div>
                        </div>

                        {cert.credentialId && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Credential ID: </span>
                            <span className="text-sm text-gray-600 font-mono">{cert.credentialId}</span>
                          </div>
                        )}

                        {cert.verificationLink && (
                          <a 
                            href={cert.verificationLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center text-sm"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Verify Certificate
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ResumePreviewComponent.displayName = 'ResumePreviewComponent'
