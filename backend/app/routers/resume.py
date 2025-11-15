# from fastapi import APIRouter, HTTPException, Header, Depends
# from pydantic import BaseModel, Field
# from typing import Optional, List, Dict, Any
# from datetime import datetime
# from app.core.extension import supabase_client as supabase

# router = APIRouter()

# # ----------------------------
# # Pydantic Models for Resume Data
# # ----------------------------
# class PersonalInfo(BaseModel):
#     fullName: str
#     email: str
#     phone: str
#     location: str
#     website: Optional[str] = None
#     linkedin: Optional[str] = None
#     github: Optional[str] = None
#     summary: str

# class Education(BaseModel):
#     id: str
#     institution: str
#     degree: str
#     field: str
#     graduationYear: str
#     gpa: Optional[str] = None
#     achievements: List[str] = Field(default_factory=list)

# class Experience(BaseModel):
#     id: str
#     company: str
#     position: str
#     startDate: str
#     endDate: str
#     current: bool
#     location: str
#     description: str
#     achievements: List[str] = Field(default_factory=list)

# class Project(BaseModel):
#     id: str
#     name: str
#     description: str
#     technologies: List[str] = Field(default_factory=list)
#     link: Optional[str] = None
#     github: Optional[str] = None
#     startDate: str
#     endDate: str

# class Skill(BaseModel):
#     name: str
#     level: int  # 1-5
#     category: str

# class Certificate(BaseModel):
#     id: str
#     name: str
#     issuer: str
#     date: str
#     expiryDate: Optional[str] = None
#     credentialId: Optional[str] = None

# class Language(BaseModel):
#     name: str
#     proficiency: str

# class ResumeData(BaseModel):
#     personalInfo: Optional[PersonalInfo] = None
#     education: List[Education] = Field(default_factory=list)
#     experience: List[Experience] = Field(default_factory=list)
#     projects: List[Project] = Field(default_factory=list)
#     skills: List[Skill] = Field(default_factory=list)
#     certificates: List[Certificate] = Field(default_factory=list)
#     languages: List[Language] = Field(default_factory=list)

# class ResumeRequest(BaseModel):
#     resumeData: Optional[ResumeData] = None

# class SectionSaveRequest(BaseModel):
#     section: str
#     data: Dict[str, Any]

# # ----------------------------
# # Helper function: Get user from token
# # ----------------------------
# async def get_current_user(authorization: str = Header(None)):
#     if not authorization or not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Invalid or missing token")
    
#     token = authorization.split(" ")[1]
#     try:
#         user_response = supabase.auth.get_user(token)
#         user = getattr(user_response, "user", None) or user_response.get("user")
#         if not user:
#             raise HTTPException(status_code=401, detail="Invalid token")
#         return user
#     except Exception as e:
#         raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# # ----------------------------
# # Routes
# # ----------------------------
# @router.post("/save")
# async def save_resume(request: ResumeRequest, user = Depends(get_current_user)):
#     """Save or update complete resume data for a user"""
#     try:
#         resume_data = request.resumeData.dict() if request.resumeData else {}
#         profile_update = {
#             "personal_info": resume_data.get("personalInfo", {}),
#             "education": resume_data.get("education", []),
#             "experience": resume_data.get("experience", []),
#             "skills": resume_data.get("skills", []),
#             "projects": resume_data.get("projects", []),
#             "certificates": resume_data.get("certificates", []),
#             "languages": resume_data.get("languages", []),
#             "resume_uploaded": True,
#             "updated_at": datetime.utcnow().isoformat()
#         }
#         supabase.table("profiles").update(profile_update).eq("id", user.id).execute()
#         return {"message": "Resume saved successfully", "profile_id": user.id}
#     except Exception as e:
#         print(f"Error saving resume: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to save resume: {str(e)}")

# # ----------------------------
# # Save individual section
# # ----------------------------
# @router.post("/save-section")
# async def save_resume_section(request: SectionSaveRequest, user = Depends(get_current_user)):
#     """Save individual resume section progressively"""
#     try:
#         current_result = supabase.table("profiles").select("*").eq("id", user.id).execute()
#         current_profile = current_result.data[0] if current_result.data else {
#             "id": user.id,
#             "personal_info": {},
#             "education": [],
#             "experience": [],
#             "skills": [],
#             "projects": [],
#             "certificates": [],
#             "languages": [],
#             "resume_uploaded": False,
#             "updated_at": datetime.utcnow().isoformat()
#         }
#         if not current_result.data:
#             supabase.table("profiles").insert(current_profile).execute()

