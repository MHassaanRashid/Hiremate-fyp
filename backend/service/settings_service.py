from datetime import datetime
from typing import Any, Dict

from app.core.extension import supabase_client as supabase
from schema.settings_schema import (
    ProfileSettingsSchema,
    ProfileSettingsResponseSchema,
    PrivacySettingsSchema,
    NotificationSettingsSchema,
    ApplicationPreferencesSchema,
    ExportDataResponseSchema,
)


SETTINGS_TABLE = "candidate_settings"
ACCOUNT_DELETION_TABLE = "account_deletion_requests"


class SettingsService:
    """Business logic and persistence for candidate settings."""

    # ---------- Profile ----------

    @staticmethod
    def get_profile_settings(user: Any) -> ProfileSettingsResponseSchema:
        user_id = user.id

        # Base profile from profiles table
        profile_res = (
            supabase
            .table("profiles")
            .select("id, email, full_name, phone, location, avatar_url, portfolio, linkedin, github")
            .eq("id", user_id)
            .single()
            .execute()
        )
        profile = profile_res.data or {}

        links = {
            "portfolio": profile.get("portfolio"),
            "linkedin": profile.get("linkedin"),
            "github": profile.get("github"),
        }

        settings = ProfileSettingsResponseSchema(
            full_name=profile.get("full_name") or getattr(user, "email", "").split("@")[0],
            email=profile.get("email") or getattr(user, "email", ""),
            phone=profile.get("phone"),
            location=profile.get("location"),
            avatar_url=profile.get("avatar_url"),
            links=links,
            sessions=[],
        )

        # Recent login/session-like activity from activities table
        try:
            activity_res = (
                supabase
                .table("activities")
                .select("id, activity_type, title, description, activity_date")
                .eq("user_id", user_id)
                .order("activity_date", desc=True)
                .limit(20)
                .execute()
            )
            sessions = []
            for row in activity_res.data or []:
                if row.get("activity_type") not in ["login", "session"]:
                    continue
                sessions.append(
                    {
                        "id": str(row.get("id")),
                        "type": row.get("activity_type"),
                        "title": row.get("title"),
                        "description": row.get("description"),
                        "timestamp": row.get("activity_date"),
                    }
                )
            settings.sessions = sessions
        except Exception:
            # If activity table doesn't exist or query fails, we still return the profile
            settings.sessions = []

        return settings

    @staticmethod
    def update_profile_settings(user: Any, payload: ProfileSettingsSchema) -> Dict[str, str]:
        user_id = user.id

        # From the candidate portal we always treat the user as a candidate.
        # This avoids violating the profiles_role_check constraint when
        # Supabase auth sets the role to "authenticated".
        role_value = "candidate"

        data = {
            "full_name": payload.full_name,
            "email": payload.email,
            "phone": payload.phone,
            "location": payload.location,
            "avatar_url": payload.avatar_url,
            "portfolio": payload.links.portfolio if payload.links else None,
            "linkedin": payload.links.linkedin if payload.links else None,
            "github": payload.links.github if payload.links else None,
            "role": role_value,
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Upsert into profiles table
        supabase.table("profiles").upsert({"id": user_id, **data}).execute()
        return {"message": "Profile settings updated"}

    # ---------- Settings helper (single row per user) ----------

    @staticmethod
    def _get_or_create_settings_record(user_id: str) -> Dict[str, Any]:
        """Fetch settings row for user or create a default one.

        Uses a regular select/limit instead of `.single()` so we don't error
        when no record exists yet.
        """
        try:
            res = (
                supabase
                .table(SETTINGS_TABLE)
                .select("*")
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            rows = res.data or []
            if rows:
                return rows[0]
        except Exception:
            # If the table is missing or query fails, we fall through and
            # attempt to insert a new record. Any structural issue will then
            # surface on insert which is easier to debug.
            pass

        # create default
        now = datetime.utcnow().isoformat()
        new_record = {
            "user_id": user_id,
            "privacy_json": {},
            "notifications_json": {},
            "application_preferences_json": {},
            "created_at": now,
            "updated_at": now,
        }
        supabase.table(SETTINGS_TABLE).insert(new_record).execute()
        return new_record

    # ---------- Privacy ----------

    @staticmethod
    def get_privacy_settings(user: Any) -> PrivacySettingsSchema:
        user_id = user.id
        record = SettingsService._get_or_create_settings_record(user_id)
        privacy_data = record.get("privacy_json") or {}
        return PrivacySettingsSchema(**privacy_data)  # type: ignore[arg-type]

    @staticmethod
    def update_privacy_settings(user: Any, payload: PrivacySettingsSchema) -> Dict[str, str]:
        user_id = user.id
        now = datetime.utcnow().isoformat()
        SettingsService._get_or_create_settings_record(user_id)
        supabase.table(SETTINGS_TABLE).update(
            {
                "privacy_json": payload.dict(),
                "updated_at": now,
            }
        ).eq("user_id", user_id).execute()
        return {"message": "Privacy settings updated"}

    # ---------- Notifications ----------

    @staticmethod
    def get_notification_settings(user: Any) -> NotificationSettingsSchema:
        user_id = user.id
        record = SettingsService._get_or_create_settings_record(user_id)
        notif_data = record.get("notifications_json") or {}
        return NotificationSettingsSchema(**notif_data)  # type: ignore[arg-type]

    @staticmethod
    def update_notification_settings(
        user: Any, payload: NotificationSettingsSchema
    ) -> Dict[str, str]:
        user_id = user.id
        now = datetime.utcnow().isoformat()
        SettingsService._get_or_create_settings_record(user_id)
        supabase.table(SETTINGS_TABLE).update(
            {
                "notifications_json": payload.dict(),
                "updated_at": now,
            }
        ).eq("user_id", user_id).execute()
        return {"message": "Notification settings updated"}

    # ---------- Application preferences ----------

    @staticmethod
    def get_application_preferences(user: Any) -> ApplicationPreferencesSchema:
        user_id = user.id
        record = SettingsService._get_or_create_settings_record(user_id)
        app_data = record.get("application_preferences_json") or {}
        return ApplicationPreferencesSchema(**app_data)  # type: ignore[arg-type]

    @staticmethod
    def update_application_preferences(
        user: Any, payload: ApplicationPreferencesSchema
    ) -> Dict[str, str]:
        user_id = user.id
        now = datetime.utcnow().isoformat()
        SettingsService._get_or_create_settings_record(user_id)
        supabase.table(SETTINGS_TABLE).update(
            {
                "application_preferences_json": payload.dict(),
                "updated_at": now,
            }
        ).eq("user_id", user_id).execute()
        return {"message": "Application preferences updated"}

    # ---------- Export data ----------

    @staticmethod
    def export_personal_data(user: Any) -> ExportDataResponseSchema:
        user_id = user.id

        # Profile
        profile_res = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        profile = profile_res.data or {}

        # Resume
        resume_res = (
            supabase
            .table("resume")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        resume = resume_res.data if resume_res.data else None

        # Applications
        applications_res = (
            supabase
            .table("applications")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        applications = applications_res.data or []

        # Interviews
        interviews_res = (
            supabase
            .table("interviews")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        interviews = interviews_res.data or []

        # Settings
        try:
            settings_res = (
                supabase
                .table(SETTINGS_TABLE)
                .select("*")
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )
            rows = settings_res.data or []
            settings_row = rows[0] if rows else {}
        except Exception:
            settings_row = {}

        # Activity
        activity_res = (
            supabase
            .table("activities")
            .select("*")
            .eq("user_id", user_id)
            .order("activity_date", desc=True)
            .execute()
        )
        activity = activity_res.data or []

        return ExportDataResponseSchema(
            profile=profile,
            resume=resume,
            applications=applications,
            interviews=interviews,
            settings=settings_row,
            activity=activity,
        )

    # ---------- Account deletion request ----------

    @staticmethod
    def request_account_deletion(user: Any) -> Dict[str, str]:
        user_id = user.id
        now = datetime.utcnow().isoformat()
        supabase.table(ACCOUNT_DELETION_TABLE).insert(
            {
                "user_id": user_id,
                "email": getattr(user, "email", None),
                "requested_at": now,
                "status": "pending",
            }
        ).execute()
        return {"message": "Account deletion requested"}
