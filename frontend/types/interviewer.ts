// TypeScript types for Interviewer module

export interface InterviewerStats {
    totalInterviews: number
    upcomingInterviews: number
    completedThisMonth: number
    averageRating: number
    pendingReviews: number
}

export interface UpcomingInterview {
    id: string
    candidateName: string
    candidateEmail: string
    position: string
    company: string
    scheduledDate: string
    scheduledTime: string
    duration: number
    type: 'live' | 'ai-assisted'
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    meetingLink?: string
}

export interface InterviewerDashboardData {
    stats: InterviewerStats
    upcomingInterviews: UpcomingInterview[]
    recentActivity: ActivityItem[]
}

export interface ActivityItem {
    id: string
    type: 'interview_completed' | 'interview_scheduled' | 'evaluation_submitted'
    message: string
    timestamp: string
    candidateName?: string
}

export interface AssignedInterview {
    id: string
    candidateName: string
    candidateEmail: string
    candidateAvatar?: string
    position: string
    company: string
    scheduledDate: string
    scheduledTime: string
    duration: number
    type: 'live' | 'ai-assisted'
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    meetingLink?: string
    applicationId?: string
}

export interface CandidateInfo {
    id: string
    name: string
    email: string
    avatar?: string
    position: string
    experience: string
    education: string
    skills: string[]
    resumeUrl?: string
}

export interface InterviewDetails {
    id: string
    candidate: CandidateInfo
    company: string
    position: string
    scheduledDate: string
    scheduledTime: string
    duration: number
    type: 'live' | 'ai-assisted'
    status: 'scheduled' | 'in-progress' | 'completed'
    meetingLink?: string
    notes?: string
    startedAt?: string
}

export interface BehavioralIndicator {
    category: string
    score: number
    description: string
}

export interface AIInterviewSummary {
    overallScore: number
    strengths: string[]
    weaknesses: string[]
    keyInsights: string[]
    behavioralIndicators: BehavioralIndicator[]
    technicalAssessment?: {
        score: number
        details: string
    }
}

export interface InterviewReview {
    id: string
    candidate: CandidateInfo
    company: string
    position: string
    interviewDate: string
    duration: number
    type: 'live' | 'ai-assisted'
    recordingUrl?: string
    aiSummary?: AIInterviewSummary
    interviewerNotes?: string
    existingEvaluation?: Evaluation
}

export interface Evaluation {
    interviewId: string
    technicalSkills: number
    communication: number
    problemSolving: number
    culturalFit: number
    honestyScore: number
    overallRating: number
    strengths: string
    weaknesses: string
    weakConcepts: string
    recommendation: 'strong-hire' | 'hire' | 'maybe' | 'no-hire'
    comments: string
    submittedAt?: string
}

export interface InterviewHistoryItem {
    id: string
    candidateName: string
    candidateAvatar?: string
    position: string
    company: string
    interviewDate: string
    finalScore: number
    recommendation: 'strong-hire' | 'hire' | 'maybe' | 'no-hire'
    status: 'evaluated' | 'pending'
}

export interface InterviewerProfile {
    id: string
    name: string
    email: string
    avatar?: string
    expertise: string[]
    skills: string[]
    yearsOfExperience: number
    availability: {
        monday: boolean
        tuesday: boolean
        wednesday: boolean
        thursday: boolean
        friday: boolean
        saturday: boolean
        sunday: boolean
    }
    preferredTimeSlots: string[]
    bio?: string
    linkedIn?: string
}

export interface UpdateInterviewerProfileRequest {
    name?: string
    expertise?: string[]
    skills?: string[]
    years_of_experience?: number
    availability?: {
        monday?: boolean
        tuesday?: boolean
        wednesday?: boolean
        thursday?: boolean
        friday?: boolean
        saturday?: boolean
        sunday?: boolean
    }
    preferredTimeSlots?: string[]
    bio?: string
    linkedIn?: string
}
