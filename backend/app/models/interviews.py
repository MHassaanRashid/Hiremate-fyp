from sqlalchemy import Column, String, Integer, DateTime, Date, Text, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid

class Interviews(Base):
    """Interviews table"""
    __tablename__ = "interviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey('applications.id', ondelete='SET NULL'), nullable=True)
    company_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    interview_type = Column(String(100), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=60)
    location = Column(String(255), nullable=True)
    interviewer_name = Column(String(255), nullable=True)
    interviewer_email = Column(String(255), nullable=True)
    status = Column(String(50), default='scheduled', nullable=True)
    notes = Column(Text, nullable=True)
    preparation_notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=False)
    
    __table_args__ = (
        Index('idx_interviews_candidate_id', 'candidate_id'),
        Index('idx_interviews_application_id', 'application_id'),
        Index('idx_interviews_scheduled_date', 'scheduled_date'),
        Index('idx_interviews_status', 'status'),
    )
