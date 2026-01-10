from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.extension import supabase_client
from app.routers.auth_dependency import get_current_user
from app.services.email_service import email_service
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

class InterviewCreate(BaseModel):
    job_id: str
    candidate_id: str
    application_id: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: Optional[int] = 30
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    interviewer_id: Optional[str] = None # For selecting external interviewer
    interview_type: Optional[str] = "Live Technical Interview"

class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

@router.post("")
async def schedule_interview(
    interview_data: InterviewCreate,
    user=Depends(get_current_user)
):
    try:
        user_id = user.id
        
        profile_res = supabase_client.table("profiles").select("*").eq("id", user_id).single().execute()
        recruiter = profile_res.data or {}
        company_name = recruiter.get("company_name", "HireMate Partner")
        
        # 2. Get Candidate Details
        candidate_res = supabase_client.table("profiles").select("*").eq("id", interview_data.candidate_id).single().execute()
        candidate = candidate_res.data or {}
        
        # 3. Get Job Details
        job_res = supabase_client.table("jobs").select("job_title").eq("id", interview_data.job_id).single().execute()
        job = job_res.data or {}
        job_title = job.get("job_title", "Technical Role")
        
        # 4. Handle Interviewer (Either specific one or the recruiter themselves)
        interviewer_id = interview_data.interviewer_id or user_id
        interviewer_name = recruiter.get("full_name", "Interviewer")
        interviewer_email = recruiter.get("email", "")
        
        if interview_data.interviewer_id and interview_data.interviewer_id != user_id:
            int_res = supabase_client.table("profiles").select("*").eq("id", interview_data.interviewer_id).single().execute()
            if int_res.data:
                interviewer_name = int_res.data.get("full_name")
                interviewer_email = int_res.data.get("email")

        new_interview = {
            "recruiter_id": user_id,
            "job_id": interview_data.job_id,
            "candidate_id": interview_data.candidate_id,
            "application_id": interview_data.application_id,
            "scheduled_at": interview_data.scheduled_at.isoformat(),
            "duration_minutes": interview_data.duration_minutes,
            "meeting_link": interview_data.meeting_link,
            "location": interview_data.location,
            "notes": interview_data.notes,
            "status": "scheduled",
            "interviewer_name": interviewer_name,
            "interviewer_email": interviewer_email,
            "company_name": company_name,
            "job_title": job_title,
            "interview_type": interview_data.interview_type
        }
        
        res = supabase_client.table("interviews").insert(new_interview).execute()
        
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to schedule interview")
        
        scheduled_at_str = interview_data.scheduled_at.strftime("%Y-%m-%d %H:%M")
        
        # 5. Send Emails (Non-blocking)
        try:
            details = {
                "job_title": job_title,
                "company_name": company_name,
                "scheduled_at": scheduled_at_str,
                "zoom_link": interview_data.meeting_link or "Link will be shared soon",
                "interviewer_name": interviewer_name,
                "other_party_name": candidate.get("full_name", "Candidate")
            }
            
            # To Candidate
            if candidate.get("email"):
                email_service.send_interview_scheduled_email(candidate["email"], candidate.get("full_name", "Candidate"), "candidate", details)
            
            # To Interviewer
            if interviewer_email:
                email_service.send_interview_scheduled_email(interviewer_email, interviewer_name, "interviewer", details)
                
            # To Recruiter/Company
            if recruiter.get("email"):
                email_service.send_interview_scheduled_email(recruiter["email"], recruiter.get("full_name", "Recruiter"), "company", details)
                
        except Exception as email_err:
            print(f"Warning: Failed to send emails: {email_err}")
            
        return {"message": "Interview scheduled successfully", "interview": res.data[0]}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candidate")
async def get_candidate_interviews(user=Depends(get_current_user)):
    """
    Fetch all interviews for the current logged-in candidate.
    """
    try:
        user_id = user.id
        
        # Sort by scheduled_at ascending to show soonest first
        res = supabase_client.table("interviews")\
            .select("*")\
            .eq("candidate_id", user_id)\
            .order("scheduled_at", desc=False)\
            .execute()
        
        # Format the response to match frontend expectations
        # The frontend expects a 'recruiter' and 'job' object
        formatted_interviews = []
        for interview in (res.data or []):
            formatted_interviews.append({
                **interview,
                "recruiter": {
                    "full_name": interview.get("interviewer_name", "Interviewer"),
                    "email": interview.get("interviewer_email", ""),
                    "company_name": interview.get("company_name", "HireMate Partner"),
                },
                "job": {
                    "job_title": interview.get("job_title", "Technical Interview")
                }
            })
            
        return {"interviews": formatted_interviews}
    except Exception as e:
        print(f"Error fetching candidate interviews: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company")
async def get_company_interviews(user=Depends(get_current_user)):
    try:
        user_id = user.id
        # Fetch interviews with candidate details
        # Using a join or separate fetch. Supabase-py join syntax:
        # select=*, candidate:profiles!candidate_id(full_name, email), job:jobs(title)
        
        res = supabase_client.table("interviews").select(
            "*, candidate:profiles!candidate_id(full_name, email), job:jobs(job_title)"
        ).eq("recruiter_id", user_id).order("scheduled_at", desc=False).execute()
        
        return {"interviews": res.data}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interviewers")
async def list_available_interviewers(user=Depends(get_current_user)):
    """
    List all available interviewers (profiles with interviewer role)
    """
    try:
        # Fetch profiles where role metadata in supabase or a flag indicates interviewer
        # Assuming for now we check a 'role' column or similar if it exists
        # In this project, roles are often managed via profile types or metadata.
        # Let's fetch all profiles with role 'interviewer'
        res = supabase_client.table("profiles").select("id, full_name, email, avatar_url, expertise").eq("role", "interviewer").execute()
        return res.data or []
    except Exception as e:
        print(f"Error listing interviewers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{interview_id}")
async def update_interview(
    interview_id: str,
    update_data: InterviewUpdate,
    user=Depends(get_current_user)
):
    try:
        user_id = user.id
        
        data = {}
        if update_data.scheduled_at: data["scheduled_at"] = update_data.scheduled_at.isoformat()
        if update_data.duration_minutes: data["duration_minutes"] = update_data.duration_minutes
        if update_data.meeting_link: data["meeting_link"] = update_data.meeting_link
        if update_data.notes: data["notes"] = update_data.notes
        if update_data.status: data["status"] = update_data.status
        
        if not data:
             return {"message": "No changes provided"}
             
        data["updated_at"] = "now()"

        res = supabase_client.table("interviews").update(data).eq("id", interview_id).eq("recruiter_id", user_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Interview not found or permission denied")
            
        return {"message": "Interview updated", "interview": res.data[0]}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
