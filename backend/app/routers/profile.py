from fastapi import APIRouter, HTTPException, Header, Body, Depends
from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List, Dict, Any
import jwt
from app.core.extension import supabase_client
from app.core.config import Config
import traceback

router = APIRouter()


# -------------------------
# Pydantic models
# -------------------------
class ProfileUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None


class PersonalInfo(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: Optional[str] = None


class ResumeData(BaseModel):
    personalInfo: PersonalInfo
    education: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    skills: Optional[List[Dict[str, Any]]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    certificates: Optional[List[Dict[str, Any]]] = []
    languages: Optional[List[Dict[str, Any]]] = []
    resume_uploaded: bool = True


# -------------------------
# Routes
# -------------------------
@router.get("/profile")
async def get_profile(authorization: Optional[str] = Header(None)):
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        token = authorization.split(" ")[1]
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("user_id")
        
        user_response = supabase_client.auth.admin.get_user_by_id(user_id)
        if not hasattr(user_response, "user") or not user_response.user:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        user_data = {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "full_name": user_response.user.user_metadata.get("full_name", ""),
            "role": user_response.user.user_metadata.get("role", "job-seeker"),
            "created_at": user_response.user.created_at.isoformat(),
            "updated_at": user_response.user.updated_at.isoformat()
        }
        return {"profile": user_data}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile")
async def update_profile(
    update_data: ProfileUpdateRequest = Body(...),
    authorization: Optional[str] = Header(None)
):
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        token = authorization.split(" ")[1]
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("user_id")
        
        data_to_update = {}
        if update_data.email:
            data_to_update["email"] = update_data.email
        
        metadata = {}
        if update_data.full_name:
            metadata["full_name"] = update_data.full_name
        if update_data.role:
            metadata["role"] = update_data.role
        
        if metadata:
            data_to_update["data"] = metadata
        
        response = supabase_client.auth.admin.update_user_by_id(user_id, **data_to_update)
        
        if not hasattr(response, "user") or not response.user:
            raise HTTPException(status_code=400, detail="Failed to update profile")
        
        user_data = {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": response.user.user_metadata.get("full_name", ""),
            "role": response.user.user_metadata.get("role", "job-seeker"),
            "updated_at": response.user.updated_at.isoformat()
        }
        return {"message": "Profile updated successfully", "profile": user_data}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume")
async def save_resume(
    resume_data: ResumeData = Body(...),
    authorization: Optional[str] = Header(None)
):
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        token = authorization.split(" ")[1]
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("user_id")
        
        # Check if profile exists
        profile_response = supabase_client.table("profiles").select("*").eq("id", user_id).execute()
        
        if profile_response.data and len(profile_response.data) > 0:
            # Update existing profile
            update_data = {
                "full_name": resume_data.personalInfo.fullName,
                "email": resume_data.personalInfo.email,
                "phone": resume_data.personalInfo.phone,
                "location": resume_data.personalInfo.location,
                "website": resume_data.personalInfo.website,
                "linkedin": resume_data.personalInfo.linkedin,
                "github": resume_data.personalInfo.github,
                "summary": resume_data.personalInfo.summary,
                "education": resume_data.education,
                "experience": resume_data.experience,
                "skills": resume_data.skills,
                "projects": resume_data.projects,
                "certificates": resume_data.certificates,
                "languages": resume_data.languages,
                "resume_uploaded": resume_data.resume_uploaded,
                "updated_at": "now()"
            }
            
            response = supabase_client.table("profiles").update(update_data).eq("id", user_id).execute()
            
            if not response.data or len(response.data) == 0:
                raise HTTPException(status_code=400, detail="Failed to update resume data")
                
        else:
            # Create new profile
            new_profile = {
                "id": user_id,
                "full_name": resume_data.personalInfo.fullName,
                "email": resume_data.personalInfo.email,
                "phone": resume_data.personalInfo.phone,
                "location": resume_data.personalInfo.location,
                "website": resume_data.personalInfo.website,
                "linkedin": resume_data.personalInfo.linkedin,
                "github": resume_data.personalInfo.github,
                "summary": resume_data.personalInfo.summary,
                "education": resume_data.education,
                "experience": resume_data.experience,
                "skills": resume_data.skills,
                "projects": resume_data.projects,
                "certificates": resume_data.certificates,
                "languages": resume_data.languages,
                "resume_uploaded": resume_data.resume_uploaded,
                "role": "candidate",  # Default role for resume builders
                "created_at": "now()",
                "updated_at": "now()"
            }
            
            response = supabase_client.table("profiles").insert(new_profile).execute()
            
            if not response.data or len(response.data) == 0:
                raise HTTPException(status_code=400, detail="Failed to create profile")
        
        return {"message": "Resume saved successfully", "profile_id": user_id}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resume")
async def get_resume(authorization: Optional[str] = Header(None)):
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid token format")
        
        token = authorization.split(" ")[1]
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("user_id")
        
        # Get profile data
        profile_response = supabase_client.table("profiles").select("*").eq("id", user_id).execute()
        
        if not profile_response.data or len(profile_response.data) == 0:
            return {"resume": None}
        
        profile = profile_response.data[0]
        
        # Format data for frontend
        resume_data = {
            "personalInfo": {
                "fullName": profile.get("full_name", ""),
                "email": profile.get("email", ""),
                "phone": profile.get("phone", ""),
                "location": profile.get("location", ""),
                "website": profile.get("website", ""),
                "linkedin": profile.get("linkedin", ""),
                "github": profile.get("github", ""),
                "summary": profile.get("summary", "")
            },
            "education": profile.get("education", []),
            "experience": profile.get("experience", []),
            "skills": profile.get("skills", []),
            "projects": profile.get("projects", []),
            "certificates": profile.get("certificates", []),
            "languages": profile.get("languages", [])
        }
        
        return {"resume": {"resumeData": resume_data}}
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))