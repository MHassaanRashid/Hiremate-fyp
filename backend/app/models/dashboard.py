# backend/app/models/dashboard.py

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Text, CheckConstraint, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid


class Application(Base):
    """Job applications table"""
    __tablename__ = "applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)  # References auth.users via profiles.user_id
    job_id = Column(UUID(as_uuid=True), nullable=True)
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    job_type = Column(String(50), nullable=True)
    applied_date = Column(Date, nullable=False, server_default=func.current_date())
    status = Column(String(50), default='pending', nullable=False)
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint(status.in_(['pending', 'under_review', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn']), name='check_application_status'),
        Index('idx_applications_user', 'user_id'),
        Index('idx_applications_status', 'status'),
    )


class Interview(Base):
    """Interviews table"""
    __tablename__ = "interviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)  # References auth.users via profiles.user_id
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete='SET NULL'), nullable=True)
    company_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    interview_type = Column(String(100), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(String(50), nullable=False)
    duration_minutes = Column(Integer, default=60)
    location = Column(Text, nullable=True)
    interviewer_name = Column(String(255), nullable=True)
    interviewer_email = Column(String(255), nullable=True)
    status = Column(String(50), default='scheduled', nullable=False)
    notes = Column(Text, nullable=True)
    preparation_notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint(interview_type.in_(['phone', 'video', 'in-person', 'technical', 'hr', 'final']), name='check_interview_type'),
        CheckConstraint(status.in_(['scheduled', 'completed', 'cancelled', 'rescheduled']), name='check_interview_status'),
        Index('idx_interviews_user', 'user_id'),
        Index('idx_interviews_date', 'scheduled_date'),
    )


class RecommendedJob(Base):
    """Recommended jobs table"""
    __tablename__ = "recommended_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)  # References auth.users via profiles.user_id
    job_id = Column(UUID(as_uuid=True), nullable=True)
    company_name = Column(String(255), nullable=False)
    company_logo = Column(String(500), nullable=True)
    job_title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    job_type = Column(String(50), nullable=True)
    experience_level = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    match_score = Column(Integer, default=0)
    posted_date = Column(Date, nullable=True)
    is_saved = Column(Boolean, default=False)
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('match_score >= 0 AND match_score <= 100', name='check_match_score'),
        Index('idx_recommended_jobs_user', 'user_id'),
        Index('idx_recommended_jobs_match_score', 'match_score'),
    )


class ProfileView(Base):
    """Profile views table"""
    __tablename__ = "profile_views"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)  # References auth.users via profiles.user_id
    viewer_type = Column(String(50), nullable=False)
    viewer_id = Column(UUID(as_uuid=True), nullable=True)
    viewer_name = Column(String(255), nullable=True)
    viewer_company = Column(String(255), nullable=True)
    viewed_date = Column(Date, nullable=False, server_default=func.current_date())
    view_count = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_profile_views_user', 'user_id'),
        Index('idx_profile_views_date', 'viewed_date'),
    )


class ProfileStrength(Base):
    """Candidate profile strength table"""
    __tablename__ = "candidate_profile_strength"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, unique=True, nullable=False)  # References auth.users via profiles.user_id
    overall_score = Column(Integer, default=0)
    basic_info_score = Column(Integer, default=0)
    resume_score = Column(Integer, default=0)
    skills_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    education_score = Column(Integer, default=0)
    certifications_score = Column(Integer, default=0)
    has_profile_picture = Column(Boolean, default=False)
    has_resume = Column(Boolean, default=False)
    has_bio = Column(Boolean, default=False)
    has_skills = Column(Boolean, default=False)
    has_experience = Column(Boolean, default=False)
    has_education = Column(Boolean, default=False)
    has_certifications = Column(Boolean, default=False)
    has_portfolio = Column(Boolean, default=False)
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('overall_score >= 0 AND overall_score <= 100', name='check_overall_score'),
        Index('idx_profile_strength_user', 'user_id'),
    )


class Activity(Base):
    """Activities/Notifications table"""
    __tablename__ = "activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)  # References auth.users via profiles.user_id
    activity_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(UUID(as_uuid=True), nullable=True)
    icon = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    priority = Column(String(20), default='normal')
    activity_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_activities_user', 'user_id'),
        Index('idx_activities_date', 'activity_date'),
        Index('idx_activities_is_read', 'is_read'),
    )


# Note: We don't need a separate Candidate table anymore since we're using the profiles table
# The profiles table already exists with columns: id, user_id, role, full_name, email, etc.
# All dashboard tables now reference user_id directly instead of candidate_id
