from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Any, Optional
from schema.resume_analyzer_schema import (
    ResumeAnalysisRequest, 
    ResumeAnalysisResponse,
    AnalysisHistoryResponse,
    QuickAnalysisResponse
)
from service.resume_analyzer_service import ResumeAnalyzerService
from service.resume_service import ResumeService

router = APIRouter()


# ----------------------------
# Helper function: Get current user
# ----------------------------
async def get_current_user(authorization: str = Header(None)) -> Any:
    """Extract and validate user from authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    token = authorization.split(" ")[1]
    try:
        from app.core.extension import supabase_client as supabase
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None) or user_response.get("user")
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


# ----------------------------
# Routes
# ----------------------------

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    request: ResumeAnalysisRequest,
    user=Depends(get_current_user)
):
    """
    Analyze the current user's resume
    
    Performs comprehensive analysis including:
    - Completeness scoring
    - ATS compatibility check
    - Formatting quality
    - Content quality (AI-powered if available)
    - Actionable suggestions
    """
    try:
        # Get user's resume
        resume_result = ResumeService.get_resume(user)
        
        if not resume_result.get('resume') or not resume_result['resume'].get('resumeData'):
            raise HTTPException(
                status_code=404, 
                detail="No resume found. Please create a resume first."
            )
        
        resume_data = resume_result['resume']['resumeData']
        
        # Convert to database format for analysis
        db_format_resume = {
            'personal_info_json': resume_data.get('personalInfo', {}),
            'education_json': resume_data.get('education', []),
            'experience_json': resume_data.get('experience', []),
            'skills_json': resume_data.get('skills', []),
            'projects_json': resume_data.get('projects', []),
            'certificates_json': resume_data.get('certificates', [])
        }
        
        # Perform analysis
        analysis = ResumeAnalyzerService.analyze_resume(
            user=user,
            resume_data=db_format_resume,
            job_id=request.job_id,
            include_ai=request.include_ai_analysis
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/analyze-for-job/{job_id}", response_model=ResumeAnalysisResponse)
async def analyze_resume_for_job(
    job_id: str,
    request: ResumeAnalysisRequest,
    user=Depends(get_current_user)
):
    """
    Analyze resume specifically for a job posting
    
    Includes keyword matching and job-specific recommendations
    """
    try:
        # Get user's resume
        resume_result = ResumeService.get_resume(user)
        
        if not resume_result.get('resume') or not resume_result['resume'].get('resumeData'):
            raise HTTPException(
                status_code=404,
                detail="No resume found. Please create a resume first."
            )
        
        resume_data = resume_result['resume']['resumeData']
        
        # Convert to database format
        db_format_resume = {
            'personal_info_json': resume_data.get('personalInfo', {}),
            'education_json': resume_data.get('education', []),
            'experience_json': resume_data.get('experience', []),
            'skills_json': resume_data.get('skills', []),
            'projects_json': resume_data.get('projects', []),
            'certificates_json': resume_data.get('certificates', [])
        }
        
        # Perform job-specific analysis
        analysis = ResumeAnalyzerService.analyze_resume(
            user=user,
            resume_data=db_format_resume,
            job_id=job_id,
            include_ai=request.include_ai_analysis
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Job-specific analysis failed: {str(e)}"
        )


@router.get("/history", response_model=AnalysisHistoryResponse)
async def get_analysis_history(
    limit: int = 10,
    user=Depends(get_current_user)
):
    """
    Get user's resume analysis history
    
    Returns past analyses with trend information
    """
    try:
        history = ResumeAnalyzerService.get_analysis_history(
            user_id=user.id,
            limit=limit
        )
        return history
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history: {str(e)}"
        )


@router.get("/latest", response_model=ResumeAnalysisResponse)
async def get_latest_analysis(user=Depends(get_current_user)):
    """
    Get user's most recent resume analysis
    """
    try:
        analysis = ResumeAnalyzerService.get_latest_analysis(user.id)
        
        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="No analysis found. Please analyze your resume first."
            )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch latest analysis: {str(e)}"
        )


@router.get("/quick", response_model=QuickAnalysisResponse)
async def get_quick_analysis(user=Depends(get_current_user)):
    """
    Get a quick analysis with just key metrics
    
    Useful for dashboard widgets or quick checks
    """
    try:
        # Get latest full analysis
        analysis = ResumeAnalyzerService.get_latest_analysis(user.id)
        
        if not analysis:
            # If no analysis exists, create a quick one
            resume_result = ResumeService.get_resume(user)
            
            if not resume_result.get('resume') or not resume_result['resume'].get('resumeData'):
                raise HTTPException(
                    status_code=404,
                    detail="No resume found"
                )
            
            resume_data = resume_result['resume']['resumeData']
            db_format_resume = {
                'personal_info_json': resume_data.get('personalInfo', {}),
                'education_json': resume_data.get('education', []),
                'experience_json': resume_data.get('experience', []),
                'skills_json': resume_data.get('skills', []),
                'projects_json': resume_data.get('projects', []),
                'certificates_json': resume_data.get('certificates', [])
            }
            
            analysis = ResumeAnalyzerService.analyze_resume(
                user=user,
                resume_data=db_format_resume,
                include_ai=False  # Quick analysis without AI
            )
        
        # Extract top suggestions
        top_suggestions = [s for s in analysis.suggestions if s.priority == 'high'][:5]
        if len(top_suggestions) < 5:
            top_suggestions.extend([s for s in analysis.suggestions if s.priority == 'medium'][:5-len(top_suggestions)])
        
        # Extract critical issues
        critical_issues = []
        if analysis.overall_score < 60:
            critical_issues.append("Resume needs significant improvement")
        if analysis.ats_score and analysis.ats_score < 70:
            critical_issues.append("Poor ATS compatibility")
        if analysis.completeness_score and analysis.completeness_score < 70:
            critical_issues.append("Resume is incomplete")
        
        return QuickAnalysisResponse(
            overall_score=analysis.overall_score,
            top_suggestions=top_suggestions,
            critical_issues=critical_issues,
            ats_passed=analysis.ats_compatibility.passed if analysis.ats_compatibility else False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quick analysis failed: {str(e)}"
        )


@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    user=Depends(get_current_user)
):
    """
    Delete a specific analysis record
    """
    try:
        success = ResumeAnalyzerService.delete_analysis(
            user_id=user.id,
            analysis_id=analysis_id
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Analysis not found or already deleted"
            )
        
        return {"message": "Analysis deleted successfully", "analysis_id": analysis_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete analysis: {str(e)}"
        )
