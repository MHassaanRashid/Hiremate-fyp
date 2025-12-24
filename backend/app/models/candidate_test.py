from sqlalchemy import Column, String, Integer, Boolean, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.core.config import Base
import uuid

class CandidateTest(Base):
    """Test sessions taken by candidates"""
    __tablename__ = "candidate_tests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False)
    language = Column(String(50), nullable=False)
    test_type = Column(String(50), default='ai_assessment')
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer, default=15)
    status = Column(String(50), default='in_progress')
    total_questions = Column(Integer, default=10)
    correct_answers = Column(Integer, default=0)
    score_percentage = Column(Numeric(5, 2), default=0.00)
    passed = Column(Boolean, default=False)
    
    # AI Evaluation Fields (nullable until AI implemented)
    ai_evaluation_status = Column(String(50), default='pending')
    ai_code_quality_score = Column(Numeric(3, 2))
    ai_problem_solving_score = Column(Numeric(3, 2))
    ai_efficiency_score = Column(Numeric(3, 2))
    ai_feedback = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TestQuestion(Base):
    """Questions for each test session"""
    __tablename__ = "test_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey('candidate_tests.id', ondelete='CASCADE'), nullable=False)
    question_number = Column(Integer, nullable=False)
    question_type = Column(String(50), nullable=False)  # 'mcq', 'coding', 'debugging'
    question_text = Column(Text, nullable=False)
    
    # For MCQ questions
    options = Column(JSONB)
    correct_option = Column(Integer)
    
    # For coding questions
    code_template = Column(Text)
    test_cases = Column(JSONB)
    
    # Metadata
    ai_generated = Column(Boolean, default=False)
    difficulty_level = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TestAnswer(Base):
    """Candidate answers to test questions"""
    __tablename__ = "test_answers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey('candidate_tests.id', ondelete='CASCADE'), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey('test_questions.id', ondelete='CASCADE'), nullable=False)
    
    # Answer data
    answer_text = Column(Text)
    selected_option = Column(Integer)
    code_submission = Column(Text)
    
    # Evaluation
    is_correct = Column(Boolean)
    points_earned = Column(Numeric(5, 2), default=0)
    ai_evaluation = Column(JSONB)
    
    # Timing
    time_spent_seconds = Column(Integer)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())


class TestLanguage(Base):
    """Configuration for available programming language tests"""
    __tablename__ = "test_languages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    language_name = Column(String(50), unique=True, nullable=False)
    language_code = Column(String(10), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    icon_url = Column(String(500))
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    difficulty_levels = Column(JSONB, default=['easy', 'medium', 'hard'])
    default_duration_minutes = Column(Integer, default=15)
    default_question_count = Column(Integer, default=10)
    passing_score_percentage = Column(Numeric(5, 2), default=80.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
