// frontend/lib/api/dashboard.ts

import { DashboardEndpoints } from './endpoints';
import { handleResponse } from '../api';

/* ===========================================================
   DASHBOARD API TYPES
   =========================================================== */

export interface CandidateProfile {
  name: string;
  full_name?: string;
  profileCompletion: number;
  avatar?: string;
}

export interface DashboardStats {
  applicationsSubmitted: number;
  interviewsScheduled: number;
  profileViews: number;
  profileScore: number;
  // Trend fields (percentage change from previous period)
  applicationsTrend?: number;
  profileViewsTrend?: number;
  interviewsTrend?: number;
  profileScoreTrend?: number;
}

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
}

export interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  matchPercentage: number;
  logo?: string;
  location: string;
  type: string;
}

export interface Interview {
  id: string;
  position: string;
  company: string;
  date: string;
  time: string;
  type: 'online' | 'in-person' | 'phone';
  meetingLink?: string;
}

export interface ProfileStrength {
  resume: boolean;
  skills: boolean;
  photo: boolean;
  experience: boolean;
  education: boolean;
  certifications: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'view' | 'status_change' | 'message' | 'recommendation';
  message: string;
  timestamp: string;
}

export interface DashboardData {
  profile: CandidateProfile;
  stats: DashboardStats;
  applications: Application[];
  recommendedJobs: RecommendedJob[];
  interviews: Interview[];
  profileStrength: ProfileStrength;
  activity: ActivityItem[];
}

export interface UpdateProfileStrengthRequest {
  has_resume?: boolean;
  has_skills?: boolean;
  has_photo?: boolean;
  has_experience?: boolean;
  has_education?: boolean;
  has_certifications?: boolean;
}

/* ===========================================================
   DASHBOARD API FUNCTIONS
   =========================================================== */

/**
 * Get complete dashboard data for the authenticated candidate
 * @param token - JWT access token
 * @returns Complete dashboard data including profile, stats, applications, etc.
 */
export const getDashboardData = async (token: string): Promise<DashboardData> => {
  try {
    const res = await fetch(DashboardEndpoints.GET_DASHBOARD_DATA, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error(`Failed to fetch dashboard data: ${error}`);
  }
};

/**
 * Get only dashboard stats (lighter endpoint)
 * @param token - JWT access token
 * @returns Profile and stats data only
 */
export const getDashboardStats = async (token: string): Promise<{ profile: CandidateProfile; stats: DashboardStats }> => {
  try {
    const res = await fetch(DashboardEndpoints.GET_STATS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error(`Failed to fetch dashboard stats: ${error}`);
  }
};

/**
 * Update profile strength indicators
 * @param token - JWT access token
 * @param data - Profile strength fields to update
 * @returns Success message
 */
export const updateProfileStrength = async (
  token: string,
  data: UpdateProfileStrengthRequest
): Promise<{ message: string }> => {
  try {
    const res = await fetch(DashboardEndpoints.UPDATE_PROFILE_STRENGTH, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error updating profile strength:', error);
    throw new Error(`Failed to update profile strength: ${error}`);
  }
};
