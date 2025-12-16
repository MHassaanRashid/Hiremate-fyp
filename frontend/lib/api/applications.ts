// frontend/lib/api/applications.ts

import { ApplicationsEndpoints } from "./endpoints";
import { handleResponse } from "../api";

export type ApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected"
  | "accepted"
  | "withdrawn"
  | "pending"
  | "reviewing"
  | "archived";

export interface ApplicationListItem {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string | null;
  appliedDate: string;
  status: ApplicationStatus;
  pipelineStage: string;
  lastUpdatedAt?: string | null;
  nextStep?: string | null;
  location?: string | null;
  employmentType?: string | null;
}

export interface ApplicationStatusCounts {
  [status: string]: number;
}

export interface ApplicationsMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  statusCounts: ApplicationStatusCounts;
}

export interface ApplicationsListResponse {
  items: ApplicationListItem[];
  meta: ApplicationsMeta;
}

export interface ApplicationsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  sort?: "newest" | "oldest";
}

export const getApplications = async (
  token: string,
  query: ApplicationsQuery = {}
): Promise<ApplicationsListResponse> => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("page_size", String(query.pageSize));
  if (query.search) params.set("search", query.search);
  if (query.status && query.status.length > 0) {
    params.set("status", query.status.join(","));
  }
  if (query.dateFrom) params.set("date_from", query.dateFrom);
  if (query.dateTo) params.set("date_to", query.dateTo);
  if (query.sort) params.set("sort", query.sort);

  const url = `${ApplicationsEndpoints.LIST}?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(res);
};

export const bulkWithdrawApplications = async (
  token: string,
  applicationIds: string[]
): Promise<{ message: string }> => {
  const res = await fetch(ApplicationsEndpoints.BULK_WITHDRAW, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ applicationIds }),
  });

  return handleResponse(res);
};

export const bulkArchiveApplications = async (
  token: string,
  applicationIds: string[]
): Promise<{ message: string }> => {
  const res = await fetch(ApplicationsEndpoints.BULK_ARCHIVE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ applicationIds }),
  });

  return handleResponse(res);
};

export const exportApplications = async (
  token: string,
  format: "csv" = "csv"
): Promise<string> => {
  const url = `${ApplicationsEndpoints.EXPORT}?format=${encodeURIComponent(format)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Export endpoint returns plain text (CSV), so we don't use handleResponse here
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to export applications");
  }

  return res.text();
};
