from fastapi import APIRouter, HTTPException, Depends
from app.core.extension import supabase_client as supabase
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# TODO: Add admin auth dependency. For now, we'll rely on frontend to send correct token 
# and potentially add a check here if we have a "get_current_admin" dependency.
# Since we haven't built a robust RBAC middleware yet, we'll keep it open 
# but getting the user role is highly recommended.

import asyncio

@router.get("/stats")
async def get_stats():
    try:
        # Run count queries in parallel
        async def get_count(table, filters=None):
            query = supabase.table(table).select("*", count="exact")
            if filters:
                for k, v in filters.items():
                    query = query.eq(k, v)
                    
            # Use loop.run_in_executor for the blocking execute call
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, query.execute)

        results = await asyncio.gather(
            get_count("profiles"),      # total_users (all profiles)
            get_count("jobs"),          # total_jobs
            get_count("applications"),  # total_applications
            get_count("interviews")     # total_interviews
        )

        return {
            "total_users": results[0].count,
            "total_jobs": results[1].count,
            "total_applications": results[2].count,
            "total_interviews": results[3].count,
            # Placeholder trends - in a real app these would be calculated vs last month
            "users_trend": 12.5,
            "jobs_trend": 5.2,
            "applications_trend": 8.1,
            "interviews_trend": -2.4
        }
    except Exception as e:
        logger.error(f"Error fetching admin stats: {e}")
        return {
            "total_users": 0,
            "total_jobs": 0,
            "total_applications": 0,
            "total_interviews": 0,
            "users_trend": 0,
            "jobs_trend": 0,
            "applications_trend": 0,
            "interviews_trend": 0
        }

@router.get("/users")
async def get_users(role: Optional[str] = None):
    try:
        query = supabase.table("profiles").select("*").order("created_at", desc=True)
        if role:
            query = query.eq("role", role)
        
        response = query.execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.get("/users/{user_id}")
async def get_user_details(user_id: str):
    try:
        # Fetch user profile
        user_res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_res.data
        role = user_data.get("role")
        related_data = []

        # Fetch related data based on role
        if role == "recruiter":
            jobs_res = supabase.table("jobs").select("*").eq("recruiter_id", user_id).order("created_at", desc=True).limit(10).execute()
            related_data = jobs_res.data
        elif role == "candidate":
            apps_res = supabase.table("applications").select("*, job:job_id(title, company_name)").eq("candidate_id", user_id).order("applied_at", desc=True).limit(10).execute()
            related_data = apps_res.data
        elif role == "interviewer":
            # Fetch interviews for this interviewer
            # Note: Interviews link by interviewer_email usually, let's try that or id if table structure permits.
            # Based on interviewer.py it uses email.
            user_email = user_data.get("email")
            if user_email:
                int_res = supabase.table("interviews").select("*, candidate:candidate_id(full_name)").eq("interviewer_email", user_email).order("scheduled_at", desc=True).limit(10).execute()
                related_data = int_res.data

        return {"user": user_data, "related": related_data}

    except Exception as e:
        logger.error(f"Error fetching user details: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user details")

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    try:
        # Delete from auth users (requires service role key usually, but let's try via public client first if configured, 
        # otherwise we might just delete from profiles table which might trigger cascade or be enough for app logic)
        # Note: supabase-js/py client usually can't delete auth users without service key.
        # So we will just delete from profiles for now. 
        
        # However, deleting from profiles might violate foreign keys if not cascaded.
        
        response = supabase.table("profiles").delete().eq("id", user_id).execute()
        return {"message": "User profile deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user")

@router.get("/jobs")
async def get_all_jobs():
    try:
        # Fetch all jobs
        jobs_res = supabase.table("jobs").select("*").order("created_at", desc=True).execute()
        jobs = jobs_res.data
        
        if not jobs:
            return []

        # Extract recruiter IDs manually
        recruiter_ids = list(set([j["recruiter_id"] for j in jobs if j.get("recruiter_id")]))
        
        # Fetch profiles for these recruiters
        profiles_map = {}
        if recruiter_ids:
            profiles_res = supabase.table("profiles").select("id, full_name, email").in_("id", recruiter_ids).execute()
            for p in profiles_res.data:
                profiles_map[p["id"]] = p
        
        # Merge data
        for job in jobs:
            recruiter = profiles_map.get(job.get("recruiter_id"))
            job["profiles"] = recruiter # naming it 'profiles' to match frontend expectation
            
        return jobs
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")

@router.get("/analytics")
async def get_analytics():
    try:
        # Mock data for now as we don't have historical tracking table
        # In a real app, we'd query a 'daily_stats' table
        
        return {
            "growth": [
                {"name": "Jan", "users": 10, "jobs": 5},
                {"name": "Feb", "users": 20, "jobs": 12},
                {"name": "Mar", "users": 45, "jobs": 25},
                {"name": "Apr", "users": 80, "jobs": 40},
                {"name": "May", "users": 120, "jobs": 65},
                {"name": "Jun", "users": 150, "jobs": 90},
            ],
            "activity": [
                {"time": "09:00", "views": 120},
                {"time": "12:00", "views": 450},
                {"time": "15:00", "views": 320},
                {"time": "18:00", "views": 600},
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

@router.get("/applications")
async def get_all_applications():
    try:
        # Fetch all applications
        apps_res = supabase.table("applications").select("*").order("applied_at", desc=True).execute()
        apps = apps_res.data
        
        if not apps:
            return []

        # Extract IDs
        candidate_ids = list(set([a["candidate_id"] for a in apps if a.get("candidate_id")]))
        job_ids = list(set([a["job_id"] for a in apps if a.get("job_id")]))

        # Fetch candidates
        candidates_map = {}
        if candidate_ids:
            cand_res = supabase.table("profiles").select("id, full_name, email").in_("id", candidate_ids).execute()
            for c in cand_res.data:
                candidates_map[c["id"]] = c

        # Fetch jobs
        jobs_map = {}
        if job_ids:
            jobs_res = supabase.table("jobs").select("id, title, company_name").in_("id", job_ids).execute()
            for j in jobs_res.data:
                jobs_map[j["id"]] = j

        # Merge data
        for app in apps:
            app["candidate"] = candidates_map.get(app.get("candidate_id"))
            app["job"] = jobs_map.get(app.get("job_id"))
            
        return apps
    except Exception as e:
        logger.error(f"Error fetching applications: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch applications")

