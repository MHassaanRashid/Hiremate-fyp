# backend/app/routers/dashboard.py

from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Any
from service.dashboard_service import DashboardService
from schema.dashboard_schema import UpdateProfileStrengthRequest

router = APIRouter()


# ----------------------------
# Helper function: Get current user
# ----------------------------
async def get_current_user(authorization: str = Header(None)) -> Any:
    """Extract and validate user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    token = authorization.split(" ")[1]
    try:
        from app.core.extension import supabase_client as supabase
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None) or user_response.get("user")
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


# ----------------------------
# Routes
# ----------------------------

@router.get("/")
async def get_dashboard_data(user=Depends(get_current_user)):
    """
    Get complete dashboard data for the authenticated candidate
    
    Returns:
        - profile: Candidate profile with name, completion, avatar
        - stats: Dashboard statistics (applications, interviews, views, score)
        - applications: Recent job applications
        - recommendedJobs: AI-matched job recommendations
        - interviews: Upcoming scheduled interviews
        - profileStrength: Profile completeness indicators
        - activity: Recent activity feed
    """
    try:
        return DashboardService.get_dashboard_data(user)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")


@router.put("/profile-strength")
async def update_profile_strength(user=Depends(get_current_user)):
    """
    Recalculate and update profile strength based on current profile and resume data
    
    This automatically fetches profile and resume data to calculate strength
    """
    try:
        return DashboardService.update_profile_strength(user)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile strength: {str(e)}")


@router.get("/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    """Get only dashboard statistics (lighter endpoint)"""
    try:
        full_data = DashboardService.get_dashboard_data(user)
        return {
            "profile": full_data["profile"],
            "stats": full_data["stats"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")
