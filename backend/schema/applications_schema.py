from pydantic import BaseModel, Field
from typing import List, Dict, Optional


class ApplicationListItemSchema(BaseModel):
    """Lightweight application item used in the applications list view."""

    id: str
    jobTitle: str
    company: str
    companyLogo: Optional[str] = None
    appliedDate: str  # ISO date string
    status: str  # raw status from DB (e.g. applied, viewed, shortlisted, rejected, accepted)
    pipelineStage: str  # normalized stage for pipeline visualization
    lastUpdatedAt: Optional[str] = None
    nextStep: Optional[str] = None
    location: Optional[str] = None
    employmentType: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationsMetaSchema(BaseModel):
    """Metadata for paginated applications list."""

    page: int
    pageSize: int
    total: int
    totalPages: int
    # e.g. {"applied": 10, "shortlisted": 3, "rejected": 5}
    statusCounts: Dict[str, int] = Field(default_factory=dict)


class ApplicationsListResponseSchema(BaseModel):
    """Response envelope for the applications list endpoint."""

    items: List[ApplicationListItemSchema]
    meta: ApplicationsMetaSchema


class BulkApplicationsActionRequestSchema(BaseModel):
    """Request body for bulk actions on applications (withdraw, archive)."""

    applicationIds: List[str] = Field(..., min_items=1)


class ExportApplicationsQuerySchema(BaseModel):
    """Validated export query used internally by the service layer."""

    format: str = Field("csv", pattern="^(csv|CSV)$")
