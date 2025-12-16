from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Text, ForeignKey, Index, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid

class RecommendedJobs(Base):
    """Recommended jobs table"""
    __tablename__ = "recommended_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), nullable=False)
    job_id = Column(UUID(as_uuid=True), nullable=False)
    company_name = Column(String(255), nullable=False)
    company_logo = Column(String(500), nullable=True)
    job_title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    job_type = Column(String(50), nullable=True)
    experience_level = Column(String(50), nullable=True)
    skills_required = Column(ARRAY(Text), nullable=True)
    description = Column(Text, nullable=True)
    match_score = Column(Integer, default=0)
    match_reasons = Column(ARRAY(Text), nullable=True)
    posted_date = Column(Date, nullable=True)
    is_saved = Column(Boolean, default=False)
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=False)
    
    __table_args__ = (
        Index('idx_recommended_jobs_candidate_id', 'candidate_id'),
        Index('idx_recommended_jobs_job_id', 'job_id'),
        Index('idx_recommended_jobs_match_score', 'match_score'),
        Index('idx_recommended_jobs_is_saved', 'is_saved'),
    )
