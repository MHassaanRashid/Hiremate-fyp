from fastapi import APIRouter, Query, HTTPException
from app.services.faq_service import get_faq_answer

router = APIRouter(prefix="/api/faq", tags=["FAQ"])

@router.get("/ask")
async def ask_faq(query: str = Query(..., min_length=1, description="The user's question")):
    """
    Endpoint to ask the AI FAQ bot a question.
    """
    try:
        answer = get_faq_answer(query)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
