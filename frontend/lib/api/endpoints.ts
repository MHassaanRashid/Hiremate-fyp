// frontend/lib/api/endpoints.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const RESUME_API_BASE = `${BACKEND_URL}/resume`;
const DASHBOARD_API_BASE = `${BACKEND_URL}/dashboard`;
const APPLICATIONS_API_BASE = `${BACKEND_URL}/applications`;
const SETTINGS_API_BASE = `${BACKEND_URL}/candidate/settings`;

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

export const ApplicationsEndpoints = {
  LIST: `${APPLICATIONS_API_BASE}/`,
  BULK_WITHDRAW: `${APPLICATIONS_API_BASE}/bulk/withdraw`,
  BULK_ARCHIVE: `${APPLICATIONS_API_BASE}/bulk/archive`,
  EXPORT: `${APPLICATIONS_API_BASE}/export`,
};

export const SettingsEndpoints = {
  PROFILE_GET: `${SETTINGS_API_BASE}/profile`,
  PROFILE_UPDATE: `${SETTINGS_API_BASE}/profile`,
  PASSWORD_UPDATE: `${SETTINGS_API_BASE}/password`,
  PRIVACY_GET: `${SETTINGS_API_BASE}/privacy`,
  PRIVACY_UPDATE: `${SETTINGS_API_BASE}/privacy`,
  NOTIFICATIONS_GET: `${SETTINGS_API_BASE}/notifications`,
  NOTIFICATIONS_UPDATE: `${SETTINGS_API_BASE}/notifications`,
  APPLICATION_PREFERENCES_GET: `${SETTINGS_API_BASE}/application-preferences`,
  APPLICATION_PREFERENCES_UPDATE: `${SETTINGS_API_BASE}/application-preferences`,
  EXPORT_DATA: `${SETTINGS_API_BASE}/export-data`,
  ACCOUNT_DELETE: `${SETTINGS_API_BASE}/account`,
};
