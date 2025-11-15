// frontend/lib/api/endpoints.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

const RESUME_API_BASE = `${BACKEND_URL}/resume`;

export const ResumeEndpoints = {
  GET_FULL_RESUME: `${RESUME_API_BASE}/`,
  SAVE_FULL_RESUME: `${RESUME_API_BASE}/save`,
  SAVE_SECTION: `${RESUME_API_BASE}/save-section`,
  GET_SECTION: (section: string) => `${RESUME_API_BASE}/sections/${section}`,
  DELETE_RESUME: `${RESUME_API_BASE}/`,
  GET_TEMPLATES: `${RESUME_API_BASE}/templates`,
  ANALYZE: `${RESUME_API_BASE}/analyze`,
};
