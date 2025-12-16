from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid

class Activities(Base):
    """Activities/Notifications table"""
    __tablename__ = "activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), nullable=False)
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
    user_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id'), nullable=False)
    
    __table_args__ = (
        Index('idx_activities_candidate_id', 'candidate_id'),
        Index('idx_activities_activity_date', 'activity_date'),
        Index('idx_activities_is_read', 'is_read'),
        Index('idx_activities_activity_type', 'activity_type'),
    )
