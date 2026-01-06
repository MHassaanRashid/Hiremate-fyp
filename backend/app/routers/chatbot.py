from fastapi import APIRouter, Depends, Query, HTTPException, Header
from app.routers.auth_dependency import get_current_user
from app.services.decision_service import get_chatbot_response

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

@router.get("/ask")
async def ask_chatbot(
    query: str = Query(..., min_length=1),
    authorization: str = Header(None)
):
    """
    Dual-mode Chatbot Endpoint.
    - Authenticated: Provides personalized decision explanations.
    - Guest: Provides general system information and FAQs.
    """
    current_user = None
    if authorization and authorization.startswith("Bearer "):
        try:
            current_user = await get_current_user(authorization)
        except Exception:
            # Fallback to guest mode if token is invalid
            current_user = None

    try:
        user_id = str(current_user.id) if current_user else None
        response = get_chatbot_response(user_id, query)
        return response
    except Exception as e:
        print(f"Chatbot Router Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error in chatbot service.")
