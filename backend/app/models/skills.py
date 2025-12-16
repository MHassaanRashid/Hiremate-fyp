from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import Base

class Skills(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True) # Serial
    user_id = Column(UUID(as_uuid=True), nullable=True)
    skill = Column(String, nullable=False)
    score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
