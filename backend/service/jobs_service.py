from typing import List, Optional, Any, Dict
from datetime import datetime
from app.core.extension import supabase_client as supabase
import logging

logger = logging.getLogger(__name__)

class JobsService:
    @staticmethod
    def list_jobs(
        search: Optional[str] = None,
        location: Optional[str] = None,
        job_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        try:
            query = supabase.table("jobs").select("*")
            
            # Apply filters
            if search:
                # Using ilike for case-insensitive partial match
                # Simplify to just title check to ensure stability
                query = query.ilike("job_title", f"%{search}%")
            
            if location:
                query = query.ilike("location", f"%{location}%")
            
            if job_type and job_type != "all":
                query = query.eq("job_type", job_type)
            
            # Pagination and Sorting
            # Order by posted_date desc
            query = query.order("posted_date", desc=True)
            query = query.range(skip, skip + limit - 1)
            
            response = query.execute()
            return response.data
            
        except Exception as e:
            logger.error(f"Error listing jobs: {str(e)}")
            print(f"CRITICAL ERROR in list_jobs: {e}") # Debug log for console
            raise e

    @staticmethod
    def get_job_by_id(job_id: str) -> Dict[str, Any]:
        try:
            response = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching job {job_id}: {str(e)}")
            return None

    @staticmethod
    def apply_to_job(user_id: str, job_id: str, company_name: str, job_title: str, notes: str = None) -> Dict[str, Any]:
        try:
            # Check if already applied
            existing = supabase.table("applications").select("id").eq("candidate_id", user_id).eq("job_id", job_id).execute()
            if existing.data:
                raise ValueError("You have already applied to this job.")

            data = {
                "candidate_id": user_id,
                "job_id": job_id,
                "company_name": company_name,
                "job_title": job_title,
                "status": "pending",
                "notes": notes,
                "applied_date": datetime.utcnow().isoformat()
            }
            
            response = supabase.table("applications").insert(data).execute()
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Error applying to job {job_id}: {str(e)}")
            raise e

