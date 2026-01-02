from app.core.extension import supabase_client
from app.services.zoom_service import zoom_service
from datetime import datetime, timedelta
import uuid
import json

class InterviewService:
    @staticmethod
    def get_available_interviewers(tech_stack: str):
        """
        Fetch interviewers who have expertise in the given tech stack.
        (Currently filtering by profiles with role='interviewer' and 
        checking skills or expertise fields)
        """
        try:
            # Note: Assuming 'skills' is a JSONB field in profiles
            res = supabase_client.table("profiles").select("*").eq("role", "interviewer").execute()
            
            interviewers = res.data or []
            matched = []
            
            for interviewer in interviewers:
                skills = interviewer.get("skills", [])
                if isinstance(skills, str):
                    try:
                        skills = json.loads(skills)
                    except:
                        skills = []
                
                # Check if tech_stack is in skills
                if any(tech_stack.lower() in s.lower() for s in (skills or [])):
                    matched.append(interviewer)
            
            # If no direct skill match, return all interviewers as fallback
            return matched if matched else interviewers
        except Exception as e:
            print(f"Error fetching interviewers: {e}")
            return []

    @staticmethod
    def schedule_live_interview(candidate_id: str, interviewer_id: str, scheduled_at: str, job_title: str, company_name: str):
        """
        Finalize interview: Create Zoom meeting and save to database.
        """
        try:
            # 1. Fetch participant emails
            candidate_res = supabase_client.table("profiles").select("email, full_name").eq("id", candidate_id).single().execute()
            interviewer_res = supabase_client.table("profiles").select("email, full_name").eq("id", interviewer_id).single().execute()
            
            if not candidate_res.data or not interviewer_res.data:
                raise Exception("Candidate or Interviewer profile not found")
            
            candidate = candidate_res.data
            interviewer = interviewer_res.data
            
            # 2. Create Zoom Meeting
            topic = f"Live Technical Interview: {candidate['full_name']} for {job_title}"
            zoom_meeting = zoom_service.create_meeting(
                topic=topic,
                start_time=scheduled_at,
                duration=60
            )
            
            # 3. Create Interview Record
            interview_id = str(uuid.uuid4())
            interview_data = {
                "id": interview_id,
                "candidate_id": candidate_id,
                "interviewer_name": interviewer["full_name"],
                "interviewer_email": interviewer["email"],
                "company_name": company_name,
                "job_title": job_title,
                "interview_type": "Live Technical Interview",
                "scheduled_at": scheduled_at,
                "duration_minutes": 60,
                "location": zoom_meeting["join_url"], # Zoom link
                "status": "scheduled",
                "notes": f"Zoom Password: {zoom_meeting.get('password', 'None')}",
                "meeting_id": zoom_meeting["id"]
            }
            
            res = supabase_client.table("interviews").insert(interview_data).execute()
            
            # 4. Create Activities/Notifications
            activity_data = [
                {
                    "candidate_id": candidate_id,
                    "activity_type": "interview_scheduled",
                    "title": "Interview Scheduled",
                    "description": f"Live Technical Interview for {job_title} at {scheduled_at}. Zoom link: {zoom_meeting['join_url']}",
                    "priority": "high",
                    "user_id": candidate_id
                }
            ]
            
            supabase_client.table("activities").insert(activity_data).execute()
            
            return {
                "interview_id": interview_id,
                "zoom_link": zoom_meeting["join_url"],
                "scheduled_at": scheduled_at
            }
            
        except Exception as e:
            print(f"Error scheduling interview: {e}")
            raise e

interview_service = InterviewService()
