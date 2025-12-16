from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid

class ProfileViews(Base):
    """Profile views table"""
    __tablename__ = "profile_views"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), nullable=False)
    viewer_type = Column(String(50), nullable=False)
    viewer_id = Column(UUID(as_uuid=True), nullable=True)
    viewer_name = Column(String(255), nullable=True)
    viewer_company = Column(String(255), nullable=True)
    viewed_date = Column(Date, nullable=False, server_default=func.current_date())
    view_count = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=False)
    
    __table_args__ = (
        Index('idx_profile_views_candidate_id', 'candidate_id'),
        Index('idx_profile_views_viewed_date', 'viewed_date'),
        Index('idx_profile_views_viewer_type', 'viewer_type'),
    )
