from app.core.extension import supabase
from datetime import datetime

class JobsService:
    @staticmethod
    def list_jobs(search: str = None, location: str = None, job_type: str = None):
        try:
            query = supabase.table("jobs").select("*")
            
            if search:
                # Simple search on title or company
                query = query.or_(f"job_title.ilike.%{search}%,company_name.ilike.%{search}%")
            
            if location and location != "All Locations":
                query = query.eq("location", location)
                
            if job_type and job_type != "All Types":
                query = query.eq("job_type", job_type)
                
            response = query.execute()
            # print(f"Jobs query response: {response.data}")
            return response.data
        except Exception as e:
            print(f"Error listing jobs: {e}")
            return []

    @staticmethod
    def get_job_by_id(job_id: str):
        try:
            response = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
            return response.data
        except Exception as e:
            print(f"Error fetching job details: {e}")
            return None

    @staticmethod
    def apply_to_job(user_id: str, job_id: str, note: str = None):
        # 1. Get job details
        job = JobsService.get_job_by_id(job_id)
        if not job:
            raise Exception("Job not found")

        # 2. Check for duplicate application
        # Check against 'applications' table. Assuming fields: user_id, job_title, company_name.
        # We can't check by job_id if applications table doesn't have it (denormalized).
        # Based on summary, we denormalized company_name and job_title.
        
        existing = supabase.table("applications").select("*")\
            .eq("user_id", user_id)\
            .eq("job_title", job["job_title"])\
            .eq("company_name", job["company_name"])\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            raise Exception("You have already applied to this job")

        # 3. Create application
        application_data = {
            "user_id": user_id,
            "job_title": job["job_title"],
            "company_name": job["company_name"],
            "status": "pending",
            "applied_date": datetime.now().isoformat(),
            # "notes": note # Omitted as likely not in schema yet
        }
        
        response = supabase.table("applications").insert(application_data).execute()
        return response.data
