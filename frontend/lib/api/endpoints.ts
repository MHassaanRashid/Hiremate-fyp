// frontend/lib/api/endpoints.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const RESUME_API_BASE = `${BACKEND_URL}/resume`;
const DASHBOARD_API_BASE = `${BACKEND_URL}/dashboard`;

export const ResumeEndpoints = {
  GET_FULL_RESUME: `${RESUME_API_BASE}/`,
  SAVE_FULL_RESUME: `${RESUME_API_BASE}/save`,
  SAVE_SECTION: `${RESUME_API_BASE}/save-section`,
  GET_SECTION: (section: string) => `${RESUME_API_BASE}/sections/${section}`,
  DELETE_RESUME: `${RESUME_API_BASE}/`,
  GET_TEMPLATES: `${RESUME_API_BASE}/templates`,
  ANALYZE: `${RESUME_API_BASE}/analyze`,
};

export const DashboardEndpoints = {
  GET_DASHBOARD_DATA: `${DASHBOARD_API_BASE}/`,
  GET_STATS: `${DASHBOARD_API_BASE}/stats`,
  UPDATE_PROFILE_STRENGTH: `${DASHBOARD_API_BASE}/profile-strength`,
};
