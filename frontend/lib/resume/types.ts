// frontend/lib/resume/types.ts

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface Education { /* match backend schema */ }
export interface Experience { /* match backend schema */ }
export interface Project { /* match backend schema */ }
export interface Skill { name: string; level: number; category: string }
export interface Certificate { /* match backend schema */ }

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certificates: Certificate[];
  
}
