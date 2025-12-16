from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal, Dict, Any


# -------- Profile settings ---------

class ProfileLinks(BaseModel):
    portfolio: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class ProfileSettingsSchema(BaseModel):
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    links: ProfileLinks = Field(default_factory=ProfileLinks)


class ProfileSettingsResponseSchema(ProfileSettingsSchema):
    sessions: Optional[List[Dict[str, Any]]] = None  # recent login/session activity


class UpdatePasswordRequestSchema(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# -------- Privacy & visibility ---------

ProfileVisibility = Literal["public", "employers_only", "private"]
JobSearchStatus = Literal["active", "passive", "not_looking"]


class PrivacySettingsSchema(BaseModel):
    profile_visibility: ProfileVisibility = "employers_only"
    job_search_status: JobSearchStatus = "active"
    share_profile_with_employers: bool = True
    share_resume_with_employers: bool = True
    allow_contact_by_email: bool = True
    allow_contact_by_phone: bool = False
    allow_third_party_sharing: bool = False


# -------- Notifications ---------

class NotificationSettingsSchema(BaseModel):
    job_recommendations_email: bool = True
    application_updates_email: bool = True
    profile_views_email: bool = True
    interview_invitations_email: bool = True
    marketing_email: bool = False

    push_enabled: bool = False
    frequency: Literal["immediate", "daily", "weekly"] = "immediate"


# -------- Application preferences ---------

class ApplicationPreferencesSchema(BaseModel):
    default_resume_id: Optional[str] = None
    auto_fill_enabled: bool = True
    preferred_job_types: List[str] = Field(
        default_factory=lambda: ["full_time", "remote"]
    )
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    preferred_locations: List[str] = Field(default_factory=list)
    preferred_industries: List[str] = Field(default_factory=list)
    preferred_roles: List[str] = Field(default_factory=list)


# -------- Data export ---------

class ExportDataResponseSchema(BaseModel):
    """JSON payload returned by export-data endpoint.

    Frontend can convert this to downloadable JSON or a formatted document.
    """

    profile: Dict[str, Any]
    resume: Optional[Dict[str, Any]] = None
    applications: List[Dict[str, Any]] = Field(default_factory=list)
    interviews: List[Dict[str, Any]] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)
    activity: List[Dict[str, Any]] = Field(default_factory=list)
