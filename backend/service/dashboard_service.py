# backend/service/dashboard_service.py

from datetime import datetime, timedelta, date
from app.core.extension import supabase_client as supabase
from schema.dashboard_schema import (
    DashboardDataSchema,
    CandidateProfileSchema,
    DashboardStatsSchema,
    ApplicationSchema,
    RecommendedJobSchema,
    InterviewSchema,
    ProfileStrengthSchema,
    ActivityItemSchema
)
from typing import List, Optional


class DashboardService:
    """Service for dashboard-related business logic and database operations"""
    
    @staticmethod
    def _format_timestamp(created_at_str: str) -> str:
        """Format timestamp to relative time like '2 hours ago'"""
        try:
            created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
            now = datetime.now(created_at.tzinfo)
            diff = now - created_at
            
            minutes = int(diff.total_seconds() / 60)
            hours = int(diff.total_seconds() / 3600)
            days = diff.days
            
            if minutes < 1:
                return "Just now"
            elif minutes < 60:
                return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
            elif hours < 24:
                return f"{hours} hour{'s' if hours != 1 else ''} ago"
            else:
                return f"{days} day{'s' if days != 1 else ''} ago"
        except Exception:
            return "Recently"
    
    @staticmethod
    def _calculate_trends(user_id: str, current_profile_score: int) -> dict:
        """
        Calculate trends by comparing current period (last 30 days) with previous period (30-60 days ago)
        Returns percentage changes for applications, interviews, profile views, and profile score
        """
        now = datetime.now()
        
        # Define time periods
        current_period_start = (now - timedelta(days=30)).date().isoformat()
        previous_period_start = (now - timedelta(days=60)).date().isoformat()
        previous_period_end = current_period_start
        
        # Calculate applications trend
        current_apps = supabase.table("applications").select("id", count="exact").eq("user_id", user_id).gte("applied_date", current_period_start).execute()
        current_apps_count = current_apps.count if hasattr(current_apps, 'count') else len(current_apps.data or [])
        
        previous_apps = supabase.table("applications").select("id", count="exact").eq("user_id", user_id).gte("applied_date", previous_period_start).lt("applied_date", previous_period_end).execute()
        previous_apps_count = previous_apps.count if hasattr(previous_apps, 'count') else len(previous_apps.data or [])
        
        applications_trend = ((current_apps_count - previous_apps_count) / previous_apps_count * 100) if previous_apps_count > 0 else (100.0 if current_apps_count > 0 else 0.0)
        
        # Calculate interviews trend
        current_interviews = supabase.table("interviews").select("id", count="exact").eq("candidate_id", user_id).gte("scheduled_at", current_period_start).execute()
        current_interviews_count = current_interviews.count if hasattr(current_interviews, 'count') else len(current_interviews.data or [])
        
        previous_interviews = supabase.table("interviews").select("id", count="exact").eq("candidate_id", user_id).gte("scheduled_at", previous_period_start).lt("scheduled_at", previous_period_end).execute()
        previous_interviews_count = previous_interviews.count if hasattr(previous_interviews, 'count') else len(previous_interviews.data or [])
        
        interviews_trend = ((current_interviews_count - previous_interviews_count) / previous_interviews_count * 100) if previous_interviews_count > 0 else (100.0 if current_interviews_count > 0 else 0.0)
        
        # Calculate profile views trend
        current_views = supabase.table("profile_views").select("id", count="exact").eq("user_id", user_id).gte("viewed_date", current_period_start).execute()
        current_views_count = current_views.count if hasattr(current_views, 'count') else len(current_views.data or [])
        
        previous_views = supabase.table("profile_views").select("id", count="exact").eq("user_id", user_id).gte("viewed_date", previous_period_start).lt("viewed_date", previous_period_end).execute()
        previous_views_count = previous_views.count if hasattr(previous_views, 'count') else len(previous_views.data or [])
        
        profile_views_trend = ((current_views_count - previous_views_count) / previous_views_count * 100) if previous_views_count > 0 else (100.0 if current_views_count > 0 else 0.0)
        
        # Calculate profile score trend
        # Get previous profile score from candidate_profile_strength table
        strength_history = supabase.table("candidate_profile_strength").select("overall_score, last_calculated").eq("user_id", user_id).order("last_calculated", desc=True).limit(2).execute()
        
        profile_score_trend = 0.0
        if strength_history.data and len(strength_history.data) >= 2:
            previous_score = strength_history.data[1].get("overall_score", 0)
            profile_score_trend = ((current_profile_score - previous_score) / previous_score * 100) if previous_score > 0 else (100.0 if current_profile_score > 0 else 0.0)
        elif current_profile_score > 0:
            profile_score_trend = 100.0  # First time having a score
        
        return {
            "applicationsTrend": round(applications_trend, 1),
            "profileViewsTrend": round(profile_views_trend, 1),
            "interviewsTrend": round(interviews_trend, 1),
            "profileScoreTrend": round(profile_score_trend, 1)
        }

    
    @staticmethod
    def get_profile_by_user_id(user_id: str):
        """Get profile record by user_id (using id column)"""
        result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        return result.data[0] if result.data else None
    
    @staticmethod
    def get_resume_by_user_id(user_id: str):
        """Get resume record by user_id (id field)"""
        result = supabase.table("resume").select("*").eq("id", user_id).execute()
        return result.data[0] if result.data else None
    
    @staticmethod
    def calculate_profile_strength(profile: dict, resume: dict) -> dict:
        """Calculate profile strength based on profile and resume data"""
        has_profile_picture = False  # No profile_picture in profiles table
        has_bio = bool(profile.get("summary"))
        has_phone = bool(profile.get("phone"))
        has_location = bool(profile.get("location"))
        has_linkedin = False  # No linkedin in profiles table
        has_portfolio = False  # No website/github in profiles table
        
        # Check resume data
        has_resume = resume is not None
        personal_info = resume.get("personal_info_json", {}) if resume else {}
        education_list = resume.get("education_json", []) if resume else []
        experience_list = resume.get("experience_json", []) if resume else []
        skills_list = resume.get("skills_json", []) if resume else []
        projects_list = resume.get("projects_json", []) if resume else []
        certificates_list = resume.get("certificates_json", []) if resume else []
        
        has_skills = len(skills_list) > 0
        has_experience = len(experience_list) > 0
        has_education = len(education_list) > 0
        has_certifications = len(certificates_list) > 0
        has_projects = len(projects_list) > 0
        
        # Calculate component scores (0-100 each)
        basic_info_score = 0
        if has_phone: basic_info_score += 20
        if has_location: basic_info_score += 20
        if has_bio: basic_info_score += 20
        if has_linkedin: basic_info_score += 20
        if has_profile_picture: basic_info_score += 20
        
        resume_score = 0
        if has_resume: resume_score += 50
        if has_projects: resume_score += 50
        
        skills_score = min(len(skills_list) * 20, 100)
        experience_score = min(len(experience_list) * 33, 100)
        education_score = min(len(education_list) * 50, 100)
        certifications_score = min(len(certificates_list) * 33, 100)
        
        # Overall score (weighted average)
        overall_score = int((
            basic_info_score * 0.20 +
            resume_score * 0.15 +
            skills_score * 0.20 +
            experience_score * 0.20 +
            education_score * 0.15 +
            certifications_score * 0.10
        ))
        
        return {
            "overall_score": overall_score,
            "basic_info_score": basic_info_score,
            "resume_score": resume_score,
            "skills_score": skills_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "certifications_score": certifications_score,
            "has_profile_picture": has_profile_picture,
            "has_resume": has_resume,
            "has_bio": has_bio,
            "has_skills": has_skills,
            "has_experience": has_experience,
            "has_education": has_education,
            "has_certifications": has_certifications,
            "has_portfolio": has_portfolio
        }
    
    @staticmethod
    def get_dashboard_data(user) -> dict:
        """
        Get complete dashboard data for a candidate
        Returns all data needed for the candidate dashboard
        """
        user_id = user.id
        
        # Fetch profile and resume data
        profile_data = DashboardService.get_profile_by_user_id(user_id)
        resume_data = DashboardService.get_resume_by_user_id(user_id)
        
        if not profile_data:
            raise ValueError("Profile not found for user")
        
        # Calculate profile strength
        strength_calc = DashboardService.calculate_profile_strength(profile_data, resume_data)
        overall_score = strength_calc["overall_score"]
        
        # Fetch profile data
        profile = CandidateProfileSchema(
            name=profile_data.get("full_name", user.email.split('@')[0] if hasattr(user, 'email') else "User"),
            profileCompletion=overall_score,
            avatar=profile_data.get("avatar_url"), # Standardize avatar field
            interview_eligible=profile_data.get("interview_eligible", False),
            last_test_language=profile_data.get("last_test_language")
        )
        
        # Fetch stats
        # Count applications
        apps_result = supabase.table("applications").select("id", count="exact").eq("user_id", user_id).execute()
        applications_count = apps_result.count if hasattr(apps_result, 'count') else len(apps_result.data) if apps_result.data else 0
        
        # Count upcoming interviews
        now = datetime.now().isoformat()
        interviews_result = supabase.table("interviews").select("id", count="exact").eq("candidate_id", user_id).gte("scheduled_at", now).execute()
        interviews_count = interviews_result.count if hasattr(interviews_result, 'count') else len(interviews_result.data) if interviews_result.data else 0
        
        # Count profile views (last 30 days)
        thirty_days_ago = (datetime.now() - timedelta(days=30)).date().isoformat()
        views_result = supabase.table("profile_views").select("id", count="exact").eq("user_id", user_id).gte("viewed_date", thirty_days_ago).execute()
        views_count = views_result.count if hasattr(views_result, 'count') else len(views_result.data) if views_result.data else 0
        
        
        # Calculate trends
        trends = DashboardService._calculate_trends(user_id, overall_score)
        
        stats = DashboardStatsSchema(
            applicationsSubmitted=applications_count,
            interviewsScheduled=interviews_count,
            profileViews=views_count,
            profileScore=overall_score,
            **trends  # Unpack trend data
        )
        
        # Fetch recent applications (last 10)
        apps_data = supabase.table("applications").select("*").eq("user_id", user_id).order("applied_date", desc=True).limit(10).execute()
        applications = [
            ApplicationSchema(
                id=str(app["id"]),
                jobTitle=app["job_title"],
                company=app["company_name"],
                date=app["applied_date"],
                status=app["status"]
            )
            for app in (apps_data.data or [])
        ]
        
        # Fetch recommended jobs (top 10 by match score)
        jobs_data = supabase.table("recommended_jobs").select("*").eq("user_id", user_id).order("match_score", desc=True).limit(10).execute()
        recommended_jobs = [
            RecommendedJobSchema(
                id=str(job["id"]),
                title=job.get("job_title", "Unknown Position"),
                company=job.get("company_name", "Unknown Company"),
                matchPercentage=job.get("match_score", 0),
                logo=job.get("company_logo"),
                location=job.get("location") or "Remote",
                type=job.get("job_type") or "Full-time"
            )
            for job in (jobs_data.data or [])
        ]
        
        # Fetch upcoming interviews
        interviews_data = supabase.table("interviews").select("*").eq("candidate_id", user_id).gte("scheduled_at", now).order("scheduled_at").execute()
        interviews = [
            InterviewSchema(
                id=str(interview["id"]),
                position=interview["job_title"],
                company=interview["company_name"],
                date=interview["scheduled_at"].split("T")[0] if "T" in interview.get("scheduled_at", "") else interview.get("scheduled_at", ""),
                time=interview["scheduled_at"].split("T")[1].split(".")[0] if "T" in interview.get("scheduled_at", "") else "",
                type=interview["interview_type"],
                meetingLink=interview.get("location") if interview.get("interview_type") in ['video', 'online'] else None
            )
            for interview in (interviews_data.data or [])
        ]
        
        # Update or create profile strength record
        try:
            existing_strength = supabase.table("candidate_profile_strength").select("*").eq("user_id", user_id).execute()
            
            strength_record = {
                "candidate_id": user_id,
                "user_id": user_id,  # Include both to satisfy constraints
                **strength_calc,
                "last_calculated": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if existing_strength.data:
                supabase.table("candidate_profile_strength").update(strength_record).eq("user_id", user_id).execute()
            else:
                strength_record["created_at"] = datetime.utcnow().isoformat()
                supabase.table("candidate_profile_strength").insert(strength_record).execute()
        except Exception as e:
            # Log error but don't crash the whole dashboard fetch
            import logging
            logging.getLogger(__name__).error(f"Failed to update candidate_profile_strength for user {user_id}: {str(e)}")
        
        profile_strength = ProfileStrengthSchema(
            resume=strength_calc["has_resume"],
            skills=strength_calc["has_skills"],
            photo=strength_calc["has_profile_picture"],
            experience=strength_calc["has_experience"],
            education=strength_calc["has_education"],
            certifications=strength_calc["has_certifications"]
        )
        
        # Fetch recent activity (last 10)
        activity_data = supabase.table("activities").select("*").eq("user_id", user_id).order("activity_date", desc=True).limit(10).execute()
        activity = [
            ActivityItemSchema(
                id=str(act["id"]),
                type=act["activity_type"],
                message=act.get("title", "") + (f": {act.get('description', '')}" if act.get('description') else ""),
                timestamp=DashboardService._format_timestamp(act["activity_date"])
            )
            for act in (activity_data.data or [])
        ]
        
        # Return complete dashboard data
        return {
            "profile": profile.dict(),
            "stats": stats.dict(),
            "applications": [app.dict() for app in applications],
            "recommendedJobs": [job.dict() for job in recommended_jobs],
            "interviews": [interview.dict() for interview in interviews],
            "profileStrength": profile_strength.dict(),
            "activity": [act.dict() for act in activity]
        }
    
    @staticmethod
    def update_profile_strength(user) -> dict:
        """Recalculate and update profile strength"""
        user_id = user.id
        
        # Fetch profile and resume
        profile_data = DashboardService.get_profile_by_user_id(user_id)
        resume_data = DashboardService.get_resume_by_user_id(user_id)
        
        if not profile_data:
            raise ValueError("Profile not found")
        
        # Calculate strength
        strength_calc = DashboardService.calculate_profile_strength(profile_data, resume_data)
        
        # Update database
        try:
            strength_record = {
                **strength_calc,
                "last_calculated": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            existing = supabase.table("candidate_profile_strength").select("id").eq("user_id", user_id).execute()
            if existing.data:
                supabase.table("candidate_profile_strength").update(strength_record).eq("user_id", user_id).execute()
            else:
                strength_record["candidate_id"] = user_id
                strength_record["user_id"] = user_id
                strength_record["created_at"] = datetime.utcnow().isoformat()
                supabase.table("candidate_profile_strength").insert(strength_record).execute()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Manual update of candidate_profile_strength failed for user {user_id}: {str(e)}")
            # For manual update, we might want to re-raise or return error in message
            return {"message": f"Profile strength update failed: {str(e)}", "overall_score": strength_calc["overall_score"]}
        
        return {"message": "Profile strength updated successfully", "overall_score": strength_calc["overall_score"]}

    @staticmethod
    def get_company_dashboard_data(user) -> dict:
        """
        Get dashboard data for a company/recruiter
        """
        user_id = user.id
        
        # 1. Stats - Total Jobs
        jobs_result = supabase.table("jobs").select("id", count="exact").eq("user_id", user_id).execute()
        total_jobs = jobs_result.count if hasattr(jobs_result, 'count') else len(jobs_result.data or [])

        # Get job IDs for further filtering
        jobs_data = supabase.table("jobs").select("id").eq("user_id", user_id).execute()
        job_ids = [j['id'] for j in (jobs_data.data or [])]
        
        total_applications = 0
        shortlisted = 0
        recent_applications = []
        
        if job_ids:
            # Total Applications for these jobs
            apps_result = supabase.table("applications").select("id", count="exact").in_("job_id", job_ids).execute()
            total_applications = apps_result.count if hasattr(apps_result, 'count') else len(apps_result.data or [])
            
            # Shortlisted
            shortlisted_result = supabase.table("applications").select("id", count="exact").in_("job_id", job_ids).eq("status", "shortlisted").execute()
            shortlisted = shortlisted_result.count if hasattr(shortlisted_result, 'count') else len(shortlisted_result.data or [])
            
            # Recent Applications
            # Fetch applications with candidate details via user_id relationship to profiles
            # Note: referencing profiles via user_id foreign key
            rec_apps_data = supabase.table("applications")\
                .select("*, profiles!user_id(full_name, email, avatar_url, experience, skills)")\
                .in_("job_id", job_ids)\
                .order("applied_date", desc=True)\
                .limit(10)\
                .execute()
            
            raw_apps = rec_apps_data.data or []
            
            # Process applications to flatten structure for frontend
            for app in raw_apps:
                candidate_profile = app.get("profiles") or {}
                recent_applications.append({
                    "id": app["id"],
                    "job_title": app["job_title"],
                    "status": app["status"],
                    "applied_date": app["applied_date"],
                    "candidate": {
                        "name": candidate_profile.get("full_name", "Unknown"),
                        "email": candidate_profile.get("email", ""),
                        "avatar": candidate_profile.get("avatar_url"),
                        "experience": candidate_profile.get("experience"),
                        "skills": candidate_profile.get("skills")
                    }
                })
        
        return {
            "stats": {
                "total_jobs": total_jobs,
                "total_applications": total_applications,
                "shortlisted": shortlisted,
            },
            "recent_applications": recent_applications
        }
