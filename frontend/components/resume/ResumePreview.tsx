"use client"

import { memo } from "react"
import {
  Eye, Download, Mail, Phone, MapPin, Globe,
  Linkedin, Github, Calendar, Star, Award,
  ExternalLink, CheckCircle, Users, Clock,
  Briefcase, GraduationCap, Lightbulb, Code,
  AlertCircle, TrendingUp, Loader2
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
  completedSections?: { [key: string]: boolean }
}

export const ResumePreviewComponent = memo<ResumePreviewProps>(({ data, onFinalSave, isLoading = false, completedSections = {} }) => {

  const handleDownload = () => {
    const printContent = document.getElementById('resume-preview-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      printWindow?.document.write(`
        <html>
          <head>
            <title>${data.personalInfo?.fullName || 'Resume'} - Resume</title>
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

  // Ensure arrays are always defined
  const safeSkills = Array.isArray(data.skills) ? data.skills : []
  const safeExperience = Array.isArray(data.experience) ? data.experience : []
  const safeEducation = Array.isArray(data.education) ? data.education : []
  const safeProjects = Array.isArray(data.projects) ? data.projects : []
  const safeCertificates = Array.isArray(data.certificates) ? data.certificates : []

  // Group skills by category
  const skillsByCategory = safeSkills.reduce((acc, skill) => {
    const category = skill.category || 'Other Skills'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, typeof safeSkills>)

  // Calculate completion stats
  const sections = [
    { key: 'personalInfo', label: 'Personal Information', hasData: !!(data.personalInfo?.fullName && data.personalInfo?.email) },
    { key: 'experience', label: 'Experience', hasData: safeExperience.length > 0 },
    { key: 'education', label: 'Education', hasData: safeEducation.length > 0 },
    { key: 'skills', label: 'Skills', hasData: safeSkills.length > 0 },
    { key: 'projects', label: 'Projects', hasData: safeProjects.length > 0 },
    { key: 'certificates', label: 'Certificates', hasData: safeCertificates.length > 0 }
  ]

  const completedCount = sections.filter(s => s.hasData).length
  const completionPercentage = Math.round((completedCount / sections.length) * 100)

  // Debug: Log data
  console.log('Resume Preview Data:', {
    personalInfo: data.personalInfo,
    experience: safeExperience,
    education: safeEducation,
    skills: safeSkills,
    skillsByCategory: skillsByCategory,
    projects: safeProjects,
    certificates: safeCertificates
  })

  return (
    <div className="space-y-4">
      {/* Compact Header with Download Button */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Resume Preview</h2>
          <p className="text-slate-600 text-xs">Review your complete resume</p>
        </div>
        <Button
          onClick={handleDownload}
          size="sm"
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Resume Content */}
      <Card className="shadow-xl border-2 border-slate-200 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div id="resume-preview-content" className="bg-white">


            {/* Header */}
            <div className="header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-10 text-center">
              <h1 className="name text-5xl font-bold mb-4 drop-shadow-lg">
                {data.personalInfo?.fullName || 'Your Name'}
              </h1>
              <div className="contact-info flex justify-center items-center flex-wrap gap-4 text-blue-100">
                {data.personalInfo?.email && (
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Mail className="w-4 h-4" />
                    {data.personalInfo.email}
                  </span>
                )}
                {data.personalInfo?.phone && (
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Phone className="w-4 h-4" />
                    {data.personalInfo.phone}
                  </span>
                )}
                {data.personalInfo?.location && (
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <MapPin className="w-4 h-4" />
                    {data.personalInfo.location}
                  </span>
                )}
                {data.personalInfo?.website && (
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Globe className="w-4 h-4" />
                    <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </span>
                )}
                {data.personalInfo?.linkedin && (
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Linkedin className="w-4 h-4" />
                    <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      LinkedIn
                    </a>
                  </span>
                )}
                {data.personalInfo?.github && (
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Github className="w-4 h-4" />
                    <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      GitHub
                    </a>
                  </span>
                )}
              </div>
            </div>

            <div className="p-10 space-y-8">

              {/* Professional Summary */}
              {data.personalInfo?.summary && (
                <div className="section">
                  <h3 className="section-title text-2xl font-bold text-blue-700 mb-4 flex items-center border-b-2 border-blue-200 pb-2">
                    Professional Summary
                  </h3>
                  <div className="summary bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-l-4 border-blue-600">
                    <p className="text-slate-700 leading-relaxed text-base">{data.personalInfo.summary}</p>
                  </div>
                </div>
              )}

              {/* Experience */}
              {safeExperience.length > 0 && (
                <div className="section">
                  <h3 className="section-title text-2xl font-bold text-blue-700 mb-6 flex items-center border-b-2 border-blue-200 pb-2">
                    <Briefcase className="w-6 h-6 mr-2" />
                    Professional Experience
                  </h3>
                  <div className="space-y-6">
                    {safeExperience.map((exp, index) => (
                      <div key={exp.id || index} className="item border-l-4 border-blue-300 pl-6 hover:border-blue-600 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="item-title text-xl font-bold text-slate-900">{exp.position}</h4>
                            <div className="item-subtitle text-blue-600 font-semibold text-lg">{exp.company}</div>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                            </div>
                            {exp.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4" />
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
                            <Badge className="text-xs bg-emerald-600">Current Position</Badge>
                          )}
                        </div>

                        {exp.description && (
                          <p className="description text-slate-700 mb-3 leading-relaxed">{exp.description}</p>
                        )}

                        {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-slate-800 mb-2">Key Achievements:</h5>
                            <ul className="achievements space-y-1">
                              {exp.achievements.map((achievement, i) => (
                                <li key={i} className="text-slate-700 pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                                  {achievement}
                                </li>
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
                  <h3 className="section-title text-2xl font-bold text-blue-700 mb-6 flex items-center border-b-2 border-blue-200 pb-2">
                    <GraduationCap className="w-6 h-6 mr-2" />
                    Education
                  </h3>
                  <div className="space-y-5">
                    {safeEducation.map((edu, index) => (
                      <div key={edu.id || index} className="item border-l-4 border-purple-300 pl-6 hover:border-purple-600 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="item-title text-xl font-bold text-slate-900">
                              {edu.degree} in {edu.field}
                            </h4>
                            <div className="item-subtitle text-purple-600 font-semibold">{edu.institution}</div>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateRange(edu.startDate || '', edu.graduationYear, edu.current || false)}
                            </div>
                            {edu.gpa && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 text-amber-500" />
                                GPA: {edu.gpa}
                              </div>
                            )}
                          </div>
                        </div>

                        {edu.achievements && edu.achievements.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-semibold text-slate-800 mb-2">Achievements:</h5>
                            <ul className="achievements space-y-1">
                              {edu.achievements.map((achievement, i) => (
                                <li key={i} className="text-slate-700 pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-purple-600 before:font-bold">
                                  {achievement}
                                </li>
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
                  <h3 className="section-title text-2xl font-bold text-blue-700 mb-6 flex items-center border-b-2 border-blue-200 pb-2">
                    <Code className="w-6 h-6 mr-2" />
                    Skills & Expertise
                  </h3>
                  <div className="skills-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                      <div key={category} className="skill-category bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h4 className="skill-category-title font-bold text-slate-900 mb-4 text-lg border-b border-slate-300 pb-2">
                          {category}
                        </h4>
                        <div className="space-y-3">
                          {skills.map((skill, skillIndex) => (
                            <div key={`${skill.name}-${skillIndex}`} className="skill-item">
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-semibold text-slate-800">{skill.name}</span>
                                  <span className="text-xs text-slate-600 bg-white px-2 py-1 rounded">{getLevelText(skill.level)}</span>
                                </div>
                                <div className="skill-level h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="skill-level-fill h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                                    style={{ width: `${(skill.level / 5) * 100}%` }}
                                  />
                                </div>
                                {(skill.years || skill.certified) && (
                                  <div className="flex gap-2 mt-2">
                                    {skill.years && (
                                      <span className="text-xs text-slate-600">{skill.years} years</span>
                                    )}
                                    {skill.certified && (
                                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                                        <Award className="w-3 h-3" />
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
                  <h3 className="section-title text-2xl font-bold text-blue-700 mb-6 flex items-center border-b-2 border-blue-200 pb-2">
                    <Lightbulb className="w-6 h-6 mr-2" />
                    Notable Projects
                  </h3>
                  <div className="space-y-6">
                    {safeProjects.map((project, index) => (
                      <div key={project.id || index} className="item border-l-4 border-amber-300 pl-6 hover:border-amber-600 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="item-title text-xl font-bold text-slate-900">{project.name}</h4>
                            {project.role && (
                              <div className="item-subtitle text-amber-600 font-semibold">Role: {project.role}</div>
                            )}
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateRange(project.startDate, project.endDate, project.status === 'in-progress')}
                            </div>
                            {project.teamSize && (
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="w-4 h-4" />
                                Team of {project.teamSize}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mb-3">
                          <Badge
                            className={`text-xs ${project.status === 'completed' ? 'bg-emerald-600' :
                              project.status === 'in-progress' ? 'bg-blue-600' : 'bg-amber-600'
                              }`}
                          >
                            {project.status === 'in-progress' ? 'In Progress' :
                              project.status === 'on-hold' ? 'On Hold' : 'Completed'}
                          </Badge>
                        </div>

                        <p className="description text-slate-700 mb-3 leading-relaxed">{project.description}</p>

                        {(project.technologies?.length ?? 0) > 0 && (
                          <div className="mb-3">
                            <h5 className="font-semibold text-slate-800 mb-2">Technologies:</h5>
                            <div className="badges flex flex-wrap gap-2">
                              {project.technologies?.map((tech) => (
                                <span key={tech} className="badge text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-300">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-4">
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Live Demo
                            </a>
                          )}
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-600 hover:underline flex items-center gap-1 text-sm font-medium"
                            >
                              <Github className="w-4 h-4" />
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
                  <h3 className="section-title text-2xl font-bold text-blue-700 mb-6 flex items-center border-b-2 border-blue-200 pb-2">
                    <Award className="w-6 h-6 mr-2" />
                    Certifications
                  </h3>
                  <div className="space-y-5">
                    {safeCertificates.map((cert, index) => (
                      <div key={cert.id || index} className="item border-l-4 border-emerald-300 pl-6 hover:border-emerald-600 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="item-title text-xl font-bold text-slate-900">{cert.name}</h4>
                            <div className="item-subtitle text-emerald-600 font-semibold">{cert.issuer}</div>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </div>
                            {cert.expiryDate && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-4 h-4" />
                                Expires: {new Date(cert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                              </div>
                            )}
                          </div>
                        </div>

                        {cert.credentialId && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-slate-700">Credential ID: </span>
                            <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">{cert.credentialId}</span>
                          </div>
                        )}

                        {cert.verificationLink && (
                          <a
                            href={cert.verificationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
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
