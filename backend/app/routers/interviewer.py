from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.extension import supabase_client
from app.routers.auth_dependency import get_current_user
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time

router = APIRouter()

# ==================== SCHEMAS ====================

class InterviewNotes(BaseModel):
    notes: str

class InterviewEvaluation(BaseModel):
    technical_skills: int
    communication: int
    problem_solving: int
    cultural_fit: int
    honesty_score: int
    overall_rating: float
    strengths: str
    weaknesses: str
    weak_concepts: str
    recommendation: str  # strong-hire, hire, maybe, no-hire
    comments: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    expertise: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    availability: Optional[Dict[str, bool]] = None
    preferred_time_slots: Optional[List[str]] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None

# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_interviewer_dashboard(user=Depends(get_current_user)):
    """
    Get interviewer dashboard data including stats and upcoming interviews
    """
    try:
        user_id = user.id
        
        # Get all interviews assigned to this interviewer
        interviews_res = supabase_client.table("interviews").select(
            "*, candidate:profiles!candidate_id(full_name, email, avatar_url)"
        ).eq("interviewer_email", user.email).execute()
        
        all_interviews = interviews_res.data or []
        
        # Calculate stats
        total_interviews = len(all_interviews)
        upcoming = [i for i in all_interviews if i.get("status") == "scheduled"]
        completed_this_month = [
            i for i in all_interviews 
            if i.get("status") == "completed" and 
            datetime.fromisoformat(i.get("created_at", "")).month == datetime.now().month
        ]
        
        # Calculate average rating from evaluations
        import json
        ratings = []
        for interview in all_interviews:
            if interview.get("feedback"):
                try:
                    feedback = json.loads(interview["feedback"])
                    if "overallRating" in feedback:
                        ratings.append(feedback["overallRating"])
                except:
                    pass
        
        average_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0
        
        # Count pending reviews (completed but no feedback)
        pending_reviews = len([
            i for i in all_interviews 
            if i.get("status") == "completed" and not i.get("feedback")
        ])
        
        # Get upcoming interviews (next 7 days)
        upcoming_interviews = []
        for interview in upcoming[:5]:  # Limit to 5
            candidate = interview.get("candidate", {})
            
            # Parse scheduled_at to get date and time
            scheduled_at = interview.get("scheduled_at", "")
            try:
                dt = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
                scheduled_date = dt.date().isoformat()
                scheduled_time = dt.time().isoformat()
            except:
                scheduled_date = ""
                scheduled_time = ""
            
            upcoming_interviews.append({
                "id": interview["id"],
                "candidateName": candidate.get("full_name", "Unknown"),
                "candidateEmail": candidate.get("email", ""),
                "candidateAvatar": candidate.get("avatar_url"),
                "position": interview.get("job_title", ""),
                "company": interview.get("company_name", ""),
                "scheduledDate": scheduled_date,
                "scheduledTime": scheduled_time,
                "duration": interview.get("duration_minutes", 60),
                "type": interview.get("interview_type", "live"),
                "status": interview.get("status", "scheduled"),
                "meetingLink": interview.get("location"),
            })
        
        # Recent activity (last 5 completed interviews)
        recent_activity = []
        completed = [i for i in all_interviews if i.get("status") == "completed"]
        for interview in completed[-5:]:
            candidate = interview.get("candidate", {})
            recent_activity.append({
                "id": interview["id"],
                "type": "interview_completed",
                "message": f"Completed interview with {candidate.get('full_name', 'Unknown')}",
                "timestamp": interview.get("updated_at", interview.get("created_at", "")),
                "candidateName": candidate.get("full_name"),
            })
        
        return {
            "stats": {
                "totalInterviews": total_interviews,
                "upcomingInterviews": len(upcoming),
                "completedThisMonth": len(completed_this_month),
                "averageRating": average_rating,
                "pendingReviews": pending_reviews,
            },
            "upcomingInterviews": upcoming_interviews,
            "recentActivity": recent_activity,
        }
    except Exception as e:
        print(f"Error fetching interviewer dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== INTERVIEWS ====================

@router.get("/interviews")
async def get_assigned_interviews(user=Depends(get_current_user)):
    """
    Get all interviews assigned to this interviewer
    """
    try:
        res = supabase_client.table("interviews").select(
            "*, candidate:profiles!candidate_id(full_name, email, avatar_url)"
        ).eq("interviewer_email", user.email).order("scheduled_at", desc=False).execute()
        
        interviews = []
        for interview in res.data or []:
            candidate = interview.get("candidate", {})
            
            # Parse scheduled_at to get date and time
            scheduled_at = interview.get("scheduled_at", "")
            try:
                dt = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
                scheduled_date = dt.date().isoformat()
                scheduled_time = dt.time().isoformat()
            except:
                scheduled_date = ""
                scheduled_time = ""
            
            interviews.append({
                "id": interview["id"],
                "candidateName": candidate.get("full_name", "Unknown"),
                "candidateEmail": candidate.get("email", ""),
                "candidateAvatar": candidate.get("avatar_url"),
                "position": interview.get("job_title", ""),
                "company": interview.get("company_name", ""),
                "scheduledDate": scheduled_date,
                "scheduledTime": scheduled_time,
                "duration": interview.get("duration_minutes", 60),
                "type": interview.get("interview_type", "live"),
                "status": interview.get("status", "scheduled"),
                "meetingLink": interview.get("location"),
                "applicationId": interview.get("application_id"),
            })
        
        return interviews
    except Exception as e:
        print(f"Error fetching interviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interviews/{interview_id}")
async def get_interview_details(interview_id: str, user=Depends(get_current_user)):
    """
    Get detailed information for a specific interview
    """
    try:
        res = supabase_client.table("interviews").select(
            "*, candidate:profiles!candidate_id(full_name, email, avatar_url, experience, education, skills)"
        ).eq("id", interview_id).eq("interviewer_email", user.email).single().execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        interview = res.data
        candidate_data = interview.get("candidate", {})
        
        # Parse scheduled_at
        scheduled_at = interview.get("scheduled_at", "")
        try:
            dt = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
            scheduled_date = dt.date().isoformat()
            scheduled_time = dt.time().isoformat()
        except:
            scheduled_date = ""
            scheduled_time = ""
        
        response_data = {
            "id": interview["id"],
            "candidate": {
                "id": interview["candidate_id"],
                "name": candidate_data.get("full_name", "Unknown"),
                "email": candidate_data.get("email", ""),
                "avatar": candidate_data.get("avatar_url"),
                "position": interview.get("job_title", ""),
                "experience": candidate_data.get("experience", "Not specified"),
                "education": candidate_data.get("education", "Not specified"),
                "skills": candidate_data.get("skills", []) if isinstance(candidate_data.get("skills"), list) else [],
                "resumeUrl": None,  # TODO: Add resume URL if available
            },
            "company": interview.get("company_name", ""),
            "position": interview.get("job_title", ""),
            "scheduledDate": scheduled_date,
            "scheduledTime": scheduled_time,
            "duration": interview.get("duration_minutes", 60),
            "type": interview.get("interview_type", "live"),
            "status": interview.get("status", "scheduled"),
            "meetingLink": interview.get("location"),
            "notes": interview.get("notes", ""),
            "startedAt": interview.get("created_at"),
        }
        
        # Record view
        from service.dashboard_service import DashboardService
        DashboardService.record_profile_views([interview["candidate_id"]], user)

        return response_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching interview details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/interviews/{interview_id}/notes")
async def save_interview_notes(
    interview_id: str,
    notes_data: InterviewNotes,
    user=Depends(get_current_user)
):
    """
    Save notes for an interview
    """
    try:
        res = supabase_client.table("interviews").update({
            "notes": notes_data.notes,
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview_id).eq("interviewer_email", user.email).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        return {"message": "Notes saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/interviews/{interview_id}/end")
async def end_interview(interview_id: str, user=Depends(get_current_user)):
    """
    Mark an interview as completed
    """
    try:
        res = supabase_client.table("interviews").update({
            "status": "completed",
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview_id).eq("interviewer_email", user.email).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        return {"message": "Interview ended successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error ending interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== REVIEW & EVALUATION ====================

@router.get("/review/{interview_id}")
async def get_interview_review(interview_id: str, user=Depends(get_current_user)):
    """
    Get interview data for review and evaluation
    """
    try:
        res = supabase_client.table("interviews").select(
            "*, candidate:profiles!candidate_id(full_name, email, avatar_url, experience, education, skills)"
        ).eq("id", interview_id).eq("interviewer_email", user.email).single().execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        interview = res.data
        candidate_data = interview.get("candidate", {})
        
        # Parse scheduled_at
        scheduled_at = interview.get("scheduled_at", "")
        try:
            dt = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
            interview_date = dt.date().isoformat()
        except:
            interview_date = ""
        
        # Parse feedback if exists (assuming JSON format)
        existing_evaluation = None
        if interview.get("feedback"):
            try:
                import json
                existing_evaluation = json.loads(interview["feedback"])
            except:
                pass
        
        response_data = {
            "id": interview["id"],
            "candidate": {
                "id": interview["candidate_id"],
                "name": candidate_data.get("full_name", "Unknown"),
                "email": candidate_data.get("email", ""),
                "avatar": candidate_data.get("avatar_url"),
                "position": interview.get("job_title", ""),
                "experience": candidate_data.get("experience", "Not specified"),
                "education": candidate_data.get("education", "Not specified"),
                "skills": candidate_data.get("skills", []) if isinstance(candidate_data.get("skills"), list) else [],
            },
            "company": interview.get("company_name", ""),
            "position": interview.get("job_title", ""),
            "interviewDate": interview_date,
            "duration": interview.get("duration_minutes", 60),
            "type": interview.get("interview_type", "live"),
            "recordingUrl": None,  # TODO: Add recording URL if available
            "aiSummary": None,  # TODO: Add AI summary if available
            "interviewerNotes": interview.get("notes", ""),
            "existingEvaluation": existing_evaluation,
        }
        
        # Record view
        from service.dashboard_service import DashboardService
        DashboardService.record_profile_views([interview["candidate_id"]], user)

        return response_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching review data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluation")
async def submit_evaluation(
    evaluation: InterviewEvaluation,
    interview_id: str = Body(..., embed=True),
    user=Depends(get_current_user)
):
    """
    Submit evaluation for a candidate
    """
    try:
        import json
        
        # Store evaluation as JSON in feedback field
        evaluation_data = {
            "interviewId": interview_id,
            "technicalSkills": evaluation.technical_skills,
            "communication": evaluation.communication,
            "problemSolving": evaluation.problem_solving,
            "culturalFit": evaluation.cultural_fit,
            "honestyScore": evaluation.honesty_score,
            "overallRating": evaluation.overall_rating,
            "strengths": evaluation.strengths,
            "weaknesses": evaluation.weaknesses,
            "weakConcepts": evaluation.weak_concepts,
            "recommendation": evaluation.recommendation,
            "comments": evaluation.comments,
            "submittedAt": datetime.now().isoformat(),
            "submittedBy": user.email,
        }
        
        res = supabase_client.table("interviews").update({
            "feedback": json.dumps(evaluation_data),
            "status": "completed",
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview_id).eq("interviewer_email", user.email).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        return {"message": "Evaluation submitted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting evaluation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HISTORY ====================

@router.get("/history")
async def get_interview_history(user=Depends(get_current_user)):
    """
    Get past completed interviews
    """
    try:
        res = supabase_client.table("interviews").select(
            "*, candidate:profiles!candidate_id(full_name, avatar_url)"
        ).eq("interviewer_email", user.email).eq("status", "completed").order("scheduled_at", desc=True).execute()
        
        history = []
        for interview in res.data or []:
            candidate = interview.get("candidate", {})
            
            # Parse scheduled_at
            scheduled_at = interview.get("scheduled_at", "")
            try:
                dt = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
                interview_date = dt.date().isoformat()
            except:
                interview_date = ""
            
            # Parse feedback to get score and recommendation
            final_score = 0
            recommendation = "pending"
            try:
                import json
                if interview.get("feedback"):
                    feedback = json.loads(interview["feedback"])
                    final_score = feedback.get("overallRating", 0)
                    recommendation = feedback.get("recommendation", "pending")
            except:
                pass
            
            history.append({
                "id": interview["id"],
                "candidateName": candidate.get("full_name", "Unknown"),
                "candidateAvatar": candidate.get("avatar_url"),
                "position": interview.get("job_title", ""),
                "company": interview.get("company_name", ""),
                "interviewDate": interview_date,
                "finalScore": final_score,
                "recommendation": recommendation,
                "status": "evaluated" if interview.get("feedback") else "pending",
            })
        
        return history
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PROFILE ====================

@router.get("/profile")
async def get_interviewer_profile(user=Depends(get_current_user)):
    """
    Get interviewer profile
    """
    try:
        res = supabase_client.table("profiles").select("*").eq("id", user.id).single().execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile = res.data
        
        # Parse skills if JSON
        skills = profile.get("skills", [])
        if isinstance(skills, str):
            try:
                import json
                skills = json.loads(skills)
            except:
                skills = []
        
        return {
            "id": profile["id"],
            "name": profile.get("full_name", ""),
            "email": profile.get("email", ""),
            "avatar": profile.get("avatar_url"),
            "expertise": profile.get("expertise", []),
            "skills": skills if isinstance(skills, list) else [],
            "yearsOfExperience": profile.get("years_of_experience", 0),
            "availability": profile.get("availability", {
                "monday": True,
                "tuesday": True,
                "wednesday": True,
                "thursday": True,
                "friday": True,
                "saturday": False,
                "sunday": False,
            }),
            "preferredTimeSlots": profile.get("preferred_time_slots", ["09:00-12:00", "14:00-17:00"]),
            "bio": profile.get("summary", ""),
            "linkedIn": profile.get("linkedin", ""),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
async def update_interviewer_profile(
    profile_data: ProfileUpdate,
    user=Depends(get_current_user)
):
    """
    Update interviewer profile
    """
    try:
        import json
        
        update_data = {}
        if profile_data.name:
            update_data["full_name"] = profile_data.name
        if profile_data.bio:
            update_data["summary"] = profile_data.bio
        if profile_data.linkedin:
            update_data["linkedin"] = profile_data.linkedin
        if profile_data.skills:
            update_data["skills"] = profile_data.skills  # Supabase handles list to JSONB
        if profile_data.expertise:
            update_data["expertise"] = profile_data.expertise
        if profile_data.availability:
            update_data["availability"] = profile_data.availability
        if profile_data.preferred_time_slots:
            update_data["preferred_time_slots"] = profile_data.preferred_time_slots
        if profile_data.years_of_experience is not None:
            update_data["years_of_experience"] = profile_data.years_of_experience
        
        if update_data:
            try:
                res = supabase_client.table("profiles").update(update_data).eq("id", user.id).execute()
                if not res.data:
                    raise HTTPException(status_code=404, detail="Profile not found")
            except Exception as db_err:
                print(f"Database Error: {db_err}")
                import traceback
                print(traceback.format_exc())
                raise HTTPException(status_code=500, detail=f"Database error: {str(db_err)}")
        
        return {"message": "Profile updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))
