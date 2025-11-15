# backend/app/models/user.py

from sqlalchemy import Column, Integer, String, Boolean, JSONB, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.config import Base

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resume_uploaded = Column(Boolean, default=False)
    ai_score = Column(Integer, default=0)
    education = Column(JSONB, nullable=True, default=[])
    skills = Column(JSONB, nullable=True, default=[])
    experience = Column(JSONB, nullable=True, default=[])
    analysis = Column(JSONB, nullable=True, default={})
    
    # New fields for resume builder
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    certificates = Column(JSONB, nullable=True, default=[])
    projects = Column(JSONB, nullable=True, default=[])
    languages = Column(JSONB, nullable=True, default=[])
    
    # Relationship with User
    user = relationship("User", back_populates="profile")