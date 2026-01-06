// API service functions for Interviewer module - Connected to real backend
import type {
    InterviewerDashboardData,
    AssignedInterview,
    InterviewDetails,
    InterviewReview,
    Evaluation,
    InterviewHistoryItem,
    InterviewerProfile,
    UpdateInterviewerProfileRequest,
} from '@/types/interviewer'

const API_URL = "/api"

/**
 * Get interviewer dashboard data
 */
export const getInterviewerDashboard = async (token: string): Promise<InterviewerDashboardData> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
            throw new Error('Failed to fetch dashboard data')
        }

        return await res.json()
    } catch (error) {
        console.error('Error fetching interviewer dashboard:', error)
        throw error
    }
}

/**
 * Get all assigned interviews
 */
export const getAssignedInterviews = async (token: string): Promise<AssignedInterview[]> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/interviews`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
            throw new Error('Failed to fetch interviews')
        }

        return await res.json()
    } catch (error) {
        console.error('Error fetching assigned interviews:', error)
        throw error
    }
}

/**
 * Get interview details for live session
 */
export const getInterviewDetails = async (token: string, interviewId: string): Promise<InterviewDetails> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/interviews/${interviewId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
            throw new Error('Failed to fetch interview details')
        }

        return await res.json()
    } catch (error) {
        console.error('Error fetching interview details:', error)
        throw error
    }
}

/**
 * Get interview data for review/evaluation
 */
export const getInterviewReview = async (token: string, interviewId: string): Promise<InterviewReview> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/review/${interviewId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
            throw new Error('Failed to fetch interview review')
        }

        return await res.json()
    } catch (error) {
        console.error('Error fetching interview review:', error)
        throw error
    }
}

/**
 * Submit evaluation for a candidate
 */
export const submitEvaluation = async (token: string, evaluation: Evaluation): Promise<{ message: string }> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/evaluation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                interview_id: evaluation.interviewId,
                technical_skills: evaluation.technicalSkills,
                communication: evaluation.communication,
                problem_solving: evaluation.problemSolving,
                cultural_fit: evaluation.culturalFit,
                overall_rating: evaluation.overallRating,
                strengths: evaluation.strengths,
                weaknesses: evaluation.weaknesses,
                weak_concepts: evaluation.weakConcepts,
                honesty_score: evaluation.honestyScore,
                recommendation: evaluation.recommendation,
                comments: evaluation.comments,
            }),
        })

        if (!res.ok) {
            throw new Error('Failed to submit evaluation')
        }

        return await res.json()
    } catch (error) {
        console.error('Error submitting evaluation:', error)
        throw error
    }
}

/**
 * Get interview history
 */
export const getInterviewHistory = async (token: string): Promise<InterviewHistoryItem[]> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/history`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
            throw new Error('Failed to fetch interview history')
        }

        return await res.json()
    } catch (error) {
        console.error('Error fetching interview history:', error)
        throw error
    }
}

/**
 * Get interviewer profile
 */
export const getInterviewerProfile = async (token: string): Promise<InterviewerProfile> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
            throw new Error('Failed to fetch interviewer profile')
        }

        return await res.json()
    } catch (error) {
        console.error('Error fetching interviewer profile:', error)
        throw error
    }
}

/**
 * Update interviewer profile
 */
export const updateInterviewerProfile = async (
    token: string,
    data: UpdateInterviewerProfileRequest
): Promise<{ message: string }> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: data.name,
                expertise: data.expertise,
                skills: data.skills,
                availability: data.availability,
                preferred_time_slots: data.preferredTimeSlots,
                years_of_experience: data.years_of_experience,
                bio: data.bio,
                linkedin: data.linkedIn,
            }),
        })

        if (!res.ok) {
            throw new Error('Failed to update interviewer profile')
        }

        return await res.json()
    } catch (error) {
        console.error('Error updating interviewer profile:', error)
        throw error
    }
}

/**
 * Save interview notes
 */
export const saveInterviewNotes = async (
    token: string,
    interviewId: string,
    notes: string
): Promise<{ message: string }> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/interviews/${interviewId}/notes`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ notes }),
        })

        if (!res.ok) {
            throw new Error('Failed to save interview notes')
        }

        return await res.json()
    } catch (error) {
        console.error('Error saving interview notes:', error)
        throw error
    }
}

/**
 * End interview
 */
export const endInterview = async (token: string, interviewId: string): Promise<{ message: string }> => {
    try {
        const res = await fetch(`${API_URL}/interviewer/interviews/${interviewId}/end`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to end interview')
        }

        return await res.json()
    } catch (error) {
        console.error('Error ending interview:', error)
        throw error
    }
}
