import os
import json
from google import genai
from app.core.extension import supabase_client
from app.services.quiz_service import generate_with_fallback

## WHY AI IS NOT DECISION-MAKING (FYP Defense Note):
## 1. The decision (passed/failed/terminated) is already calculated and stored in the database by the quiz router.
## 2. This service only fetches that ALREADY MADE decision and provides an explanation.
## 3. The AI is used as a natural language generator to make technical logs readable for the candidate.

def get_candidate_data(user_id: str):
    """
    Fetches all candidate tests, profile status, and upcoming interviews.
    """
    try:
        # Get all tests to find the best score and latest attempt
        test_res = supabase_client.table("candidate_tests").select("*").eq("candidate_id", user_id).order("started_at", desc=True).execute()
        
        # Get profile status
        profile_res = supabase_client.table("profiles").select("interview_eligible, test_status, resume_completed, full_name").eq("id", user_id).single().execute()
        
        # Get upcoming interviews
        interview_res = supabase_client.table("interviews").select("*").eq("candidate_id", user_id).eq("status", "scheduled").order("scheduled_at", desc=False).execute()
        
        return {
            "tests": test_res.data if test_res.data else [],
            "profile": profile_res.data if profile_res.data else None,
            "upcoming_interviews": interview_res.data if interview_res.data else []
        }
    except Exception as e:
        print(f"Error fetching candidate data: {e}")
        return None

def detect_intent(query: str):
    """
    Rule-based intent detection.
    Distinguishes between Personal Status (my, i, me) and General Knowledge.
    """
    q = query.lower()
    
    # Personal Status Intent (Requires "my", "i", "me" or specific outcome keywords)
    is_personal = any(k in q for k in ["my", "i ", "me", "result", "score"])
    
    if is_personal:
        if any(k in q for k in ["disqualif", "terminat", "pause", "stop", "kick"]):
            return "disqualification"
        if any(k in q for k in ["score", "performance", "how i do", "result"]):
            return "performance"
        if any(k in q for k in ["eligible", "interview", "can i book", "schedule"]):
            return "eligibility"
        if any(k in q for k in ["proctor", "violation", "flag", "warning"]):
            return "proctoring"
        if any(k in q for k in ["next", "step", "proceed", "what i do", "what should i do"]):
            return "process"
            
    return "general"

