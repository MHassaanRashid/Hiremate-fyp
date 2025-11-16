export interface CandidateProfile {
  name: string;
  profileCompletion: number;
  avatar?: string;
}

export interface DashboardStats {
  applicationsSubmitted: number;
  interviewsScheduled: number;
  profileViews: number;
  profileScore: number;
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
  type:
    | 'view'
    | 'status_change'
    | 'message'
    | 'recommendation'
    | 'interview_scheduled'
    | 'application_viewed'
    | 'profile_viewed'
    | 'job_recommended'
    | 'application_submitted'
    | 'application_shortlisted';
  message: string;
  timestamp: string;
  icon?: string;
}
