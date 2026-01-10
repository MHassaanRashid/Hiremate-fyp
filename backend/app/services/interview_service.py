from app.core.extension import supabase_client
from app.services.zoom_service import zoom_service
from app.services.email_service import email_service
from datetime import datetime, timedelta
import uuid
import json

class InterviewService:
    @staticmethod
    def get_available_interviewers(tech_stack: str):
        """
        Fetch interviewers who have expertise in the given tech stack.
        """
        try:
            # Tech stack mapping (code to display name)
            stack_map = {
                "py": "Python",
                "js": "JavaScript",
                "ts": "TypeScript",
                "cpp": "C++",
                "java": "Java",
                "csharp": "C#",
                "go": "Go",
                "rust": "Rust"
            }
            
            search_tech = stack_map.get(tech_stack.lower(), tech_stack)
            print(f"Searching interviewers for: {search_tech}")

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
                
                # Check if search_tech is in skills
                if any(search_tech.lower() in s.lower() for s in (skills or [])):
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
            full_interview_data = {
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
            
            # --- Robust Column Handling ---
            try:
                # Try to get existing columns from OpenAPI spec to filter the data
                import httpx
                from app.core.config import Config
                
                url = f"{Config.SUPABASE_URL}/rest/v1/"
                headers = {
                    "apikey": Config.SUPABASE_SERVICE_KEY or Config.SUPABASE_KEY,
                    "Authorization": f"Bearer {Config.SUPABASE_SERVICE_KEY or Config.SUPABASE_KEY}"
                }
                spec_res = httpx.get(url, headers=headers)
                spec = spec_res.json()
                
                # Check different spec locations for definitions
                interviews_def = spec.get('definitions', {}).get('interviews', {})
                if not interviews_def:
                    interviews_def = spec.get('components', {}).get('schemas', {}).get('interviews', {})
                
                actual_columns = interviews_def.get('properties', {}).keys()
                
                if actual_columns:
                    print(f"Filtering interview_data against columns: {list(actual_columns)}")
                    interview_data = {k: v for k, v in full_interview_data.items() if k in actual_columns}
                else:
                    interview_data = full_interview_data # Fallback
                    
            except Exception as schema_err:
                print(f"Warning: Could not fetch schema/spec to filter columns: {schema_err}")
                # Fallback: remove 'company_name' if we suspect it might be missing based on error report
                interview_data = full_interview_data
            
            res = supabase_client.table("interviews").insert(interview_data).execute()
            
            # 4. Create Activities/Notifications (Non-blocking)
            try:
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
            except Exception as activity_err:
                print(f"Warning: Failed to record activity: {activity_err}")
                # We don't raise here because the interview is already booked in 'interviews' table
            
            # 5. Send Email Notifications (Non-blocking)
            try:
                email_details = {
                    "job_title": job_title,
                    "company_name": company_name,
                    "scheduled_at": scheduled_at,
                    "zoom_link": zoom_meeting["join_url"],
                    "interviewer_name": interviewer["full_name"],
                    "other_party_name": candidate["full_name"]
                }
                
                # To Candidate
                email_service.send_interview_scheduled_email(
                    recipient_email=candidate["email"],
                    recipient_name=candidate["full_name"],
                    role="candidate",
                    details=email_details
                )
                
                # To Interviewer
                email_service.send_interview_scheduled_email(
                    recipient_email=interviewer["email"],
                    recipient_name=interviewer["full_name"],
                    role="interviewer",
                    details=email_details
                )
                
            except Exception as email_err:
                print(f"Warning: Failed to send emails: {email_err}")

            return {
                "interview_id": interview_id,
                "zoom_link": zoom_meeting["join_url"],
                "scheduled_at": scheduled_at
            }
            
        except Exception as e:
            print(f"Error scheduling interview: {e}")
            raise e

interview_service = InterviewService()
