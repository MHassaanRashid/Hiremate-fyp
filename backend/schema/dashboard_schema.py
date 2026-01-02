# backend/schema/dashboard_schema.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# Response schemas (view models)

class CandidateProfileSchema(BaseModel):
    """Candidate profile for dashboard"""
    name: str
    profileCompletion: int
    avatar: Optional[str] = None
    interview_eligible: Optional[bool] = False
    last_test_language: Optional[str] = None
    
    class Config:
        from_attributes = True


class DashboardStatsSchema(BaseModel):
    """Dashboard statistics"""
    applicationsSubmitted: int
    interviewsScheduled: int
    profileViews: int
    profileScore: int
    # Trend fields (percentage change from previous period)
    applicationsTrend: Optional[float] = None
    profileViewsTrend: Optional[float] = None
    interviewsTrend: Optional[float] = None
    profileScoreTrend: Optional[float] = None
    
    class Config:
        from_attributes = True


class ApplicationSchema(BaseModel):
    """Application response schema"""
    id: str
    jobTitle: str
    company: str
    date: str  # ISO date string
    status: str  # pending, reviewing, shortlisted, rejected, accepted
    
    class Config:
        from_attributes = True


class RecommendedJobSchema(BaseModel):
    """Recommended job response schema"""
    id: str
    title: str
    company: str
    matchPercentage: int
    logo: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    
    class Config:
        from_attributes = True


class InterviewSchema(BaseModel):
    """Interview response schema"""
    id: str
    position: str
    company: str
    date: str  # ISO date string
    time: str
    type: str  # online, in-person, phone
    meetingLink: Optional[str] = None
    
    class Config:
        from_attributes = True


class ProfileStrengthSchema(BaseModel):
    """Profile strength response schema"""
    resume: bool
    skills: bool
    photo: bool
    experience: bool
    education: bool
    certifications: bool
    
    class Config:
        from_attributes = True


class ActivityItemSchema(BaseModel):
    """Activity item response schema"""
    id: str
    type: str  # view, status_change, message, recommendation
    message: str
    timestamp: str  # Formatted like "2 hours ago"
    
    class Config:
        from_attributes = True


class DashboardDataSchema(BaseModel):
    """Complete dashboard data response"""
    profile: CandidateProfileSchema
    stats: DashboardStatsSchema
    applications: List[ApplicationSchema]
    recommendedJobs: List[RecommendedJobSchema]
    interviews: List[InterviewSchema]
    profileStrength: ProfileStrengthSchema
    activity: List[ActivityItemSchema]
    
    class Config:
        from_attributes = True


# Request schemas (if needed)

class CreateApplicationRequest(BaseModel):
    """Create new application"""
    job_title: str
    company_name: str
    job_id: Optional[str] = None


class UpdateApplicationStatusRequest(BaseModel):
    """Update application status"""
    status: str = Field(..., pattern='^(pending|reviewing|shortlisted|rejected|accepted)$')


class CreateInterviewRequest(BaseModel):
    """Create new interview"""
    application_id: Optional[str] = None
    position: str
    company: str
    interview_date: str  # ISO date string
    interview_time: str
    type: str = Field(..., pattern='^(online|in-person|phone)$')
    meeting_link: Optional[str] = None
    notes: Optional[str] = None


class UpdateProfileStrengthRequest(BaseModel):
    """Update profile strength"""
    has_resume: Optional[bool] = None
    has_skills: Optional[bool] = None
    has_photo: Optional[bool] = None
    has_experience: Optional[bool] = None
    has_education: Optional[bool] = None
    has_certifications: Optional[bool] = None
