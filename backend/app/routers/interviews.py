from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.extension import supabase_client
from app.routers.auth_dependency import get_current_user
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
        
        # Verify user is a recruiter (optional, but good practice)
        # role = user.user_metadata.get("role")
        # if role != "recruiter": ... 

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
            "status": "scheduled"
        }
        
        res = supabase_client.table("interviews").insert(new_interview).execute()
        
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to schedule interview")
            
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
