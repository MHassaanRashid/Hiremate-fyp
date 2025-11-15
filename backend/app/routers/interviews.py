from fastapi import APIRouter
from app.core.extension import supabase_client

router = APIRouter()


@router.get("/interviews/{user_id}")
async def get_interviews(user_id: str):
    try:
        response = supabase_client.table("interviews")\
            .select("id, company, position, date, status, score, created_at, updated_at")\
            .eq("user_id", user_id)\
            .order("date", desc=True).execute()

        interviews = response.data if response.data else []
        return interviews

    except Exception as e:
        return {"error": str(e)}
