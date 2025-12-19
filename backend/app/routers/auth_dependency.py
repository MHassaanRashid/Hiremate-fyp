from fastapi import Header, HTTPException
from app.core.extension import supabase_client as supabase

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    token = authorization.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None) or user_response.get("user")
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
