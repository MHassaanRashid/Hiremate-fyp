import { TestLanguage, TestSession, TestQuestion, TestReport, TestHistory } from '@/types/dashboard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// =====================================================
// Test Languages
// =====================================================

export async function getTestLanguages(token: string): Promise<TestLanguage[]> {
    const response = await fetch(`${API_URL}/tests/languages`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch test languages')
    }

    const data = await response.json()
    return data.languages
}

// =====================================================
// Test Session Management
// =====================================================

export async function createTest(token: string, language: string): Promise<any> {
    const response = await fetch(`${API_URL}/tests/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language })
    })

    if (!response.ok) {
        const error = await response.json()
        // Handle retake policy errors
        if (response.status === 429) {
            const detail = error.detail
            throw new Error(detail.reason || detail || 'You can only take one test per language per day')
        }
        throw new Error(error.detail || 'Failed to create test')
    }

    return response.json()
}

export async function getTest(token: string, testId: string) {
    const response = await fetch(`${API_URL}/tests/${testId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch test')
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

export async function submitAnswer(
    token: string,
    testId: string,
    answerData: SubmitAnswerData
) {
    const response = await fetch(`${API_URL}/tests/${testId}/submit-answer`, {
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
// Test Completion
// =====================================================

export async function completeTest(token: string, testId: string) {
    const response = await fetch(`${API_URL}/tests/${testId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to complete test')
    }

    return response.json()
}

// =====================================================
// Test Report
// =====================================================

export async function getTestReport(token: string, testId: string): Promise<TestReport> {
    const response = await fetch(`${API_URL}/tests/${testId}/report`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch test report')
    }

    return response.json()
}

// =====================================================
// Test History
// =====================================================

export async function getTestHistory(token: string): Promise<TestHistory[]> {
    const response = await fetch(`${API_URL}/tests/history`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch test history')
    }

    const data = await response.json()
    return data.tests
}
