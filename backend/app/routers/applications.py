from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response
from typing import Any, List, Optional

from service.applications_service import ApplicationsService
from schema.applications_schema import (
    ApplicationsListResponseSchema,
    BulkApplicationsActionRequestSchema,
)

from app.routers.auth_dependency import get_current_user

router = APIRouter()


@router.get("", response_model=ApplicationsListResponseSchema)
async def list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by job title or company"),
    status: Optional[str] = Query(
        None,
        description="Comma-separated list of statuses (e.g. applied,shortlisted,interview)",
    ),
    date_from: Optional[str] = Query(None, description="Filter by applied_date >= date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter by applied_date <= date (YYYY-MM-DD)"),
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
    user: Any = Depends(get_current_user),
):
    """Get paginated candidate applications for the authenticated user."""
    try:
        statuses: Optional[List[str]] = (
            [s.strip() for s in status.split(",") if s.strip()] if status else None
        )
        return ApplicationsService.list_applications(
            user_id=user.id,
            page=page,
            page_size=page_size,
            search=search,
            statuses=statuses,
            date_from=date_from,
            date_to=date_to,
            sort=sort,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")


@router.post("/bulk/withdraw")
async def bulk_withdraw_applications(
    payload: BulkApplicationsActionRequestSchema,
    user: Any = Depends(get_current_user),
):
    """Set status=withdrawn for selected applications belonging to the current user."""
    try:
        return ApplicationsService.bulk_update_status(
            user_id=user.id,
            application_ids=payload.applicationIds,
            new_status="withdrawn",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to withdraw applications: {str(e)}")


@router.post("/bulk/archive")
async def bulk_archive_applications(
    payload: BulkApplicationsActionRequestSchema,
    user: Any = Depends(get_current_user),
):
    """Set status=archived for selected applications belonging to the current user.

    Note: This assumes the `status` column accepts 'archived'. If your schema differs,
    adjust this value or add an `archived` boolean column instead.
    """
    try:
        return ApplicationsService.bulk_update_status(
            user_id=user.id,
            application_ids=payload.applicationIds,
            new_status="archived",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to archive applications: {str(e)}")


@router.get("/export")
async def export_applications(
    format: str = Query("csv", pattern="^(csv|CSV)$"),
    user: Any = Depends(get_current_user),
):
    """Export all applications for the current user as CSV.

    The frontend can trigger a download using the returned text content.
    """
    try:
        csv_content = ApplicationsService.export_applications(user_id=user.id, format=format)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=applications.csv",
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export applications: {str(e)}")