#         section_map = {
#             "personalInfo": "personal_info",
#             "education": "education",
#             "experience": "experience",
#             "skills": "skills",
#             "projects": "projects",
#             "certificates": "certificates",
#             "languages": "languages"
#         }
#         if request.section not in section_map:
#             raise HTTPException(status_code=400, detail=f"Invalid section: {request.section}")
        
#         db_field = section_map[request.section]
#         existing_section = current_profile.get(db_field)

#         # Merge logic: preserve type and merge properly
#         if isinstance(existing_section, list):
#             update_value = request.data if isinstance(request.data, list) else [request.data]
#         elif isinstance(existing_section, dict):
#             update_value = {**existing_section, **request.data}
#         else:
#             update_value = request.data

#         update_data = {
#             db_field: update_value,
#             "updated_at": datetime.utcnow().isoformat()
#         }

#         # Update resume_uploaded flag if section is meaningful
#         if request.section == "personalInfo" and request.data.get("fullName"):
#             update_data["resume_uploaded"] = True
#         elif request.section in ["education", "experience", "skills", "projects"] and request.data:
#             update_data["resume_uploaded"] = True

#         supabase.table("profiles").update(update_data).eq("id", user.id).execute()
#         return {"message": f"{request.section} section saved successfully", "section": request.section, "profile_id": user.id}

#     except Exception as e:
#         print(f"Error saving section {request.section}: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to save {request.section}: {str(e)}")

# # ----------------------------
# # Get resume sections
# # ----------------------------
# @router.get("/sections/{section}")
# async def get_resume_section(section: str, user = Depends(get_current_user)):
#     section_map = {
#         "personalInfo": "personal_info",
#         "education": "education",
#         "experience": "experience",
#         "skills": "skills",
#         "projects": "projects",
#         "certificates": "certificates",
#         "languages": "languages"
#     }
#     if section not in section_map:
#         raise HTTPException(status_code=400, detail=f"Invalid section: {section}")

#     result = supabase.table("profiles").select(f"{section_map[section]}, updated_at").eq("id", user.id).execute()
#     profile = result.data[0] if result.data else None
#     section_data = profile.get(section_map[section], {} if section=="personalInfo" else []) if profile else {} if section=="personalInfo" else []
    
#     return {
#         "message": f"{section} retrieved successfully",
#         "data": section_data,
#         "section": section,
#         "updated_at": profile.get("updated_at") if profile else None
#     }

# # ----------------------------
# # Get full resume
# # ----------------------------
# @router.get("/")
# async def get_resume(user = Depends(get_current_user)):
#     result = supabase.table("profiles").select(
#         "personal_info, education, experience, skills, projects, certificates, languages, resume_uploaded, created_at, updated_at"
#     ).eq("id", user.id).execute()
#     profile = result.data[0] if result.data else None

#     if not profile or not profile.get("resume_uploaded", False):
#         return {"message": "No resume found", "resume": None}

#     resume_data = {
#         "personalInfo": profile.get("personal_info", {}),
#         "education": profile.get("education", []),
#         "experience": profile.get("experience", []),
#         "skills": profile.get("skills", []),
#         "projects": profile.get("projects", []),
#         "certificates": profile.get("certificates", []),
#         "languages": profile.get("languages", [])
#     }

#     return {
#         "message": "Resume retrieved successfully",
#         "resume": {
#             "id": user.id,
#             "resumeData": resume_data,
#             "createdAt": profile.get("created_at"),
#             "updatedAt": profile.get("updated_at")
#         }
#     }

# # ----------------------------
# # Delete resume
# # ----------------------------
# @router.delete("/")
# async def delete_resume(user = Depends(get_current_user)):
#     profile_update = {
#         "personal_info": {},
#         "education": [],
#         "experience": [],
#         "skills": [],
#         "projects": [],
#         "certificates": [],
#         "languages": [],
#         "resume_uploaded": False,
#         "updated_at": datetime.utcnow().isoformat()
#     }
#     supabase.table("profiles").update(profile_update).eq("id", user.id).execute()
#     return {"message": "Resume deleted successfully"}
