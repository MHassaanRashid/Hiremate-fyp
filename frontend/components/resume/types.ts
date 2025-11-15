// Resume Data Types and Interfaces

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
  github?: string
  summary: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  graduationYear: string
  gpa?: string
  achievements?: string[]
  startDate?: string
  current?: boolean
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  location: string
  description: string
  achievements: string[]
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
  salary?: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link?: string
  github?: string
  startDate: string
  endDate: string
  status: 'completed' | 'in-progress' | 'on-hold'
  teamSize?: number
  role?: string
}

export interface Skill {
  name: string
  level: number // 1-5
  category: string
  years?: number
  certified?: boolean
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  expiryDate?: string
  credentialId?: string
  verificationLink?: string
  status: 'active' | 'expired' | 'pending'
}

export interface ResumeData {
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: Skill[]
  certificates: Certificate[]
}

// Location search interface
export interface LocationSuggestion {
  properties: {
    formatted?: string
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
}

// Component Props interfaces
export interface ResumeStepProps {
  data: ResumeData
  errors?: {[key: string]: string}
  onChange: (section: keyof ResumeData, data: any) => void
  onValidation?: (isValid: boolean) => void
}

export interface ValidationRules {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'date' | 'multiselect'
  placeholder?: string
  validation?: ValidationRules
  options?: Array<{value: string, label: string}>
  rows?: number
}

// Re-export skill categories from centralized location
export { SKILL_CATEGORIES, SKILL_CATEGORIES_WITH_METADATA } from './skillCategories'

export const TECHNOLOGIES = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Django", "Flask",
  "Express.js", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker",
  "Kubernetes", "AWS", "Google Cloud", "TypeScript", "JavaScript",
  "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Sass", "GraphQL",
  "REST API", "WebSocket", "JWT", "OAuth", "Git", "GitHub", "GitLab"
] as const

export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' }
] as const


export const COMMON_DEGREES = [
  "Bachelor's Degree", "Master's Degree", "PhD", "Associate Degree",
  "High School Diploma", "Certificate", "Diploma", "Professional Degree"
] as const

export const COMMON_FIELDS = [
  "Computer Science", "Information Technology", "Software Engineering",
  "Electrical Engineering", "Mechanical Engineering", "Business Administration",
  "Marketing", "Finance", "Accounting", "Economics", "Psychology", "Biology",
  "Chemistry", "Physics", "Mathematics", "English", "Communications"
] as const