def get_chatbot_response(user_id: str = None, query: str = ""):
    """
    Main entry point for the FAQ/Explainer bot.
    Handles Guest mode (General FAQ) and Authenticated mode (Decision Explainer).
    """
    try:
        # 0. Handle greetings and small talk locally
        query_lower = query.lower().strip().rstrip("?.!")
        greetings = ["hi", "hello", "hey", "greetings", "how are you", "who are you"]
        acknowledgments = ["ok", "okay", "thanks", "thank you", "understand", "got it", "nice", "great", "fine"]
        closings = ["no", "none", "nothing", "bye", "goodbye", "that's all", "that is all"]
        
        if any(greet == query_lower or query_lower.startswith(greet) for greet in greetings):
            return {
                "answer": "Hello! I'm the HireMate Assistant. I can help you learn about our platform or explain your specific test results. How can I help?",
                "source": "rule"
            }
            
        if query_lower in acknowledgments or any(query_lower.startswith(ack + " ") for ack in acknowledgments):
            return {
                "answer": "Glad I could help! Do you have any other questions about HireMate?",
                "source": "rule"
            }

        if query_lower in closings or any(query_lower.startswith(cls + " ") for cls in closings):
            return {
                "answer": "No problem! Feel free to ask if you need anything else. Have a great day!",
                "source": "rule"
            }

        # 1. GUEST MODE - General Information
        if not user_id:
            # Construct a prompt for general information (No data fetching needed)
            system_prompt = f"""
            You are the HireMate General Assistant. Provide professional, extremely brief information about the platform.
            
            BASE KNOWLEDGE:
            - HireMate is an AI-powered recruitment platform for Candidates, Interviewers, and Companies.
            - Candidate Enrollment Process: 1. Go to the Candidate Signup page. 2. Provide your email, full name, and a password. 3. Confirm your email via the link sent to your inbox. 4. Complete your profile by uploading a resume. 5. Take the proctored AI Quiz to become interview-eligible.
            - Role 1 (Candidate): Recruitment features include a progressive resume builder, AI skill quizzes, and AI Proctoring (monitoring via webcam and eye tracking to prevent cheating).
            - Role 2 (Interviewer): Offers automated interview scheduling and live proctoring dashboards.
            - Role 3 (Company): Includes job posting, candidate management, and AI-powered resume analysis.
            
            STRICT RULES:
            - When asked how to enroll or join, explain the step-by-step process for candidates clearly (Signup -> Confirm Email -> Complete Profile -> AI Quiz).
            - DO NOT use markdown formatting (no bolding with **, no italics, no bullet points).
            - Always provide answers in professional, clean plain text.
            - Keep answers to 2-3 sentences max.
            """
            try:
                response = generate_with_fallback(f"{system_prompt}\n\nUser Question: {query}\nAnswer:")
                return {
                    "answer": response.text,
                    "source": "faq"
                }
            except:
                return {
                    "answer": "HireMate is an AI recruitment platform for Candidates, Interviewers, and Companies. Please log in to see specific features.",
                    "source": "rule"
                }

        # 2. AUTHENTICATED MODE - Decision Explainer
        intent = detect_intent(query)
        data = get_candidate_data(user_id)
        
        if not data or not data["tests"]:
            return {
                "answer": "I don't see any record of a test attempt for your account. Once you complete a quiz, I can explain your results!",
                "source": "rule"
            }

        tests = data["tests"]
        profile = data["profile"]
        upcoming_interviews = data["upcoming_interviews"]
        
        # Sort tests to find best score
        completed_tests = [t for t in tests if t.get("status") == "completed"]
        best_test = max(completed_tests, key=lambda x: x.get("score_percentage", 0)) if completed_tests else None
        latest_test = tests[0] if tests else None
        
        # 1. PREDEFINED FAQ ENGINE (Rule-based matching)
        if intent == "disqualification" and latest_test["status"] == "terminated":
            reason = latest_test.get("termination_reason", "multiple proctoring violations")
            return {
                "answer": f"Your latest quiz was terminated because the system detected {reason}. To maintain fairness, all tests must be taken under strict proctoring rules.",
                "source": "faq"
            }
        
        if intent == "eligibility":
            if upcoming_interviews:
                interview = upcoming_interviews[0]
                date_str = interview.get("scheduled_at")
                return {
                    "answer": f"You already have a live interview scheduled for {date_str}. You can find the link and details in your 'My Interviews' section.",
                    "source": "faq"
                }
            
            is_eligible = profile.get("interview_eligible", False)
            if is_eligible:
                return {
                    "answer": "Congratulations! You are eligible for an interview. You can now proceed to the 'Book Interview' section in your dashboard.",
                    "source": "faq"
                }
            else:
                return {
                    "answer": "You are not yet eligible for an interview. This usually requires passing the AI Quiz with a score above 80% and having a clean proctoring record.",
                    "source": "faq"
                }

        if intent == "process":
            if not completed_tests:
                return {
                    "answer": "Your next step is to complete the AI Quiz to evaluate your skills. Once finished, the system will determine your interview eligibility.",
                    "source": "faq"
                }
            if upcoming_interviews:
                return {
                    "answer": "You have an interview scheduled! Your next step is to prepare for the session and join via the provided link at the scheduled time.",
                    "source": "faq"
                }
            if profile.get("interview_eligible"):
                return {
                    "answer": "You have already qualified for an interview! Your next step is to go to the 'Book Interview' section and schedule a time with our team.",
                    "source": "faq"
                }
            return {
                "answer": "You have completed the quiz. Your next step is to wait for the final review. In the meantime, ensure your resume is fully updated.",
                "source": "faq"
            }

        # 2. AI EXPLAINER (Fallback for natural language formatting of stats)
        # Construct context for AI
        context = {
            "name": profile.get("full_name"),
            "best_completed_score": best_test.get("score_percentage") if best_test else None,
            "latest_test_status": latest_test["status"],
            "latest_test_score": latest_test.get("score_percentage"),
            "is_latest_in_progress": latest_test["status"] == "in_progress",
            "proctoring_violations_count": len(latest_test.get("proctoring_logs") or []),
            "interview_eligible": profile.get("interview_eligible"),
            "has_scheduled_interview": len(upcoming_interviews) > 0,
            "upcoming_interview_date": upcoming_interviews[0].get("scheduled_at") if upcoming_interviews else None
        }

        system_prompt = f"""
        You are the HireMate Assistant. You have two roles:
        1. Explainer: Explain the provided CANDIDATE DATA (name, scores, status) professionally.
        2. Knowledge Base: Answer general questions about HireMate features using the BACKGROUND KNOWLEDGE.
        
        CANDIDATE DATA (FACTS about the current logged-in user):
        {json.dumps(context, indent=2)}
        
        BACKGROUND KNOWLEDGE:
        - HireMate is an AI recruitment platform.
        - Resume Requirement: Yes, candidates MUST create/upload a resume to Apply for jobs or Book Interviews.
        - Features: AI Proctoring (monitoring via camera/gaze), AI Quizzes, Automated Scheduling.
        - Process: Signup -> Confirm Email -> Complete Profile (Resume) -> Take AI Quiz -> Book Interview (if eligible).
        
        STRICT RULES:
        1. If the user asks about themselves (e.g. 'What is my name?', 'My score?'), use the CANDIDATE DATA.
        2. If the user asks a general question (e.g. 'Do I need a resume?', 'What is proctoring?'), use the BACKGROUND KNOWLEDGE.
        3. Do not confuse the user's personal status with general rules.
        4. NEVER make new decisions. ONLY explain existing data.
        5. Be professional and brief (2-3 sentences max).
        6. No markdown formatting (no ** or italics).
        """

        try:
            response = generate_with_fallback(f"{system_prompt}\n\nUser Question: {query}\nAnswer:")
            return {
                "answer": response.text,
                "source": "ai_explainer"
            }
        except Exception as e:
            print(f"AI Explainer Error: {e}")
            return {
                "answer": "I'm having trouble explaining your results right now. Please check your dashboard for the raw score and proctoring status.",
                "source": "rule"
            }
    except Exception as e:
        import traceback
        print(f"Chatbot Logic Error: {e}")
        traceback.print_exc()
        return {
            "answer": "I encountered an error while processing your request. Please try again later.",
            "source": "rule"
        }
