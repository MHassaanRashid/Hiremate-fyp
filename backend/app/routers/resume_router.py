from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Any
from schema.resume_schema import ResumeRequest, SectionSaveRequest
from service.resume_service import ResumeService

router = APIRouter()


# ----------------------------
# Helper function: Get current user
# ----------------------------
from app.routers.auth_dependency import get_current_user


# ----------------------------
# Routes
# ----------------------------

@router.post("/save")
async def save_resume(request: ResumeRequest, user=Depends(get_current_user)):
    """Save or update complete resume data"""
    result = ResumeService.save_resume(user, request)
    # Update profile completion status
    ResumeService.update_profile_completion(user.id)
    return result


@router.post("/save-section")
async def save_resume_section(request: SectionSaveRequest, user=Depends(get_current_user)):
    """Save or update individual resume section"""
    result = ResumeService.save_resume_section(user, request)
    # Update profile completion status
    ResumeService.update_profile_completion(user.id)
    return result


@router.get("/sections/{section}")
async def get_resume_section(section: str, user=Depends(get_current_user)):
    """Retrieve a specific resume section"""
    return ResumeService.get_resume_section(user, section)


@router.get("")
async def get_resume(user=Depends(get_current_user)):
    """Retrieve full resume"""
    return ResumeService.get_resume(user)


@router.delete("")
async def delete_resume(user=Depends(get_current_user)):
    """Delete full resume"""
    return ResumeService.delete_resume(user)
