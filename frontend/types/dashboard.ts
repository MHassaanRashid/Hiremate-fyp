export interface CandidateProfile {
  name: string;
  full_name?: string;
  profileCompletion: number;
  avatar?: string;
  // Test and interview fields
  resume_completed?: boolean;
  test_status?: 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';
  interview_eligible?: boolean;
  last_test_date?: string;
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

// =====================================================
// Test System Types
// =====================================================

export interface TestLanguage {
  id: string;
  name: string;
  code: string;
  display_name: string;
  description: string;
  duration_minutes: number;
  question_count: number;
  passing_score: number;
}

export interface TestSession {
  id: string;
  language: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  duration_minutes: number;
  total_questions: number;
  started_at: string;
}

export interface TestQuestion {
  id: string;
  number: number;
  type: 'mcq' | 'coding';
  text: string;
  options?: string[];
  code_template?: string;
}

export interface TestReport {
  id: string;
  language: string;
  score_percentage: number;
  passed: boolean;
  completed_at: string;
  total_questions: number;
  correct_answers: number;
  question_results: Array<{
    question_id: string;
    correct: boolean;
    time_spent: number;
  }>;
}

export interface TestHistory {
  id: string;
  language: string;
  score_percentage: number;
  passed: boolean;
  completed_at: string;
}
