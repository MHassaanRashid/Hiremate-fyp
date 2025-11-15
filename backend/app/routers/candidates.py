from fastapi import APIRouter, HTTPException
import traceback

router = APIRouter()

@router.get("/{user_id}")
async def get_candidate_dashboard(user_id: str):
    try:
        # import Supabase inside the function to avoid circular import
        from app.core.extension import supabase_client

        # ---- Profile (resume + AI score) ----
        profile_res = supabase_client.table("profiles")\
            .select("resume_uploaded, ai_score")\
            .eq("id", user_id)\
            .single().execute()

        profile_data = profile_res.data or {"resume_uploaded": False, "ai_score": 0}
        resume_uploaded = profile_data.get("resume_uploaded", False)
        ai_score = profile_data.get("ai_score", 0)

        # ---- Skills ----
        skills_res = supabase_client.table("skills")\
            .select("skill, score")\
            .eq("user_id", user_id).execute()
        skills = skills_res.data or []

        # ---- Interviews ----
        interviews_res = supabase_client.table("interviews")\
            .select("id, company, position, date, status, score, created_at, updated_at")\
            .eq("user_id", user_id)\
            .order("date", desc=True).execute()
        interviews = interviews_res.data or []

        # ---- Stats ----
        scheduled = sum(1 for i in interviews if i.get("status") == "scheduled")
        completed = sum(1 for i in interviews if i.get("status") == "completed")

        return {
            "resume_uploaded": resume_uploaded,
            "ai_score": ai_score,
            "skills": skills,
            "interviews": interviews,
            "stats": {
                "scheduled": scheduled,
                "completed": completed
            }
        }

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Server error occurred")
