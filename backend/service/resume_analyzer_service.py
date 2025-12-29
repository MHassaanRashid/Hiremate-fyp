from datetime import datetime
from typing import Dict, List, Optional, Any
import json
import uuid
from app.core.extension import supabase_client as supabase
from schema.resume_analyzer_schema import (
    SectionScore, Suggestion, ATSCompatibility, KeywordAnalysis,
    ResumeAnalysisResponse, AnalysisHistoryResponse, AnalysisHistoryItem
)

# Try to import Gemini AI, but don't fail if not available
try:
    from google import genai
    import os
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        AI_AVAILABLE = True
    else:
        AI_AVAILABLE = False
        gemini_client = None
except ImportError:
    AI_AVAILABLE = False
    gemini_client = None


class ResumeAnalyzerService:
    """Service for AI-powered resume analysis"""
    
    @staticmethod
    def analyze_resume(user, resume_data: Dict[str, Any], job_id: Optional[str] = None, include_ai: bool = True) -> ResumeAnalysisResponse:
        """
        Main method to analyze a resume
        
        Args:
            user: Authenticated user object
            resume_data: Complete resume data dictionary
            job_id: Optional job ID to analyze against
            include_ai: Whether to include AI-powered analysis
            
        Returns:
            ResumeAnalysisResponse with complete analysis
        """
        # Calculate individual scores
        completeness_score = ResumeAnalyzerService._calculate_completeness_score(resume_data)
        ats_score = ResumeAnalyzerService._calculate_ats_score(resume_data)
        formatting_score = ResumeAnalyzerService._calculate_formatting_score(resume_data)
        
        # Get job description if job_id provided
        job_description = None
        keyword_score = None
        keyword_analysis = None
        
        if job_id:
            job_data = ResumeAnalyzerService._get_job_description(job_id)
            if job_data:
                job_description = job_data.get('description', '')
                keyword_analysis = ResumeAnalyzerService._analyze_keywords(resume_data, job_description)
                keyword_score = keyword_analysis.score if hasattr(keyword_analysis, 'score') else 0
        
        # AI-powered content quality analysis
        content_quality_score = 75  # Default
        ai_suggestions = []
        strengths = []
        weaknesses = []
        
        if include_ai and AI_AVAILABLE and gemini_client:
            ai_analysis = ResumeAnalyzerService._analyze_with_ai(resume_data, job_description)
            content_quality_score = ai_analysis.get('content_quality_score', 75)
            ai_suggestions = ai_analysis.get('suggestions', [])
            strengths = ai_analysis.get('strengths', [])
            weaknesses = ai_analysis.get('weaknesses', [])
        else:
            # Fallback to rule-based analysis
            rule_based = ResumeAnalyzerService._rule_based_analysis(resume_data)
            content_quality_score = rule_based.get('content_quality_score', 75)
            ai_suggestions = rule_based.get('suggestions', [])
            strengths = rule_based.get('strengths', [])
            weaknesses = rule_based.get('weaknesses', [])
        
        # Calculate overall score (weighted average)
        scores = [
            (completeness_score, 0.25),
            (ats_score, 0.20),
            (formatting_score, 0.15),
            (content_quality_score, 0.25),
        ]
        
        if keyword_score is not None:
            scores.append((keyword_score, 0.15))
        
        total_weight = sum(weight for _, weight in scores)
        overall_score = int(sum(score * weight for score, weight in scores) / total_weight)
        
        # Generate section scores
        section_scores = ResumeAnalyzerService._calculate_section_scores(resume_data)
        
        # Generate suggestions
        all_suggestions = ResumeAnalyzerService._generate_suggestions(
            completeness_score, ats_score, formatting_score, 
            content_quality_score, resume_data, ai_suggestions
        )
        
        # Create ATS compatibility object
        ats_compatibility = ATSCompatibility(
            score=ats_score,
            passed=ats_score >= 70,
            issues=ResumeAnalyzerService._get_ats_issues(resume_data),
            recommendations=ResumeAnalyzerService._get_ats_recommendations(resume_data)
        )
        
        # Save to database
        analysis_id = str(uuid.uuid4())
        db_record = {
            'id': analysis_id,
            'user_id': user.id,
            'resume_id': user.id,  # Using user.id as resume_id
            'job_id': job_id,
            'overall_score': overall_score,
            'completeness_score': completeness_score,
            'ats_score': ats_score,
            'keyword_score': keyword_score,
            'formatting_score': formatting_score,
            'content_quality_score': content_quality_score,
            'suggestions': json.dumps([s.dict() for s in all_suggestions]),
            'missing_keywords': keyword_analysis.missing_keywords if keyword_analysis else [],
            'strengths': strengths,
            'weaknesses': weaknesses,
            'analyzed_sections': json.dumps([s.dict() for s in section_scores]),
            'analyzed_at': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        supabase.table('resume_analysis').insert(db_record).execute()
        
        # Return response
        return ResumeAnalysisResponse(
            id=analysis_id,
            user_id=user.id,
            resume_id=user.id,
            job_id=job_id,
            overall_score=overall_score,
            completeness_score=completeness_score,
            ats_score=ats_score,
            keyword_score=keyword_score,
            formatting_score=formatting_score,
            content_quality_score=content_quality_score,
            section_scores=section_scores,
            suggestions=all_suggestions,
            strengths=strengths,
            weaknesses=weaknesses,
            missing_keywords=keyword_analysis.missing_keywords if keyword_analysis else [],
            ats_compatibility=ats_compatibility,
            keyword_analysis=keyword_analysis,
            analyzed_at=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
    
    @staticmethod
    def _calculate_completeness_score(resume_data: Dict[str, Any]) -> int:
        """Calculate resume completeness score (0-100)"""
        score = 0
        
        # Personal Info (30 points)
        personal_info = resume_data.get('personal_info_json', {})
        required_fields = ['fullName', 'email', 'phone', 'location']
        optional_fields = ['linkedin', 'github', 'website', 'summary']
        
        filled_required = sum(1 for field in required_fields if personal_info.get(field))
        score += int((filled_required / len(required_fields)) * 20)
        
        filled_optional = sum(1 for field in optional_fields if personal_info.get(field))
        score += int((filled_optional / len(optional_fields)) * 10)
        
        # Education (20 points)
        education = resume_data.get('education_json', [])
        if len(education) >= 1:
            score += 15
            if len(education) >= 2:
                score += 5
        
        # Experience (25 points)
        experience = resume_data.get('experience_json', [])
        if len(experience) >= 1:
            score += 15
            if len(experience) >= 2:
                score += 5
            if len(experience) >= 3:
                score += 5
        
        # Skills (15 points)
        skills = resume_data.get('skills_json', [])
        if len(skills) >= 3:
            score += 10
            if len(skills) >= 6:
                score += 5
        
        # Projects (10 points)
        projects = resume_data.get('projects_json', [])
        if len(projects) >= 1:
            score += 5
            if len(projects) >= 2:
                score += 5
        
        return min(score, 100)
    
    @staticmethod
    def _calculate_ats_score(resume_data: Dict[str, Any]) -> int:
        """Calculate ATS compatibility score (0-100)"""
        score = 100
        issues = []
        
        personal_info = resume_data.get('personal_info_json', {})
        
        # Check for required contact information
        if not personal_info.get('email'):
            score -= 20
            issues.append('Missing email address')
        
        if not personal_info.get('phone'):
            score -= 15
            issues.append('Missing phone number')
        
        # Check for standard sections
        if not resume_data.get('experience_json'):
            score -= 20
            issues.append('Missing work experience section')
        
        if not resume_data.get('education_json'):
            score -= 15
            issues.append('Missing education section')
        
        if not resume_data.get('skills_json'):
            score -= 15
            issues.append('Missing skills section')
        
        # Check for proper formatting in experience
        experience = resume_data.get('experience_json', [])
        for exp in experience:
            if not exp.get('company') or not exp.get('position'):
                score -= 5
                break
        
        return max(score, 0)
    
    @staticmethod
    def _calculate_formatting_score(resume_data: Dict[str, Any]) -> int:
        """Calculate formatting quality score (0-100)"""
        score = 100
        
        personal_info = resume_data.get('personal_info_json', {})
        
        # Check for summary/objective
        if personal_info.get('summary'):
            summary_length = len(personal_info['summary'])
            if 50 <= summary_length <= 300:
                score += 0  # Good length
            elif summary_length < 50:
                score -= 10  # Too short
            elif summary_length > 500:
                score -= 10  # Too long
        else:
            score -= 15  # Missing summary
        
        # Check experience descriptions
        experience = resume_data.get('experience_json', [])
        for exp in experience:
            if exp.get('description'):
                desc_length = len(exp['description'])
                if desc_length < 50:
                    score -= 5
            else:
                score -= 5
        
        # Check for achievements in experience
        has_achievements = any(exp.get('achievements') for exp in experience)
        if not has_achievements and experience:
            score -= 10
        
        return max(min(score, 100), 0)
    
    @staticmethod
    def _calculate_section_scores(resume_data: Dict[str, Any]) -> List[SectionScore]:
        """Calculate individual section scores"""
        sections = []
        
        # Personal Info
        personal_info = resume_data.get('personal_info_json', {})
        required_fields = ['fullName', 'email', 'phone', 'location']
        filled = sum(1 for field in required_fields if personal_info.get(field))
        personal_score = int((filled / len(required_fields)) * 100)
        
        sections.append(SectionScore(
            section_name='Personal Information',
            score=personal_score,
            status=ResumeAnalyzerService._get_status(personal_score),
            feedback=f'{filled}/{len(required_fields)} required fields completed'
        ))
        
        # Experience
        experience = resume_data.get('experience_json', [])
        exp_score = min(len(experience) * 33, 100)
        sections.append(SectionScore(
            section_name='Work Experience',
            score=exp_score,
            status=ResumeAnalyzerService._get_status(exp_score),
            feedback=f'{len(experience)} experience entries'
        ))
        
        # Education
        education = resume_data.get('education_json', [])
        edu_score = min(len(education) * 50, 100)
        sections.append(SectionScore(
            section_name='Education',
            score=edu_score,
            status=ResumeAnalyzerService._get_status(edu_score),
            feedback=f'{len(education)} education entries'
        ))
        
        # Skills
        skills = resume_data.get('skills_json', [])
        skill_score = min(len(skills) * 15, 100)
        sections.append(SectionScore(
            section_name='Skills',
            score=skill_score,
            status=ResumeAnalyzerService._get_status(skill_score),
            feedback=f'{len(skills)} skills listed'
        ))
        
        # Projects
        projects = resume_data.get('projects_json', [])
        project_score = min(len(projects) * 40, 100)
        sections.append(SectionScore(
            section_name='Projects',
            score=project_score,
            status=ResumeAnalyzerService._get_status(project_score),
            feedback=f'{len(projects)} projects listed'
        ))
        
        return sections
    
    @staticmethod
    def _get_status(score: int) -> str:
        """Convert score to status string"""
        if score >= 85:
            return 'excellent'
        elif score >= 70:
            return 'good'
        elif score >= 50:
            return 'needs_improvement'
        else:
            return 'poor'
    
    @staticmethod
    def _generate_suggestions(
        completeness: int, ats: int, formatting: int, 
        content_quality: int, resume_data: Dict[str, Any],
        ai_suggestions: List[Dict[str, Any]]
    ) -> List[Suggestion]:
        """Generate actionable improvement suggestions"""
        suggestions = []
        
        # Add AI suggestions first
        for ai_sug in ai_suggestions:
            suggestions.append(Suggestion(**ai_sug))
        
        # Completeness suggestions
        if completeness < 80:
            personal_info = resume_data.get('personal_info_json', {})
            if not personal_info.get('summary'):
                suggestions.append(Suggestion(
                    id=str(uuid.uuid4()),
                    category='Content',
                    priority='high',
                    message='Add a professional summary to introduce yourself',
                    impact='+10 points',
                    action='add_summary',
                    section='personalInfo'
                ))
            
            if len(resume_data.get('skills_json', [])) < 5:
                suggestions.append(Suggestion(
                    id=str(uuid.uuid4()),
                    category='Skills',
                    priority='high',
                    message='Add more relevant skills (aim for at least 6-8)',
                    impact='+8 points',
                    action='add_skills',
                    section='skills'
                ))
        
        # ATS suggestions
        if ats < 70:
            suggestions.append(Suggestion(
                id=str(uuid.uuid4()),
                category='ATS',
                priority='high',
                message='Improve ATS compatibility by adding missing required fields',
                impact='Critical for ATS',
                action='fix_ats_issues'
            ))
        
        # Experience suggestions
        experience = resume_data.get('experience_json', [])
        if experience:
            has_achievements = any(exp.get('achievements') for exp in experience)
            if not has_achievements:
                suggestions.append(Suggestion(
                    id=str(uuid.uuid4()),
                    category='Experience',
                    priority='medium',
                    message='Add quantifiable achievements to your work experience',
                    impact='+12 points',
                    action='add_achievements',
                    section='experience'
                ))
        
        # Sort by priority
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        suggestions.sort(key=lambda x: priority_order.get(x.priority, 3))
        
        return suggestions[:10]  # Return top 10 suggestions
    
    @staticmethod
    def _analyze_with_ai(resume_data: Dict[str, Any], job_description: Optional[str] = None) -> Dict[str, Any]:
        """Use Gemini AI to analyze resume content quality"""
        if not AI_AVAILABLE or not gemini_client:
            return ResumeAnalyzerService._rule_based_analysis(resume_data)
        
        try:
            # Prepare resume text for AI
            resume_text = ResumeAnalyzerService._format_resume_for_ai(resume_data)
            
            # Create prompt
            prompt = f"""Analyze the following resume and provide detailed feedback.

RESUME:
{resume_text}

{f"JOB DESCRIPTION: {job_description}" if job_description else ""}

Provide your analysis in the following JSON format:
{{
  "content_quality_score": <0-100>,
  "strengths": [<list of 3-5 key strengths>],
  "weaknesses": [<list of 3-5 key weaknesses>],
  "suggestions": [
    {{
      "category": "<Skills|Experience|Education|Formatting|Content|ATS>",
      "priority": "<high|medium|low>",
      "message": "<specific actionable suggestion>",
      "impact": "<expected impact>"
    }}
  ]
}}

Focus on:
1. Content quality and clarity
2. Professional presentation
3. Relevance to job market
4. Quantifiable achievements
5. Skill presentation
"""
            
            response = gemini_client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt
            )
            
            # Parse AI response
            response_text = response.text.strip()
            
            # Try to extract JSON from response
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                json_start = response_text.find('```') + 3
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()
            
            ai_result = json.loads(response_text)
            
            # Add IDs to suggestions
            for sug in ai_result.get('suggestions', []):
                sug['id'] = str(uuid.uuid4())
            
            return ai_result
            
        except Exception as e:
            print(f"AI analysis error: {e}")
            return ResumeAnalyzerService._rule_based_analysis(resume_data)
    
    @staticmethod
    def _rule_based_analysis(resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based analysis when AI is not available"""
        score = 70
        strengths = []
        weaknesses = []
        suggestions = []
        
        experience = resume_data.get('experience_json', [])
        education = resume_data.get('education_json', [])
        skills = resume_data.get('skills_json', [])
        projects = resume_data.get('projects_json', [])
        
        # Analyze strengths
        if len(experience) >= 2:
            strengths.append('Good work experience history')
            score += 5
        
        if len(skills) >= 6:
            strengths.append('Comprehensive skill set')
            score += 5
        
        if len(projects) >= 2:
            strengths.append('Strong project portfolio')
            score += 5
        
        # Analyze weaknesses
        if len(experience) < 1:
            weaknesses.append('Limited work experience')
            score -= 10
            suggestions.append({
                'id': str(uuid.uuid4()),
                'category': 'Experience',
                'priority': 'high',
                'message': 'Add work experience or internships',
                'impact': '+15 points'
            })
        
        if len(skills) < 5:
            weaknesses.append('Limited skills listed')
            score -= 5
            suggestions.append({
                'id': str(uuid.uuid4()),
                'category': 'Skills',
                'priority': 'medium',
                'message': 'Add more relevant technical and soft skills',
                'impact': '+8 points'
            })
        
        return {
            'content_quality_score': max(min(score, 100), 0),
            'strengths': strengths[:5],
            'weaknesses': weaknesses[:5],
            'suggestions': suggestions
        }
    
    @staticmethod
    def _format_resume_for_ai(resume_data: Dict[str, Any]) -> str:
        """Format resume data as readable text for AI analysis"""
        lines = []
        
        # Personal Info
        personal_info = resume_data.get('personal_info_json', {})
        if personal_info:
            lines.append("PERSONAL INFORMATION:")
            lines.append(f"Name: {personal_info.get('fullName', 'N/A')}")
            lines.append(f"Email: {personal_info.get('email', 'N/A')}")
            lines.append(f"Phone: {personal_info.get('phone', 'N/A')}")
            lines.append(f"Location: {personal_info.get('location', 'N/A')}")
            if personal_info.get('summary'):
                lines.append(f"Summary: {personal_info['summary']}")
            lines.append("")
        
        # Experience
        experience = resume_data.get('experience_json', [])
        if experience:
            lines.append("WORK EXPERIENCE:")
            for exp in experience:
                lines.append(f"- {exp.get('position', 'N/A')} at {exp.get('company', 'N/A')}")
                lines.append(f"  {exp.get('startDate', '')} - {exp.get('endDate', 'Present')}")
                if exp.get('description'):
                    lines.append(f"  {exp['description']}")
            lines.append("")
        
        # Education
        education = resume_data.get('education_json', [])
        if education:
            lines.append("EDUCATION:")
            for edu in education:
                lines.append(f"- {edu.get('degree', 'N/A')} in {edu.get('field', 'N/A')}")
                lines.append(f"  {edu.get('institution', 'N/A')}")
            lines.append("")
        
        # Skills
        skills = resume_data.get('skills_json', [])
        if skills:
            lines.append("SKILLS:")
            skill_names = [s.get('name', '') for s in skills if s.get('name')]
            lines.append(", ".join(skill_names))
            lines.append("")
        
        # Projects
        projects = resume_data.get('projects_json', [])
        if projects:
            lines.append("PROJECTS:")
            for proj in projects:
                lines.append(f"- {proj.get('name', 'N/A')}")
                if proj.get('description'):
                    lines.append(f"  {proj['description']}")
            lines.append("")
        
        return "\n".join(lines)
    
    @staticmethod
    def _analyze_keywords(resume_data: Dict[str, Any], job_description: str) -> KeywordAnalysis:
        """Analyze keyword matching between resume and job description"""
        # Extract keywords from job description (simple implementation)
        job_keywords = set(word.lower() for word in job_description.split() if len(word) > 4)
        
        # Extract keywords from resume
        resume_text = ResumeAnalyzerService._format_resume_for_ai(resume_data).lower()
        resume_keywords = set(word for word in resume_text.split() if len(word) > 4)
        
        # Find matches and misses
        matched = list(job_keywords & resume_keywords)
        missing = list(job_keywords - resume_keywords)
        
        # Calculate score
        if job_keywords:
            match_rate = len(matched) / len(job_keywords)
            score = int(match_rate * 100)
        else:
            score = 0
        
        return KeywordAnalysis(
            matched_keywords=matched[:20],
            missing_keywords=missing[:20],
            keyword_density=match_rate if job_keywords else 0,
            suggestions=[f"Consider adding '{kw}' to your resume" for kw in missing[:5]]
        )
    
    @staticmethod
    def _get_job_description(job_id: str) -> Optional[Dict[str, Any]]:
        """Fetch job description from database"""
        try:
            result = supabase.table('jobs').select('description, title, required_skills').eq('id', job_id).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            print(f"Error fetching job: {e}")
        return None
    
    @staticmethod
    def _get_ats_issues(resume_data: Dict[str, Any]) -> List[str]:
        """Get list of ATS compatibility issues"""
        issues = []
        
        personal_info = resume_data.get('personal_info_json', {})
        if not personal_info.get('email'):
            issues.append('Missing email address')
        if not personal_info.get('phone'):
            issues.append('Missing phone number')
        if not resume_data.get('experience_json'):
            issues.append('No work experience listed')
        if not resume_data.get('education_json'):
            issues.append('No education listed')
        if not resume_data.get('skills_json'):
            issues.append('No skills listed')
        
        return issues
    
    @staticmethod
    def _get_ats_recommendations(resume_data: Dict[str, Any]) -> List[str]:
        """Get ATS improvement recommendations"""
        recommendations = []
        
        recommendations.append('Use standard section headings (Experience, Education, Skills)')
        recommendations.append('Include relevant keywords from job descriptions')
        recommendations.append('Use a clean, simple format without tables or graphics')
        recommendations.append('Save resume as .docx or .pdf format')
        
        return recommendations
    
    @staticmethod
    def get_analysis_history(user_id: str, limit: int = 10) -> AnalysisHistoryResponse:
        """Get user's resume analysis history"""
        try:
            result = supabase.table('resume_analysis')\
                .select('id, overall_score, analyzed_at, job_id')\
                .eq('user_id', user_id)\
                .order('analyzed_at', desc=True)\
                .limit(limit)\
                .execute()
            
            analyses = []
            for item in result.data:
                analyses.append(AnalysisHistoryItem(
                    id=item['id'],
                    overall_score=item['overall_score'],
                    analyzed_at=datetime.fromisoformat(item['analyzed_at'].replace('Z', '+00:00')),
                    job_id=item.get('job_id')
                ))
            
            # Calculate trend
            trend = None
            avg_score = None
            if len(analyses) >= 2:
                scores = [a.overall_score for a in analyses]
                avg_score = sum(scores) / len(scores)
                
                recent_avg = sum(scores[:len(scores)//2]) / max(len(scores)//2, 1)
                older_avg = sum(scores[len(scores)//2:]) / max(len(scores) - len(scores)//2, 1)
                
                if recent_avg > older_avg + 5:
                    trend = 'improving'
                elif recent_avg < older_avg - 5:
                    trend = 'declining'
                else:
                    trend = 'stable'
            
            return AnalysisHistoryResponse(
                analyses=analyses,
                total_count=len(analyses),
                improvement_trend=trend,
                average_score=avg_score
            )
            
        except Exception as e:
            print(f"Error fetching history: {e}")
            return AnalysisHistoryResponse(analyses=[], total_count=0)
    
    @staticmethod
    def get_latest_analysis(user_id: str) -> Optional[ResumeAnalysisResponse]:
        """Get user's most recent analysis"""
        try:
            result = supabase.table('resume_analysis')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('analyzed_at', desc=True)\
                .limit(1)\
                .execute()
            
            if not result.data:
                return None
            
            data = result.data[0]
            
            # Parse JSON fields
            suggestions = [Suggestion(**s) for s in json.loads(data.get('suggestions', '[]'))]
            section_scores = [SectionScore(**s) for s in json.loads(data.get('analyzed_sections', '[]'))]
            
            return ResumeAnalysisResponse(
                id=data['id'],
                user_id=data['user_id'],
                resume_id=data.get('resume_id'),
                job_id=data.get('job_id'),
                overall_score=data['overall_score'],
                completeness_score=data.get('completeness_score'),
                ats_score=data.get('ats_score'),
                keyword_score=data.get('keyword_score'),
                formatting_score=data.get('formatting_score'),
                content_quality_score=data.get('content_quality_score'),
                section_scores=section_scores,
                suggestions=suggestions,
                strengths=data.get('strengths', []),
                weaknesses=data.get('weaknesses', []),
                missing_keywords=data.get('missing_keywords', []),
                analyzed_at=datetime.fromisoformat(data['analyzed_at'].replace('Z', '+00:00')),
                created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
            )
            
        except Exception as e:
            print(f"Error fetching latest analysis: {e}")
            return None
    
    @staticmethod
    def delete_analysis(user_id: str, analysis_id: str) -> bool:
        """Delete a specific analysis"""
        try:
            supabase.table('resume_analysis')\
                .delete()\
                .eq('id', analysis_id)\
                .eq('user_id', user_id)\
                .execute()
            return True
        except Exception as e:
            print(f"Error deleting analysis: {e}")
            return False
