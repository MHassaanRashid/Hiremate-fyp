// frontend/lib/api/settings.ts

import { SettingsEndpoints } from "./endpoints";
import { handleResponse } from "../api";

export type ProfileVisibility = "public" | "employers_only" | "private";
export type JobSearchStatus = "active" | "passive" | "not_looking";
export type NotificationFrequency = "immediate" | "daily" | "weekly";

export interface ProfileLinks {
  portfolio?: string | null;
  linkedin?: string | null;
  github?: string | null;
}

export interface ProfileSettings {
  full_name?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  links: ProfileLinks;
}

export interface ProfileSessionItem {
  id: string;
  type?: string;
  title?: string | null;
  description?: string | null;
  timestamp?: string | null;
}

export interface ProfileSettingsResponse extends ProfileSettings {
  sessions?: ProfileSessionItem[];
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface PrivacySettings {
  profile_visibility: ProfileVisibility;
  job_search_status: JobSearchStatus;
  share_profile_with_employers: boolean;
  share_resume_with_employers: boolean;
  allow_contact_by_email: boolean;
  allow_contact_by_phone: boolean;
  allow_third_party_sharing: boolean;
}

export interface NotificationSettings {
  job_recommendations_email: boolean;
  application_updates_email: boolean;
  profile_views_email: boolean;
  interview_invitations_email: boolean;
  marketing_email: boolean;
  push_enabled: boolean;
  frequency: NotificationFrequency;
}

export interface ApplicationPreferences {
  default_resume_id?: string | null;
  auto_fill_enabled: boolean;
  preferred_job_types: string[];
  salary_min?: number | null;
  salary_max?: number | null;
  preferred_locations: string[];
  preferred_industries: string[];
  preferred_roles: string[];
}

export interface ExportDataResponse {
  profile: Record<string, unknown>;
  resume?: Record<string, unknown> | null;
  applications: Record<string, unknown>[];
  interviews: Record<string, unknown>[];
  settings: Record<string, unknown>;
  activity: Record<string, unknown>[];
}

// ---- API functions ----

export const getProfileSettings = async (token: string): Promise<ProfileSettingsResponse> => {
  const res = await fetch(SettingsEndpoints.PROFILE_GET, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};

export const updateProfileSettings = async (
  token: string,
  data: ProfileSettings
): Promise<{ message: string }> => {
  const res = await fetch(SettingsEndpoints.PROFILE_UPDATE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updatePassword = async (
  token: string,
  payload: UpdatePasswordPayload
): Promise<{ message: string }> => {
  const res = await fetch(SettingsEndpoints.PASSWORD_UPDATE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const getPrivacySettings = async (token: string): Promise<PrivacySettings> => {
  const res = await fetch(SettingsEndpoints.PRIVACY_GET, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};

export const updatePrivacySettings = async (
  token: string,
  data: PrivacySettings
): Promise<{ message: string }> => {
  const res = await fetch(SettingsEndpoints.PRIVACY_UPDATE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getNotificationSettings = async (
  token: string
): Promise<NotificationSettings> => {
  const res = await fetch(SettingsEndpoints.NOTIFICATIONS_GET, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};

export const updateNotificationSettings = async (
  token: string,
  data: NotificationSettings
): Promise<{ message: string }> => {
  const res = await fetch(SettingsEndpoints.NOTIFICATIONS_UPDATE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getApplicationPreferences = async (
  token: string
): Promise<ApplicationPreferences> => {
  const res = await fetch(SettingsEndpoints.APPLICATION_PREFERENCES_GET, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};

export const updateApplicationPreferences = async (
  token: string,
  data: ApplicationPreferences
): Promise<{ message: string }> => {
  const res = await fetch(SettingsEndpoints.APPLICATION_PREFERENCES_UPDATE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const exportPersonalData = async (
  token: string
): Promise<ExportDataResponse> => {
  const res = await fetch(SettingsEndpoints.EXPORT_DATA, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};

export const requestAccountDeletion = async (
  token: string
): Promise<{ message: string }> => {
  const res = await fetch(SettingsEndpoints.ACCOUNT_DELETE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};
