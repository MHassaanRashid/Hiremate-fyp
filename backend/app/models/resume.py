from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.core.config import Base
import uuid

class Resume(Base):
    __tablename__ = "resume"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    personal_info_json = Column(JSONB, nullable=True, default={})
    education_json = Column(JSONB, nullable=True, default=[])
    experience_json = Column(JSONB, nullable=True, default=[])
    projects_json = Column(JSONB, nullable=True, default=[])
    skills_json = Column(JSONB, nullable=True, default=[])
    certificates_json = Column(JSONB, nullable=True, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
