from sqlalchemy import Column, Integer, Boolean, DateTime, Text, ForeignKey, Index, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid

class CandidateProfileStrength(Base):
    """Candidate profile strength table"""
    __tablename__ = "candidate_profile_strength"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), nullable=False, unique=True)
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
    suggestions = Column(ARRAY(Text), nullable=True)
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=False, unique=True)
    
    __table_args__ = (
        Index('idx_profile_strength_candidate_id', 'candidate_id'),
        Index('idx_profile_strength_overall_score', 'overall_score'),
    )
