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
    company_name: Optional[str] = None
    role: Optional[str] = None
    company_logo: Optional[str] = None
    company_description: Optional[str] = None
    website: Optional[str] = None


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


from app.routers.auth_dependency import get_current_user

# ... (keep imports)

# -------------------------
# Routes
# -------------------------
@router.get("")
async def get_profile(user=Depends(get_current_user)):
    try:
        user_id = user.id
        
        # User is already validated by dependency
        
        # Fetch detailed profile data from 'profiles' table
        profile_details = {}
        try:
            profile_res = supabase_client.table("profiles").select("*").eq("id", user_id).execute()
            if profile_res.data and len(profile_res.data) > 0:
                profile_details = profile_res.data[0]
        except Exception as e:
            print(f"Error fetching detailed profile: {e}")
        
        user_data = {
            "id": user.id,
            "email": user.email,
            "full_name": user.user_metadata.get("full_name", ""),
            "role": user.user_metadata.get("role", "job-seeker"),
            "company_name": profile_details.get("company_name") or user.user_metadata.get("company_name", "") or user.user_metadata.get("cname", ""),
            "company_logo": profile_details.get("company_logo"),
            "company_description": profile_details.get("company_description"),
            "website": profile_details.get("website"),
            "test_status": profile_details.get("test_status"),
            "interview_eligible": profile_details.get("interview_eligible", False),
            "last_test_language": profile_details.get("last_test_language"),
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat()
        }
        return {"profile": user_data}
    
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.put("")
async def update_profile(
    update_data: ProfileUpdateRequest = Body(...),
    user=Depends(get_current_user)
):
    try:
        user_id = user.id
        
        # 1. Update Auth User (Email, Meta)
        # 1. Update Auth User (Email, Meta)
        data_to_update = {}
        if update_data.email:
            data_to_update["email"] = update_data.email
        
        metadata = {}
        if update_data.full_name:
            metadata["full_name"] = update_data.full_name
        if update_data.role:
            metadata["role"] = update_data.role
        if update_data.company_name:
            metadata["company_name"] = update_data.company_name
            # Update cname as well for backward compatibility if needed
            metadata["cname"] = update_data.company_name
        
        if metadata:
            data_to_update["user_metadata"] = metadata
            
        if data_to_update:
            response = supabase_client.auth.admin.update_user_by_id(user_id, data_to_update)
            if not hasattr(response, "user") or not response.user:
                raise HTTPException(status_code=400, detail="Failed to update auth profile")

        # 2. Update Profiles Table (Company Info)
        # We need to include role, email, and full_name to ensure unique constraints or not-null constraints are met
        # if the row is being created for the first time.
        
        # Get the latest user data (from update response or current session)
        current_user_data = response.user if data_to_update and 'response' in locals() and hasattr(response, 'user') else user
        
        profile_updates = {}
        # Always sync core fields to profiles table
        profile_updates["role"] = current_user_data.user_metadata.get("role", "candidate")
        profile_updates["email"] = current_user_data.email
        profile_updates["full_name"] = current_user_data.user_metadata.get("full_name", "")
        
        if update_data.company_logo is not None:
            profile_updates["company_logo"] = update_data.company_logo
        if update_data.company_description is not None:
            profile_updates["company_description"] = update_data.company_description
        if update_data.website is not None:
            profile_updates["website"] = update_data.website
        if update_data.company_name is not None:
            profile_updates["company_name"] = update_data.company_name
            
        # We always want to upsert to ensure the row exists and is up to date
        if profile_updates:
            profile_updates["id"] = user_id
            profile_updates["updated_at"] = "now()"
            
            # Upsert into profiles
            supabase_client.table("profiles").upsert(profile_updates).execute()
        
        # Fetch updated data to return
        user_response = supabase_client.auth.admin.get_user_by_id(user_id)
        
        # Re-fetch from Profiles
        profile_res = supabase_client.table("profiles").select("*").eq("id", user_id).execute()
        profile_details = profile_res.data[0] if profile_res.data else {}

        user_data = {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "full_name": user_response.user.user_metadata.get("full_name", ""),
            "role": user_response.user.user_metadata.get("role", "job-seeker"),
            "company_logo": profile_details.get("company_logo"),
            "company_description": profile_details.get("company_description"),
            "website": profile_details.get("website"),
            "test_status": profile_details.get("test_status"),
            "interview_eligible": profile_details.get("interview_eligible", False),
            "last_test_language": profile_details.get("last_test_language"),
            "updated_at": user_response.user.updated_at.isoformat()
        }
        return {"message": "Profile updated successfully", "profile": user_data}
    
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