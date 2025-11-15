from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any, Dict
from app.core.extension import supabase_client as supabase  # keep your existing import
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = ""
    role: Optional[str] = "candidate"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def _extract_user_and_session(resp: Any) -> Dict[str, Any]:
    """
    Normalize supabase responses into a dict with keys:
      - user (or None)
      - session (or None)
      - error (or None)
    Works with different supabase-py response shapes.
    """
    # If response is mapping-like with 'error' / 'data'
    try:
        # dict-like responses
        if isinstance(resp, dict):
            # new supabase-py may return {'data': {...}, 'error': None}
            err = resp.get("error") or (resp.get("data") and resp["data"].get("error"))
            # try several paths for user/session
            user = None
            session = None
            # top-level
            if resp.get("user"):
                user = resp.get("user")
            if resp.get("session"):
                session = resp.get("session")
            # inside 'data'
            data = resp.get("data") or {}
            user = user or data.get("user")
            session = session or data.get("session")
            return {"user": user, "session": session, "error": err}
    except Exception:
        pass

    # If response is an object with attributes (older style)
    user = getattr(resp, "user", None)
    session = getattr(resp, "session", None)
    error = getattr(resp, "error", None)
    # Some object responses use data / error dict
    if not error:
        try:
            err = getattr(resp, "get", None) and resp.get("error")
            if err:
                error = err
        except Exception:
            pass

    return {"user": user, "session": session, "error": error}


@router.post("/signup")
async def signup(request_data: SignupRequest):
    email = request_data.email.strip().lower()
    password = request_data.password
    full_name = request_data.full_name or ""
    role = request_data.role or "candidate"

    payload = {
        "email": email,
        "password": password,
        "options": {
            "data": {"full_name": full_name, "role": role},
            # make sure this redirect is configured in your Supabase project URL settings
            "email_redirect_to": "http://localhost:3000/auth",
        },
    }

    try:
        response = supabase.auth.sign_up(payload)
    except Exception as e:
        logger.exception("Supabase sign_up raised an exception")
        raise HTTPException(status_code=502, detail=f"Auth provider error: {str(e)}")

    # Normalize response
    parsed = _extract_user_and_session(response)
    if parsed.get("error"):
        # If Supabase returned an error object or message, forward it
        err = parsed.get("error")
        # error might be dict or string
        detail = err if isinstance(err, str) else getattr(err, "message", str(err))
        raise HTTPException(status_code=400, detail=f"Signup failed: {detail}")

    user = parsed.get("user")
    session = parsed.get("session")

    if not user:
        # No user returned — treat as failure
        raise HTTPException(status_code=400, detail="Signup failed: no user returned from auth provider")

    # Insert or upsert minimal profile record
    try:
        supabase.table("profiles").upsert(
            {
                "id": user.id,
                "email": email,
                "full_name": full_name,
                "role": role,
                "resume_uploaded": False,
                "ai_score": 0,
            }
        ).execute()
    except Exception as e:
        # profile insert shouldn't stop signup; log and continue
        logger.exception("Profile upsert failed for user %s: %s", getattr(user, "id", "<unknown>"), e)

    return {
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "email": email,
            "full_name": full_name,
            "role": role,
        },
        "email_confirmation_required": not bool(session),
    }


@router.post("/login")
async def login(request_data: LoginRequest):
    email = request_data.email.strip().lower()
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": request_data.password})
    except Exception as e:
        logger.exception("Supabase sign_in_with_password raised an exception")
        raise HTTPException(status_code=502, detail=f"Auth provider error: {str(e)}")

    parsed = _extract_user_and_session(response)
    if parsed.get("error"):
        err = parsed.get("error")
        detail = err if isinstance(err, str) else getattr(err, "message", str(err))
        raise HTTPException(status_code=401, detail=f"Login failed: {detail}")

    user = parsed.get("user")
    session = parsed.get("session")
    if not user or not session:
        raise HTTPException(status_code=401, detail="Invalid credentials or email not confirmed")

    # Fetch profile safely
    try:
        profile_res = supabase.table("profiles").select("role, full_name").eq("id", user.id).execute()
        profile_data = getattr(profile_res, "data", None) or (profile_res.get("data") if isinstance(profile_res, dict) else None)
        role = profile_data[0]["role"] if profile_data else "candidate"
        full_name = profile_data[0]["full_name"] if profile_data else getattr(user, "user_metadata", {}).get("full_name", "")
    except Exception:
        logger.exception("Failed to read profile for user %s", user.id)
        role = "candidate"
        full_name = getattr(user, "user_metadata", {}).get("full_name", "")

    return {
        "message": "Login successful",
        "access_token": getattr(session, "access_token", None) or (session.get("access_token") if isinstance(session, dict) else None),
        "refresh_token": getattr(session, "refresh_token", None) or (session.get("refresh_token") if isinstance(session, dict) else None),
        "user": {
            "id": user.id,
            "email": getattr(user, "email", None),
            "full_name": full_name,
            "role": role,
        },
    }


@router.get("/user")
async def get_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    token = authorization.split(" ", 1)[1]
    try:
        resp = supabase.auth.get_user(token)
    except Exception as e:
        logger.exception("Supabase get_user failed")
        raise HTTPException(status_code=502, detail=f"Auth provider error: {str(e)}")

    # parse a few shapes
    user = None
    if isinstance(resp, dict):
        user = resp.get("user") or (resp.get("data") and resp["data"].get("user"))
    else:
        user = getattr(resp, "user", None)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token or user not found")

    # Ensure profile exists, create if missing
    try:
        profile_res = supabase.table("profiles").select("role, full_name").eq("id", user.id).execute()
        profile_data = getattr(profile_res, "data", None) or (profile_res.get("data") if isinstance(profile_res, dict) else None)
        if not profile_data:
            full_name = (getattr(user, "user_metadata", {}) or {}).get("full_name") or (getattr(user, "user_metadata", {}) or {}).get("name") or (getattr(user, "email", "") or "").split("@")[0]
            default_role = "candidate"
            supabase.table("profiles").insert({
                "id": user.id,
                "email": getattr(user, "email", ""),
                "full_name": full_name,
                "role": default_role,
                "resume_uploaded": False,
                "ai_score": 0,
            }).execute()
            role = default_role
        else:
            role = profile_data[0]["role"]
            full_name = profile_data[0]["full_name"]
    except Exception:
        logger.exception("Profile fetch/create failed for user %s", getattr(user, "id", "<unknown>"))
        role = "candidate"
        full_name = (getattr(user, "user_metadata", {}) or {}).get("full_name", "") or getattr(user, "email", "").split("@")[0]

    return {
        "user": {
            "id": user.id,
            "email": getattr(user, "email", None),
            "full_name": full_name,
            "role": role,
        }
    }
