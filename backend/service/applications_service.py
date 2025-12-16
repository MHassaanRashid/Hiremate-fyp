from math import ceil
from typing import Dict, List, Optional

from app.core.extension import supabase_client as supabase
from schema.applications_schema import (
    ApplicationListItemSchema,
    ApplicationsListResponseSchema,
    ApplicationsMetaSchema,
)


class ApplicationsService:
    """Service for candidate applications (list, bulk actions, export)."""

    # Pipeline stages in logical order for visualization
    PIPELINE_STAGES: List[str] = [
        "applied",
        "viewed",
        "shortlisted",
        "interview",
        "offer",
        "accepted",
        "rejected",
    ]

    # Map raw DB statuses to pipeline stages
    STATUS_PIPELINE_MAP: Dict[str, str] = {
        # New naming
        "applied": "applied",
        "viewed": "viewed",
        "shortlisted": "shortlisted",
        "interview": "interview",
        "offer": "offer",
        "accepted": "accepted",
        "rejected": "rejected",
        "withdrawn": "rejected",
        # Legacy naming used elsewhere in the project
        "pending": "applied",
        "reviewing": "viewed",
        "scheduled": "interview",
        "completed": "interview",
    }

    @classmethod
    def _normalize_status(cls, status: Optional[str]) -> str:
        if not status:
            return "applied"
        status_lower = status.lower()
        return cls.STATUS_PIPELINE_MAP.get(status_lower, status_lower)

    @classmethod
    def _next_step_for_status(cls, status: str) -> str:
        status = status.lower()
        if status in {"applied", "pending"}:
            return "Awaiting review from employer"
        if status in {"viewed", "reviewing"}:
            return "Employer is reviewing your application"
        if status in {"shortlisted"}:
            return "Prepare for potential interview"
        if status in {"interview", "scheduled"}:
            return "Get ready for your interview"
        if status in {"offer", "accepted"}:
            return "Review and finalize your offer"
        if status in {"rejected", "withdrawn"}:
            return "Consider applying to similar roles"
        return "Track updates from the employer"

    @classmethod
    def list_applications(
        cls,
        *,
        user_id: str,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        statuses: Optional[List[str]] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        sort: str = "newest",
    ) -> ApplicationsListResponseSchema:
        """Return paginated applications for a candidate with filters applied."""

        # Base query
        query = (
            supabase
            .table("applications")
            .select("*", count="exact")
            .eq("user_id", user_id)
        )

        # Filters
        if search:
            like = f"%{search}%"
            # Supabase Python client supports ilike; OR conditions use .or
            query = query.or_(
                f"job_title.ilike.{like},company_name.ilike.{like}"
            )

        if statuses:
            normalized_statuses = [s.lower() for s in statuses]
            query = query.in_("status", normalized_statuses)

        if date_from:
            query = query.gte("applied_date", date_from)
        if date_to:
            query = query.lte("applied_date", date_to)

        # Sorting
        order_desc = sort != "oldest"
        query = query.order("applied_date", desc=order_desc)

        # Pagination (Supabase uses inclusive range)
        from_idx = (page - 1) * page_size
        to_idx = from_idx + page_size - 1
        query = query.range(from_idx, to_idx)

        result = query.execute()
        rows: List[dict] = result.data or []
        total: int = getattr(result, "count", None) or len(rows)

        items: List[ApplicationListItemSchema] = []

        for row in rows:
            raw_status = (row.get("status") or "applied").lower()
            pipeline_stage = cls._normalize_status(raw_status)
            item = ApplicationListItemSchema(
                id=str(row.get("id")),
                jobTitle=row.get("job_title", "Untitled role"),
                company=row.get("company_name", "Unknown company"),
                companyLogo=row.get("company_logo"),
                appliedDate=row.get("applied_date") or row.get("created_at") or "",
                status=raw_status,
                pipelineStage=pipeline_stage,
                lastUpdatedAt=row.get("updated_at") or row.get("applied_date"),
                nextStep=cls._next_step_for_status(raw_status),
                location=row.get("location"),
                employmentType=row.get("employment_type") or row.get("job_type"),
            )
            items.append(item)

        total_pages = ceil(total / page_size) if page_size > 0 else 1

        # Compute status counts for stats (separate lightweight query)
        status_counts: Dict[str, int] = {}
        try:
            status_res = (
                supabase
                .table("applications")
                .select("status")
                .eq("user_id", user_id)
                .execute()
            )
            for row in status_res.data or []:
                s = (row.get("status") or "unknown").lower()
                status_counts[s] = status_counts.get(s, 0) + 1
        except Exception:
            # If this fails, we still return the main list
            status_counts = {}

        meta = ApplicationsMetaSchema(
            page=page,
            pageSize=page_size,
            total=total,
            totalPages=total_pages,
            statusCounts=status_counts,
        )

        return ApplicationsListResponseSchema(items=items, meta=meta)

    @classmethod
    def bulk_update_status(
        cls,
        *,
        user_id: str,
        application_ids: List[str],
        new_status: str,
    ) -> Dict[str, str]:
        if not application_ids:
            return {"message": "No applications selected"}

        (
            supabase
            .table("applications")
            .update({"status": new_status})
            .in_("id", application_ids)
            .eq("user_id", user_id)
            .execute()
        )

        return {"message": f"Updated {len(application_ids)} applications"}

    @classmethod
    def export_applications(
        cls,
        *,
        user_id: str,
        format: str = "csv",
    ) -> str:
        """Return applications as CSV string (frontend can turn into a downloadable file)."""

        res = (
            supabase
            .table("applications")
            .select("id, job_title, company_name, status, applied_date, updated_at")
            .eq("user_id", user_id)
            .order("applied_date", desc=True)
            .execute()
        )
        rows: List[dict] = res.data or []

        header = ["id", "job_title", "company_name", "status", "applied_date", "updated_at"]
        csv_lines = [",".join(header)]
        for row in rows:
            csv_lines.append(
                ",".join(
                    [
                        str(row.get("id", "")),
                        (row.get("job_title") or "").replace(",", " "),
                        (row.get("company_name") or "").replace(",", " "),
                        (row.get("status") or ""),
                        str(row.get("applied_date") or ""),
                        str(row.get("updated_at") or ""),
                    ]
                )
            )

        return "\n".join(csv_lines)
