from fastapi import APIRouter, Depends, HTTPException, Query
from app.routers.auth_dependency import get_current_user
from app.core.extension import supabase_client as supabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from service.jobs_service import JobsService

router = APIRouter()

class JobResponse(BaseModel):
    id: str
    company_name: str
    job_title: str
    location: str
    job_type: str
    salary_range: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    posted_date: Optional[datetime] = None
    logo_url: Optional[str] = None
    applicants_count: Optional[int] = 0

class ApplyRequest(BaseModel):
    note: Optional[str] = None

@router.get("", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    return JobsService.list_jobs(search, location, job_type)

@router.get("/{job_id}", response_model=JobResponse)
def get_job_details(job_id: str, current_user: dict = Depends(get_current_user)):
    job = JobsService.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{job_id}/apply")
def apply_to_job(job_id: str, request: ApplyRequest, current_user: dict = Depends(get_current_user)):
    try:
        user_id = getattr(current_user, "id", None) or current_user.get("id")
        result = JobsService.apply_to_job(user_id, job_id, request.note)
        return {"message": "Application submitted successfully", "application": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class CreateJobRequest(BaseModel):
    job_title: str
    company_name: str
    location: str
    job_type: str
    salary_range: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    company_logo: Optional[str] = None

@router.post("", response_model=JobResponse)
def create_job(job: CreateJobRequest, current_user: dict = Depends(get_current_user)):
    try:
        # User is an object, not a dict
        user_id = getattr(current_user, "id", None)
        user_metadata = getattr(current_user, "user_metadata", {}) or {}
        role = user_metadata.get("role", "")
        
        # Fallback if it's a dict (just in case dependency changes)
        if not user_id and isinstance(current_user, dict):
            user_id = current_user.get("id")
            role = current_user.get("role") or current_user.get("user_metadata", {}).get("role")

        if role not in ["recruiter", "company"]:
             # For now, if role is missing or different, we might want to allow it for testing 
             # OR strictly enforce. Let's strictly enforce but log if it fails.
             print(f"Role check failed. User role: {role}")
             raise HTTPException(status_code=403, detail="Only recruiters can post jobs")
            
        job_data = job.dict(exclude_unset=True) 
        
        result = JobsService.create_job(job_data, user_id)
        return result
    except Exception as e:
        print(f"Error creating job: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/company/my-jobs")
def get_my_jobs(current_user: dict = Depends(get_current_user)):
    try:
        user_id = getattr(current_user, "id", None) or current_user.get("id")
        return JobsService.get_jobs_by_recruiter(user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/company/jobs/{job_id}/applications")
def get_job_applications(job_id: str, current_user: dict = Depends(get_current_user)):
    try:
        return JobsService.get_applications_for_job(job_id, current_user)
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))

@router.get("/company/all-applications")
def get_all_applications(current_user: dict = Depends(get_current_user)):
    try:
        return JobsService.get_all_applications_for_recruiter(current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/applications/{application_id}/details")
def get_application_details(application_id: str, current_user: dict = Depends(get_current_user)):
    try:
        return JobsService.get_candidate_application_details(application_id, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/company/talent-pool")
def get_talent_pool(current_user: dict = Depends(get_current_user)):
    try:
        return JobsService.get_all_candidates_list(current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/company/candidates/{candidate_id}/profile")
def get_candidate_profile(candidate_id: str, current_user: dict = Depends(get_current_user)):
    try:
        return JobsService.get_candidate_profile_details(candidate_id, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{job_id}")
def update_job(job_id: str, job: CreateJobRequest, current_user: dict = Depends(get_current_user)):
    try:
        user_id = getattr(current_user, "id", None) or current_user.get("id")
        job_data = job.dict(exclude_unset=True)
        return JobsService.update_job(job_id, job_data, user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{job_id}")
def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = getattr(current_user, "id", None) or current_user.get("id")
        return JobsService.delete_job(job_id, user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
class UpdateStatusRequest(BaseModel):
    status: str

@router.put("/applications/{application_id}/status")
def update_application_status(application_id: str, request: UpdateStatusRequest, current_user: dict = Depends(get_current_user)):
    try:
        user_id = getattr(current_user, "id", None) or current_user.get("id")
        return JobsService.update_application_status(application_id, request.status, user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
