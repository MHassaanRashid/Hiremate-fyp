import { TestLanguage, TestSession, TestQuestion, TestReport, TestHistory } from '@/types/dashboard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// =====================================================
// Quiz Languages
// =====================================================

export async function getQuizLanguages(token: string): Promise<TestLanguage[]> {
    const response = await fetch(`${API_URL}/quiz/languages`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch quiz languages')
    }

    const data = await response.json()
    return data.languages
}

// =====================================================
// Quiz Session Management
// =====================================================

export async function createQuiz(token: string, language: string): Promise<any> {
    const response = await fetch(`${API_URL}/quiz/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language })
    })

    if (!response.ok) {
        const error = await response.json()
        if (response.status === 429) {
            const detail = error.detail
            throw new Error(detail.reason || detail || 'You can only take one quiz per language per day')
        }
        throw new Error(error.detail || 'Failed to create quiz')
    }

    return response.json()
}

export async function getQuiz(token: string, quizId: string) {
    const response = await fetch(`${API_URL}/quiz/${quizId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch quiz')
    }

    return response.json()
}

// =====================================================
// Answer Submission
// =====================================================

export interface SubmitAnswerData {
    question_id: string
    selected_option?: number
    code_submission?: string
    answer_text?: string
    time_spent_seconds?: number
}

export async function submitQuizAnswer(
    token: string,
    quizId: string,
    answerData: SubmitAnswerData
) {
    const response = await fetch(`${API_URL}/quiz/${quizId}/submit-answer`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(answerData)
    })

    if (!response.ok) {
        throw new Error('Failed to submit answer')
    }

    return response.json()
}

// =====================================================
// Quiz Completion
// =====================================================

export async function completeQuiz(token: string, quizId: string) {
    const response = await fetch(`${API_URL}/quiz/${quizId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to complete quiz')
    }

    return response.json()
}

// =====================================================
// Quiz Report
// =====================================================

export async function getQuizReport(token: string, quizId: string): Promise<TestReport> {
    const response = await fetch(`${API_URL}/quiz/${quizId}/report`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch quiz report')
    }

    return response.json()
}

// =====================================================
// Quiz History
// =====================================================

export async function getQuizHistory(token: string): Promise<TestHistory[]> {
    const response = await fetch(`${API_URL}/quiz/history`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch quiz history')
    }

    const data = await response.json()
    return data.tests
}
