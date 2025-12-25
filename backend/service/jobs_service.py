from app.core.extension import supabase_client as supabase
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
                # Use ilike for partial/fuzzy location matching
                # This allows "New York" to match "New York, NY" or "Remote" to match "Remote - USA"
                query = query.ilike("location", f"%{location}%")
                
            if job_type and job_type != "All Types":
                query = query.eq("job_type", job_type)
            
            # Sort by posted_date descending (latest first)
            query = query.order("posted_date", desc=True)
                
            response = query.execute()
            jobs = response.data
            
            # Add applicants_count for each job
            for job in jobs:
                # Fetch applications and count them manually
                applications_response = supabase.table("applications")\
                    .select("id")\
                    .eq("job_id", job["id"])\
                    .execute()
                
                # Count the applications
                applicants_count = len(applications_response.data) if applications_response.data else 0
                job["applicants_count"] = applicants_count
                print(f"Job {job['id']} ({job.get('job_title', 'Unknown')}): {applicants_count} applicants")
            
            return jobs
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

        # 2. Check for duplicate application by job_id
        existing = supabase.table("applications").select("*")\
            .eq("user_id", user_id)\
            .eq("job_id", job_id)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            raise Exception("You have already applied to this job")

        # 3. Create application
        application_data = {
            "user_id": user_id,
            "candidate_id": user_id,
            "job_id": job_id,
            "job_title": job["job_title"],
            "company_name": job["company_name"],
            "status": "pending",
            "applied_date": datetime.now().isoformat(),
            "notes": note
        }
        
        try:
            response = supabase.table("applications").insert(application_data).execute()
            return response.data
        except Exception as insert_err:
            # Postgrest errors often have a .message or are strings with details
            print(f"DEBUG: Insert failed. Error type: {type(insert_err)}")
            print(f"DEBUG: Error details: {str(insert_err)}")
            raise insert_err

    @staticmethod
    def create_job(job_data: dict, user_id: str):
        try:
            # Add user_id to job data
            job_data["user_id"] = user_id
            job_data["posted_date"] = datetime.now().isoformat()
            
            # Insert into database
            response = supabase.table("jobs").insert(job_data).execute()
            
            if not response.data:
                raise Exception("Failed to create job")
                
            return response.data[0]
        except Exception as e:
            print(f"Error creating job: {e}")
            raise e

    @staticmethod
    def get_jobs_by_recruiter(user_id: str):
        try:
            response = supabase.table("jobs").select("*").eq("user_id", user_id).order("posted_date", desc=True).execute()
            
            # Enrich with applicant count
            jobs = response.data
            for job in jobs:
                # Count applications for this job (by matching criteria or job_id if we had it linked properly)
                # In apply_to_job we see it matches by title/company.
                # Ideally we should link by job_id. Let's assume for now we count by title/company match
                # OR if applications table has job_id (it doesn't seem to based on apply_to_job code).
                # Wait, apply_to_job uses title/company.
                
                count_query = supabase.table("applications").select("*", count="exact")\
                    .eq("job_title", job["job_title"])\
                    .eq("company_name", job["company_name"])\
                    .execute()
                
                job["applicants_count"] = count_query.count if count_query.count is not None else len(count_query.data)
                
            return jobs
        except Exception as e:
            print(f"Error fetching recruiter jobs: {e}")
            return []

    @staticmethod
    def get_applications_for_job(job_id: str, user_id: str):
        try:
            # 1. Verify job belongs to user
            job = supabase.table("jobs").select("user_id").eq("id", job_id).single().execute()
            if not job.data or job.data["user_id"] != user_id:
                raise Exception("Unauthorized or Job not found")

            # 2. Get full job details to match company/title if needed
            full_job = JobsService.get_job_by_id(job_id)
            
            # Fetch applications
            response = supabase.table("applications").select("*")\
                .eq("job_id", job_id)\
                .order("applied_date", desc=True)\
                .execute()
            
            applications = response.data
            
            if not applications:
                return []
                
            # 3. Enrich with Candidate Profile & Resume Data
            user_ids = [app["user_id"] for app in applications]
            
            if user_ids:
                # Get basic profile info
                profiles_response = supabase.table("profiles").select("*").in_("id", user_ids).execute()
                profiles_map = {p["id"]: p for p in profiles_response.data}
                
                # Get detailed resume info
                resumes_response = supabase.table("resume").select("*").in_("id", user_ids).execute()
                resumes_map = {r["id"]: r for r in resumes_response.data}

                for app in applications:
                    profile = profiles_map.get(app["user_id"])
                    resume = resumes_map.get(app["user_id"])
                    
                    if profile:
                        app["candidate_name"] = profile.get("full_name", "Unknown Candidate")
                        app["candidate_email"] = profile.get("email")
                        app["candidate_phone"] = profile.get("phone")
                        app["candidate_location"] = profile.get("location")
                        app["candidate_summary"] = profile.get("summary")
                        app["ai_score"] = profile.get("ai_score", 0)
                        app["resume_id"] = profile.get("id")
                        app["resume_url"] = "Resume Available" if profile.get("resume_uploaded") else None

                    # Prefer details from the detailed resume table if available
                    if resume:
                        personal = resume.get("personal_info_json", {})
                        if personal:
                            app["candidate_name"] = personal.get("fullName", app.get("candidate_name"))
                            app["candidate_email"] = personal.get("email", app.get("candidate_email"))
                            app["candidate_phone"] = personal.get("phone", app.get("candidate_phone"))
                            app["candidate_location"] = personal.get("location", app.get("candidate_location"))
                            app["candidate_summary"] = personal.get("summary", app.get("candidate_summary"))

                        app["candidate_skills"] = resume.get("skills_json", [])
                        app["candidate_experience"] = resume.get("experience_json", [])
                        app["candidate_education"] = resume.get("education_json", [])
                        app["candidate_projects"] = resume.get("projects_json", [])
                        app["candidate_certificates"] = resume.get("certificates_json", [])

            return applications
        except Exception as e:
            print(f"Error fetching applications: {e}")
            raise e

    @staticmethod
    def update_job(job_id: str, job_data: dict, user_id: str):
        try:
             # Verify ownership
            job = supabase.table("jobs").select("user_id").eq("id", job_id).single().execute()
            if not job.data or job.data["user_id"] != user_id:
                raise Exception("Unauthorized or Job not found")

            response = supabase.table("jobs").update(job_data).eq("id", job_id).execute()
            return response.data
        except Exception as e:
            print(f"Error updating job: {e}")
            raise e

    @staticmethod
    def delete_job(job_id: str, user_id: str):
        try:
             # Verify ownership
            job = supabase.table("jobs").select("user_id").eq("id", job_id).single().execute()
            if not job.data or job.data["user_id"] != user_id:
                raise Exception("Unauthorized or Job not found")

            # Hard delete for now, or could set is_active = False if column exists
            response = supabase.table("jobs").delete().eq("id", job_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting job: {e}")
            raise e
    @staticmethod
    def update_application_status(application_id: str, status: str, user_id: str):
        try:
            # 1. Verify application exists and recruiter owns the job
            app_res = supabase.table("applications").select("*").eq("id", application_id).single().execute()
            if not app_res.data:
                raise Exception("Application not found")
            
            app = app_res.data
            
            # Find the job to verify ownership
            # Using job_id for direct verification
            job_res = supabase.table("jobs").select("user_id")\
                .eq("id", app.get("job_id"))\
                .single().execute()
            
            if not job_res.data or job_res.data["user_id"] != user_id:
                raise Exception("Unauthorized to update this application")
            
            # 2. Update status
            response = supabase.table("applications").update({"status": status}).eq("id", application_id).execute()
            return response.data
        except Exception as e:
            print(f"Error updating application status: {e}")
            raise e
    @staticmethod
    def get_all_applications_for_recruiter(user_id: str):
        try:
            # 1. Get all job IDs belonging to this recruiter
            jobs_res = supabase.table("jobs").select("id").eq("user_id", user_id).execute()
            job_ids = [job["id"] for job in jobs_res.data]
            
            if not job_ids:
                return []

            # 2. Get applications for these jobs
            response = supabase.table("applications").select("*")\
                .in_("job_id", job_ids)\
                .order("applied_date", desc=True)\
                .execute()
            
            applications = response.data
            if not applications:
                return []
                
            # 3. Enrich with Candidate Info
            # Extract unique candidate IDs
            candidate_ids = list(set([app["user_id"] for app in applications]))
            
            profiles_response = supabase.table("profiles").select("*").in_("id", candidate_ids).execute()
            profiles_map = {p["id"]: p for p in profiles_response.data}
            
            for app in applications:
                profile = profiles_map.get(app["user_id"])
                if profile:
                    app["candidate_name"] = profile.get("full_name", "Unknown Candidate")
                    app["candidate_email"] = profile.get("email")
                    app["ai_score"] = profile.get("ai_score", 0)
                
            return applications
        except Exception as e:
            print(f"Error fetching all recruiter applications: {e}")
            raise e
