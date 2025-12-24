from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SectionScore(BaseModel):
    """Score for individual resume section"""
    section_name: str
    score: int = Field(..., ge=0, le=100)
    status: str  # 'excellent', 'good', 'needs_improvement', 'poor'
    feedback: Optional[str] = None


class Suggestion(BaseModel):
    """Improvement suggestion for resume"""
    id: Optional[str] = None
    category: str  # 'Skills', 'Experience', 'Education', 'Formatting', 'Content', 'ATS'
    priority: str  # 'high', 'medium', 'low'
    message: str
    impact: Optional[str] = None  # e.g., '+8 points', 'Critical for ATS'
    action: Optional[str] = None  # Suggested action to take
    section: Optional[str] = None  # Which resume section this relates to


class ATSCompatibility(BaseModel):
    """ATS compatibility analysis"""
    score: int = Field(..., ge=0, le=100)
    passed: bool
    issues: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class KeywordAnalysis(BaseModel):
    """Keyword matching analysis"""
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    keyword_density: Optional[float] = None
    suggestions: List[str] = Field(default_factory=list)


class ResumeAnalysisRequest(BaseModel):
    """Request to analyze resume"""
    job_id: Optional[str] = None  # Optional: analyze against specific job
    include_ai_analysis: bool = True  # Whether to use AI for deep analysis
    focus_areas: Optional[List[str]] = None  # Specific areas to focus on


class ResumeAnalysisResponse(BaseModel):
    """Complete resume analysis results"""
    id: str
    user_id: str
    resume_id: Optional[str] = None
    job_id: Optional[str] = None
    
    # Overall Scores
    overall_score: int = Field(..., ge=0, le=100)
    completeness_score: Optional[int] = Field(None, ge=0, le=100)
    ats_score: Optional[int] = Field(None, ge=0, le=100)
    keyword_score: Optional[int] = Field(None, ge=0, le=100)
    formatting_score: Optional[int] = Field(None, ge=0, le=100)
    content_quality_score: Optional[int] = Field(None, ge=0, le=100)
    
    # Detailed Analysis
    section_scores: List[SectionScore] = Field(default_factory=list)
    suggestions: List[Suggestion] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    
    # ATS & Keywords (if applicable)
    ats_compatibility: Optional[ATSCompatibility] = None
    keyword_analysis: Optional[KeywordAnalysis] = None
    
    # Metadata
    analyzed_at: datetime
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AnalysisHistoryItem(BaseModel):
    """Single item in analysis history"""
    id: str
    overall_score: int
    analyzed_at: datetime
    job_id: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AnalysisHistoryResponse(BaseModel):
    """Response containing analysis history"""
    analyses: List[AnalysisHistoryItem] = Field(default_factory=list)
    total_count: int
    improvement_trend: Optional[str] = None  # 'improving', 'stable', 'declining'
    average_score: Optional[float] = None


class QuickAnalysisResponse(BaseModel):
    """Quick analysis response with just key metrics"""
    overall_score: int
    top_suggestions: List[Suggestion] = Field(default_factory=list, max_items=5)
    critical_issues: List[str] = Field(default_factory=list)
    ats_passed: bool
