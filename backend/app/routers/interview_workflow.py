from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.extension import supabase_client
from app.routers.auth_dependency import get_current_user
from app.services.interview_service import interview_service
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/interview-workflow", tags=["Interview Workflow"])

class BookSlotRequest(BaseModel):
    interviewer_id: str
    scheduled_at: datetime
    job_title: str
    company_name: str

@router.get("/available-slots")
async def get_available_slots(tech_stack: str, current_user = Depends(get_current_user)):
    """
    Get available time slots for a specific tech stack.
    Combines availability of multiple interviewers.
    """
    try:
        # 1. Verify candidate is eligible
        print(f"Checking eligibility for user: {current_user.id}")
        profile_res = supabase_client.table("profiles").select("interview_eligible, last_test_language").eq("id", current_user.id).single().execute()
        
        print(f"Profile data retrieved for slots: {profile_res.data}")
        
        if not profile_res.data:
            raise HTTPException(status_code=403, detail="Candidate profile not found. Please complete your profile first.")
            
        profile = profile_res.data
        if not profile.get('interview_eligible'):
            raise HTTPException(
                status_code=403, 
                detail="Candidate is not eligible for a live interview yet. You must pass the AI assessment with a clean record first."
            )

        # Verify language match
        last_lang = profile.get('last_test_language', '').lower()
        requested_lang = tech_stack.lower()
        
        # Mapping common variations
        lang_map = {'py': 'python', 'js': 'javascript', 'ts': 'typescript', 'cpp': 'c++', 'csharp': 'c#'}
        normalized_last = lang_map.get(last_lang, last_lang)
        normalized_requested = lang_map.get(requested_lang, requested_lang)

        if normalized_last != normalized_requested:
            print(f"Language mismatch: profile={normalized_last}, requested={normalized_requested}")
            raise HTTPException(
                status_code=403,
                detail=f"You are eligible for a {profile.get('last_test_language')} interview, not {tech_stack}. Please schedule for the correct language."
            )

        # 2. Get matched interviewers
        interviewers = interview_service.get_available_interviewers(tech_stack)
        
        # 3. Generate slots (Mocking for now, in real case would check interviewer calendars)
        # We'll generate next 3 days, 9am-5pm
        slots = []
        now = datetime.utcnow()
        for i in range(1, 4):
            day = now + timedelta(days=i)
            for hour in [9, 11, 14, 16]:
                slot_time = day.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                # Check if each interviewer is available at this time
                for interviewer in interviewers:
                    # TODO: Real availability check
                    slots.append({
                        "interviewer_id": interviewer["id"],
                        "interviewer_name": interviewer["full_name"],
                        "scheduled_at": slot_time.isoformat(),
                        "id": f"{interviewer['id']}_{slot_time.timestamp()}"
                    })
        
        return {"slots": slots}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching slots: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/book-slot")
async def book_slot(
    request: BookSlotRequest,
    current_user = Depends(get_current_user)
):
    """
    Book a selected slot.
    """
    try:
        # 1. Verify eligibility
        print(f"Checking booking eligibility for user: {current_user.id}")
        profile_res = supabase_client.table("profiles").select("interview_eligible").eq("id", current_user.id).single().execute()
        
        if not profile_res.data:
            raise HTTPException(status_code=403, detail="Candidate profile not found.")
            
        if not profile_res.data.get('interview_eligible'):
            raise HTTPException(status_code=403, detail="Candidate is not eligible for booking. Please complete the assessment first.")

        # 2. Schedule via service
        profile = profile_res.data
        lang = profile.get('last_test_language', 'Technical')
        job_title = f"{lang} Technical Interview"

        result = interview_service.schedule_live_interview(
            candidate_id=str(current_user.id),
            interviewer_id=request.interviewer_id,
            scheduled_at=request.scheduled_at.isoformat(),
            job_title=job_title,
            company_name=request.company_name
        )
        
        # 3. Mark as no longer eligible for booking (active interview scheduled)
        supabase_client.table("profiles").update({"interview_eligible": False}).eq("id", current_user.id).execute()
        
        return result
    except Exception as e:
        print(f"Error booking slot: {e}")
        raise HTTPException(status_code=500, detail=str(e))
