from fastapi import APIRouter, HTTPException, Body
from app.core.extension import supabase_client
from typing import Dict

router = APIRouter(prefix="/candidates", tags=["candidate-management"])


# Get all candidates
@router.get("")
async def get_candidates():
    try:
        response = supabase_client.table("candidates").select("*").execute()
        return response.data or []
    except Exception as e:
        # If the `candidates` table is missing or the query fails, log and
        # return an empty list so the frontend can handle it gracefully.
        import traceback
        print(traceback.format_exc())
        return []


# ----- Resume CRUD -----

# Get a candidate's resume
@router.get("/{candidate_id}/resume")
async def get_resume(candidate_id: str):
    try:
        response = supabase_client.table("resumes")\
            .select("*")\
            .eq("candidate_id", candidate_id)\
            .single().execute()

        if response.data:
            return response.data
        raise HTTPException(status_code=404, detail="Resume not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Create a new resume
@router.post("/{candidate_id}/resume")
async def create_resume(candidate_id: str, data: Dict = Body(...)):
    try:
        data["candidate_id"] = candidate_id
        response = supabase_client.table("resumes").insert(data).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update an existing resume
@router.put("/{candidate_id}/resume")
async def update_resume(candidate_id: str, data: Dict = Body(...)):
    try:
        response = supabase_client.table("resumes").update(data).eq("candidate_id", candidate_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
