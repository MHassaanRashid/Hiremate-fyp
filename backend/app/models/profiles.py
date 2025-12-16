from sqlalchemy import Column, Integer, String, Boolean, JSONB, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base
import uuid

class Profiles(Base):
    __tablename__ = "profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    role = Column(Text, nullable=False)
    full_name = Column(Text, nullable=True)
    email = Column(Text, nullable=False)
    phone = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    ai_score = Column(Integer, default=0)
    resume_completed = Column(Boolean, default=False)
    experience = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    skills = Column(JSONB, nullable=True)
    avatar_url = Column(Text, nullable=True)
    portfolio = Column(Text, nullable=True)
    linkedin = Column(Text, nullable=True)
    github = Column(Text, nullable=True)
