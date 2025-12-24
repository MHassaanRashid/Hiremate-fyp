from datetime import datetime
from app.core.extension import supabase_client as supabase
from schema.resume_schema import ResumeRequest, SectionSaveRequest
import uuid

class ResumeService:

    @staticmethod
    def save_resume(user, resume_request: ResumeRequest):
        resume_data = resume_request.resumeData.dict() if resume_request.resumeData else {}
        resume_data = resume_request.resumeData.dict() if resume_request.resumeData else {}
        resume_update = {
            "personal_info_json": resume_data.get("personalInfo", {}),
            "education_json": resume_data.get("education", []),
            "experience_json": resume_data.get("experience", []),
            "skills_json": resume_data.get("skills", []),
            "projects_json": resume_data.get("projects", []),
            "certificates_json": resume_data.get("certificates", []),
            # "languages_json" column does not exist in DB; ignore languages field
            "updated_at": datetime.utcnow().isoformat()
        }

        # Check if resume exists
        existing = supabase.table("resume").select("id").eq("id", user.id).execute()
        if existing.data:
            supabase.table("resume").update(resume_update).eq("id", user.id).execute()
        else:
            resume_update["id"] = user.id
            resume_update["created_at"] = datetime.utcnow().isoformat()
            supabase.table("resume").insert(resume_update).execute()

        return {"message": "Resume saved successfully", "resume_id": user.id}

    @staticmethod
    def save_resume_section(user, section_request: SectionSaveRequest):
        section_map = {
            "personalInfo": "personal_info_json",
            "education": "education_json",
            "experience": "experience_json",
            "skills": "skills_json",
            "projects": "projects_json",
            "certificates": "certificates_json",
            # No languages_json column in DB; ignore languages section
        }

        db_field = section_map.get(section_request.section)
        if not db_field:
            raise ValueError(f"Invalid section: {section_request.section}")

        # Fetch current resume
        current_result = supabase.table("resume").select("*").eq("id", user.id).execute()
        current_resume = current_result.data[0] if current_result.data else {}

        existing_section = current_resume.get(db_field, {} if section_request.section=="personalInfo" else [])

        # Merge logic
        if isinstance(existing_section, list):
            update_value = section_request.data if isinstance(section_request.data, list) else [section_request.data]
        elif isinstance(existing_section, dict):
            update_value = {**existing_section, **section_request.data}
        else:
            update_value = section_request.data

        update_data = {
            db_field: update_value,
            "updated_at": datetime.utcnow().isoformat()
        }

        if not current_result.data:
            update_data["id"] = user.id
            update_data["created_at"] = datetime.utcnow().isoformat()
            supabase.table("resume").insert(update_data).execute()
        else:
            supabase.table("resume").update(update_data).eq("id", user.id).execute()

        return {"message": f"{section_request.section} section saved successfully", "section": section_request.section, "resume_id": user.id}

    @staticmethod
    def get_resume_section(user, section: str):
        section_map = {
            "personalInfo": "personal_info_json",
            "education": "education_json",
            "experience": "experience_json",
            "skills": "skills_json",
            "projects": "projects_json",
            "certificates": "certificates_json",
            # No languages_json column in DB; ignore languages section
        }

        db_field = section_map.get(section)
        if not db_field:
            raise ValueError(f"Invalid section: {section}")

        result = supabase.table("resume").select(f"{db_field}, updated_at").eq("id", user.id).execute()
        resume = result.data[0] if result.data else None
        section_data = resume.get(db_field, {} if section=="personalInfo" else []) if resume else {} if section=="personalInfo" else []

        return {
            "message": f"{section} retrieved successfully",
            "data": section_data,
            "section": section,
            "updated_at": resume.get("updated_at") if resume else None
        }

    @staticmethod
    def get_resume(user):
        result = supabase.table("resume").select(
            "personal_info_json, education_json, experience_json, skills_json, projects_json, certificates_json, created_at, updated_at"
        ).eq("id", user.id).execute()

        # Be defensive about the Supabase response shape (dict or object with .data)
        data = getattr(result, "data", None)
        if data is None and isinstance(result, dict):
            data = result.get("data")

        resume = data[0] if data else None
        if not resume:
            return {"message": "No resume found", "resume": None}

        resume_data = {
            "personalInfo": resume.get("personal_info_json", {}),
            "education": resume.get("education_json", []),
            "experience": resume.get("experience_json", []),
            "skills": resume.get("skills_json", []),
            "projects": resume.get("projects_json", []),
            "certificates": resume.get("certificates_json", []),
            # languages_json column is not present in DB; omit languages from response
        }

        return {
            "message": "Resume retrieved successfully",
            "resume": {
                "id": user.id,
                "resumeData": resume_data,
                "createdAt": resume.get("created_at"),
                "updatedAt": resume.get("updated_at")
            }
        }

    @staticmethod
    def delete_resume(user):
        update_data = {
            "personal_info_json": {},
            "education_json": [],
            "experience_json": [],
            "skills_json": [],
            "projects_json": [],
            "certificates_json": [],
            # languages_json column is not present in DB; nothing to reset for languages
            "updated_at": datetime.utcnow().isoformat()
        }
        supabase.table("resume").update(update_data).eq("id", user.id).execute()
        return {"message": "Resume deleted successfully"}
    
    @staticmethod
    def calculate_resume_completion(resume_data: dict) -> int:
        """
        Calculate resume completion percentage.
        Returns 0-100 score based on required fields.
        """
        score = 0
        
        # Personal Info (30 points)
        personal_info = resume_data.get('personal_info_json', {})
        required_fields = ['fullName', 'email', 'phone', 'location']
        if all(personal_info.get(field) for field in required_fields):
            score += 30
        
        # Education (25 points)
        education = resume_data.get('education_json', [])
        if len(education) >= 1:
            score += 25
        
        # Experience (25 points)
        experience = resume_data.get('experience_json', [])
        if len(experience) >= 1:
            score += 25
        
        # Skills (20 points)
        skills = resume_data.get('skills_json', [])
        if len(skills) >= 3:
            score += 20
        
        return score
    
    @staticmethod
    def update_profile_completion(user_id: str):
        """
        Update profile.resume_completed based on resume data.
        Called after resume save to update completion status.
        """
        # Get resume data
        result = supabase.table("resume").select("*").eq("id", user_id).execute()
        resume = result.data[0] if result.data else None
        
        if not resume:
            # No resume yet, mark as incomplete
            supabase.table("profiles").update({
                "resume_completed": False
            }).eq("id", user_id).execute()
            return
        
        # Calculate completion
        completion = ResumeService.calculate_resume_completion(resume)
        
        # Update profile
        supabase.table("profiles").update({
            "resume_completed": completion >= 80  # 80% threshold
        }).eq("id", user_id).execute()
