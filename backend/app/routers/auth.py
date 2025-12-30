from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any, Dict
from app.core.extension import supabase_client as supabase
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
router = APIRouter()


# =========================
# Models
# =========================

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = ""
    role: Optional[str] = "candidate"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None


# =========================
# Helpers
# =========================

def normalize_role(role: Optional[str]) -> Optional[str]:
    if not role:
        return None
    role = role.lower().strip()
    if role == "company":
        return "recruiter"
    if role in ["candidate", "recruiter", "interviewer", "admin"]:
        return role
    return None


def _extract_user_and_session(resp: Any) -> Dict[str, Any]:
    try:
        if isinstance(resp, dict):
            data = resp.get("data") or {}
            return {
                "user": resp.get("user") or data.get("user"),
                "session": resp.get("session") or data.get("session"),
                "error": resp.get("error") or data.get("error"),
            }
    except Exception:
        pass

    return {
        "user": getattr(resp, "user", None),
        "session": getattr(resp, "session", None),
        "error": getattr(resp, "error", None),
    }


# =========================
# Signup
# =========================

@router.post("/signup")
async def signup(request_data: SignupRequest):
    email = request_data.email.strip().lower()
    full_name = request_data.full_name or ""
    role = normalize_role(request_data.role) or "candidate"

    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": request_data.password,
            "options": {
                "data": {"full_name": full_name, "role": role},
                "email_redirect_to": f"http://localhost:3000/auth/callback?role={role}",
            },
        })
    except Exception as e:
        logger.exception("Signup failed")
        raise HTTPException(status_code=502, detail=str(e))

    parsed = _extract_user_and_session(response)
    user = parsed.get("user")
    if not user:
        raise HTTPException(status_code=400, detail="Signup failed")

    try:
        supabase.table("profiles").upsert({
            "id": user.id,
            "email": email,
            "full_name": full_name,
            "role": role,
        }).execute()
    except Exception as e:
        logger.exception("Profile creation failed")
        raise HTTPException(status_code=502, detail=str(e))

    return {
        "message": "User created",
        "user": {"id": user.id, "email": email, "full_name": full_name, "role": role},
    }


# =========================
# Login
# =========================

@router.post("/login")
async def login(request_data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request_data.email.strip().lower(),
            "password": request_data.password,
        })
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
             raise HTTPException(status_code=401, detail="Invalid login credentials")
        if "Email not confirmed" in error_msg:
             raise HTTPException(status_code=400, detail="Email not confirmed")
        logger.error(f"Login error: {error_msg}")
        raise HTTPException(status_code=502, detail=error_msg)

    parsed = _extract_user_and_session(response)
    user = parsed.get("user")
    session = parsed.get("session")

    if not user or not session:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Always fetch authoritative role from profiles table
    # user_metadata can be stale (e.g. if role was changed in DB manually)
    try:
        profile_res = supabase.table("profiles").select("role, full_name").eq("id", user.id).execute()
        profile = profile_res.data
        role = profile[0]["role"] if profile else "candidate"
        full_name = profile[0]["full_name"] if profile else ""
    except Exception:
        # Fallback to metadata only if DB fails completely
        user_meta = getattr(user, "user_metadata", {}) or {}
        role = user_meta.get("role") or "candidate"
        full_name = ""

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": full_name,
            "role": role,
        },
    }


# =========================
# OAuth / Session User
# =========================

@router.get("/user")
async def get_user(
    authorization: Optional[str] = Header(None),
    role: Optional[str] = Query(None),
):
    logger.info("🔍 GET /auth/user")
    normalized_role = normalize_role(role)
    logger.info(f"🔍 Normalized role: {normalized_role}")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ", 1)[1]

    try:
        user_resp = supabase.auth.get_user(token)
        user = getattr(user_resp, "user", None) or user_resp.get("user")
    except Exception as e:
        logger.exception("Failed to fetch user from Supabase")
        raise HTTPException(status_code=502, detail=str(e))

    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        profile_res = supabase.table("profiles").select("*").eq("id", user.id).execute()
        profile = profile_res.data
    except Exception as e:
        logger.exception("Failed to fetch profile")
        profile = []

    # New user
    if not profile:
        final_role = normalized_role or "candidate"
        full_name = getattr(user, "user_metadata", {}).get("full_name") or getattr(user, "user_metadata", {}).get("name") or user.email.split("@")[0]

        try:
            supabase.table("profiles").insert({
                "id": user.id,
                "email": user.email,
                "full_name": full_name,
                "role": final_role,
                "resume_uploaded": False,
                "ai_score": 0,
            }).execute()
            logger.info(f"🆕 Profile created with role {final_role}")
        except Exception as e:
            logger.exception("Failed to insert new profile")
            raise HTTPException(status_code=502, detail=str(e))

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": full_name,
                "role": final_role,
            }
        }

    # Existing user
    actual_role = profile[0]["role"]
    full_name = profile[0]["full_name"]
    final_role = actual_role

    # Only update role when EXPLICITLY requested during OAUTH LOGIN/SIGNUP flows,
    # NOT on every session validation.
    # The 'role' query param is usually only present during the initial oauth callback.
    if normalized_role and actual_role == "candidate" and normalized_role != "candidate":
         # Only update if the user's current role is 'candidate' (default) and they are requesting a new role
        try:
            supabase.table("profiles").update({"role": normalized_role}).eq("id", user.id).execute()
            final_role = normalized_role
            logger.info(f"🔁 Role updated to {final_role}")
        except Exception as e:
            logger.warning(f"Failed to update profile role: {e}")

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": full_name,
            "role": final_role,
        }
    }
