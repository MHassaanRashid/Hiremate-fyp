from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional, Any
from pydantic import BaseModel
import uuid
from datetime import date, datetime
from service.jobs_service import JobsService
from app.routers.auth_dependency import get_current_user

router = APIRouter()

class JobResponse(BaseModel):
    id: uuid.UUID
    company_name: str
    company_logo: Optional[str] = None
    job_title: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    skills_required: Optional[List[str]] = None
    description: Optional[str] = None
    posted_date: Optional[datetime] = None
    is_active: bool

    class Config:
        orm_mode = True

class ApplyRequest(BaseModel):
    notes: Optional[str] = None

@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 12,
    user: Any = Depends(get_current_user) # Require auth for listing? Maybe not strict, but good practice
):
    return JobsService.list_jobs(search, location, job_type, skip, limit)

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, user: Any = Depends(get_current_user)):
    job = JobsService.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{job_id}/apply")
async def apply_to_job(
    job_id: str, 
    request: ApplyRequest,
    user: Any = Depends(get_current_user)
):
    try:
        # 1. Get job details to ensure it exists and get title/company
        job = JobsService.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
