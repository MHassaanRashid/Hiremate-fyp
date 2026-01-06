from fastapi import APIRouter, Depends, HTTPException
from typing import Any

from schema.settings_schema import (
    ProfileSettingsSchema,
    ProfileSettingsResponseSchema,
    UpdatePasswordRequestSchema,
    PrivacySettingsSchema,
    NotificationSettingsSchema,
    ApplicationPreferencesSchema,
    ExportDataResponseSchema,
)
from service.settings_service import SettingsService
from app.routers.auth_dependency import get_current_user
from app.core.extension import supabase_client as supabase

router = APIRouter()


# -------- Profile settings ---------


@router.get("/profile", response_model=ProfileSettingsResponseSchema)
async def get_profile_settings(user: Any = Depends(get_current_user)):
    try:
        return SettingsService.get_profile_settings(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile settings: {str(e)}")


@router.put("/profile")
async def update_profile_settings(
    payload: ProfileSettingsSchema,
    user: Any = Depends(get_current_user),
):
    try:
        return SettingsService.update_profile_settings(user, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile settings: {str(e)}")


# -------- Account security ---------


@router.put("/password")
async def change_password(
    payload: UpdatePasswordRequestSchema,
    user: Any = Depends(get_current_user),
):
    """Change password using Supabase auth.

    Note: this verifies the current password by attempting a sign-in, then updates to the new one.
    """
    try:
        email = getattr(user, "email", None)
        if not email:
            raise HTTPException(status_code=400, detail="User email not found")

        # Verify current password by signing in
        auth = supabase.auth
        auth.sign_in_with_password({"email": email, "password": payload.current_password})

        # Update to new password
        auth.update_user({"password": payload.new_password})

        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        # Hide detailed error for security
        raise HTTPException(status_code=400, detail="Failed to update password") from e


# -------- Privacy & visibility ---------


@router.get("/privacy", response_model=PrivacySettingsSchema)
async def get_privacy_settings(user: Any = Depends(get_current_user)):
    try:
        return SettingsService.get_privacy_settings(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch privacy settings: {str(e)}")


@router.put("/privacy")
async def update_privacy_settings(
    payload: PrivacySettingsSchema,
    user: Any = Depends(get_current_user),
):
    try:
        return SettingsService.update_privacy_settings(user, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update privacy settings: {str(e)}")


# -------- Notifications ---------


@router.get("/notifications", response_model=NotificationSettingsSchema)
async def get_notification_settings(user: Any = Depends(get_current_user)):
    try:
        return SettingsService.get_notification_settings(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notification settings: {str(e)}")


@router.put("/notifications")
async def update_notification_settings(
    payload: NotificationSettingsSchema,
    user: Any = Depends(get_current_user),
):
    try:
        return SettingsService.update_notification_settings(user, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notification settings: {str(e)}")


# -------- Application preferences ---------


@router.get("/application-preferences", response_model=ApplicationPreferencesSchema)
async def get_application_preferences(user: Any = Depends(get_current_user)):
    try:
        return SettingsService.get_application_preferences(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch application preferences: {str(e)}")


@router.put("/application-preferences")
async def update_application_preferences(
    payload: ApplicationPreferencesSchema,
    user: Any = Depends(get_current_user),
):
    try:
        return SettingsService.update_application_preferences(user, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update application preferences: {str(e)}")


# -------- Data export ---------


@router.post("/export-data", response_model=ExportDataResponseSchema)
async def export_data(user: Any = Depends(get_current_user)):
    try:
        return SettingsService.export_personal_data(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")


# -------- Account deletion ---------


@router.delete("/account")
async def request_account_deletion(user: Any = Depends(get_current_user)):
    try:
        return SettingsService.request_account_deletion(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to request account deletion: {str(e)}")
