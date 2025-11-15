# backend/app/schemas/resume.py

from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class PersonalInfo(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: Optional[str] = None

class ResumeData(BaseModel):
    personalInfo: PersonalInfo
    education: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    skills: Optional[List[Dict[str, Any]]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    certificates: Optional[List[Dict[str, Any]]] = []
    resume_uploaded: bool = True
