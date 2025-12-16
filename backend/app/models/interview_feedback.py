from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid

class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(Integer, nullable=True) # Schema says integer
    skill = Column(Text, nullable=False)
    score = Column(Integer, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
