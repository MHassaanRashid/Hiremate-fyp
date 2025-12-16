// frontend/types/applications.ts

import type { ApplicationStatus } from "@/lib/api/applications";

export interface CandidateApplicationListItem {
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

export interface CandidateApplicationsMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export interface CandidateApplicationsResponse {
  items: CandidateApplicationListItem[];
  meta: CandidateApplicationsMeta;
}
