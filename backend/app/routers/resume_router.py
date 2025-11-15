from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Any
from schema.resume_schema import ResumeRequest, SectionSaveRequest
from service.resume_service import ResumeService

router = APIRouter()


# ----------------------------
# Helper function: Get current user
# ----------------------------
async def get_current_user(authorization: str = Header(None)) -> Any:
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

@router.post("/save")
async def save_resume(request: ResumeRequest, user=Depends(get_current_user)):
    """Save or update complete resume data"""
    return ResumeService.save_resume(user, request)


@router.post("/save-section")
async def save_resume_section(request: SectionSaveRequest, user=Depends(get_current_user)):
    """Save or update individual resume section"""
    return ResumeService.save_resume_section(user, request)


@router.get("/sections/{section}")
async def get_resume_section(section: str, user=Depends(get_current_user)):
    """Retrieve a specific resume section"""
    return ResumeService.get_resume_section(user, section)


@router.get("/")
async def get_resume(user=Depends(get_current_user)):
    """Retrieve full resume"""
    return ResumeService.get_resume(user)


@router.delete("/")
async def delete_resume(user=Depends(get_current_user)):
    """Delete full resume"""
    return ResumeService.delete_resume(user)
