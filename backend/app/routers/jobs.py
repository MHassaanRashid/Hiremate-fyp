from fastapi import APIRouter, Depends, HTTPException, Query
from app.routers.auth_dependency import get_current_user
from app.core.extension import supabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.service.jobs_service import JobsService

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

class ApplyRequest(BaseModel):
    note: Optional[str] = None

@router.get("/", response_model=List[JobResponse])
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
        user_id = current_user["id"]
        result = JobsService.apply_to_job(user_id, job_id, request.note)
        return {"message": "Application submitted successfully", "application": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
