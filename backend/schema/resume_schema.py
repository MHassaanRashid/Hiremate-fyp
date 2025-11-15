from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class PersonalInfo(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: Optional[str] = None


class Education(BaseModel):
    id: Optional[str] = None
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    graduationYear: Optional[str] = None
    gpa: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    startDate: Optional[str] = None
    current: Optional[bool] = None


class Experience(BaseModel):
    id: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    current: Optional[bool] = None
    location: Optional[str] = None
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    employmentType: Optional[str] = None
    salary: Optional[str] = None


class Project(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = None
    github: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    status: Optional[str] = None
    teamSize: Optional[int] = None
    role: Optional[str] = None


class Skill(BaseModel):
    name: Optional[str] = None
    level: Optional[int] = 3
    category: Optional[str] = None
    years: Optional[int] = None
    certified: Optional[bool] = None


class Certificate(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None
    expiryDate: Optional[str] = None
    credentialId: Optional[str] = None
    verificationLink: Optional[str] = None
    status: Optional[str] = None


class ResumeData(BaseModel):
    personalInfo: Optional[PersonalInfo] = None
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    skills: List[Skill] = Field(default_factory=list)
    certificates: List[Certificate] = Field(default_factory=list)



class ResumeRequest(BaseModel):
    resumeData: Optional[ResumeData] = None


class SectionSaveRequest(BaseModel):
    section: str
    data: Dict[str, Any]
