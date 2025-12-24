// frontend/lib/api/resume-analyzer.ts
import { ResumeAnalyzerEndpoints } from "./endpoints";
import { handleResponse } from "../api";

// TypeScript Types
export interface SectionScore {
    section_name: string;
    score: number;
    status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    feedback?: string;
}

export interface Suggestion {
    id?: string;
    category: 'Skills' | 'Experience' | 'Education' | 'Formatting' | 'Content' | 'ATS';
    priority: 'high' | 'medium' | 'low';
    message: string;
    impact?: string;
    action?: string;
    section?: string;
}

export interface ATSCompatibility {
    score: number;
    passed: boolean;
    issues: string[];
    recommendations: string[];
}

export interface KeywordAnalysis {
    matched_keywords: string[];
    missing_keywords: string[];
    keyword_density?: number;
    suggestions: string[];
}

export interface ResumeAnalysis {
    id: string;
    user_id: string;
    resume_id?: string;
    job_id?: string;

    // Scores
    overall_score: number;
    completeness_score?: number;
    ats_score?: number;
    keyword_score?: number;
    formatting_score?: number;
    content_quality_score?: number;

    // Analysis Details
    section_scores: SectionScore[];
    suggestions: Suggestion[];
    strengths: string[];
    weaknesses: string[];
    missing_keywords: string[];

    // Optional Details
    ats_compatibility?: ATSCompatibility;
    keyword_analysis?: KeywordAnalysis;

    // Timestamps
    analyzed_at: string;
    created_at: string;
}

export interface AnalysisHistoryItem {
    id: string;
    overall_score: number;
    analyzed_at: string;
    job_id?: string;
}

export interface AnalysisHistory {
    analyses: AnalysisHistoryItem[];
    total_count: number;
    improvement_trend?: 'improving' | 'stable' | 'declining';
    average_score?: number;
}

export interface QuickAnalysis {
    overall_score: number;
    top_suggestions: Suggestion[];
    critical_issues: string[];
    ats_passed: boolean;
}

export interface ResumeAnalysisRequest {
    job_id?: string;
    include_ai_analysis?: boolean;
    focus_areas?: string[];
}

// API Functions

/**
 * Analyze the current user's resume
 */
export const analyzeResume = async (
    token: string,
    request: ResumeAnalysisRequest = { include_ai_analysis: true }
): Promise<ResumeAnalysis> => {
    const res = await fetch(ResumeAnalyzerEndpoints.ANALYZE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
    return handleResponse(res);
};

/**
 * Analyze resume for a specific job
 */
export const analyzeResumeForJob = async (
    token: string,
    jobId: string,
    request: ResumeAnalysisRequest = { include_ai_analysis: true }
): Promise<ResumeAnalysis> => {
    const res = await fetch(ResumeAnalyzerEndpoints.ANALYZE_FOR_JOB(jobId), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
    return handleResponse(res);
};

/**
 * Get analysis history
 */
export const getAnalysisHistory = async (
    token: string,
    limit: number = 10
): Promise<AnalysisHistory> => {
    const res = await fetch(`${ResumeAnalyzerEndpoints.HISTORY}?limit=${limit}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(res);
};

/**
 * Get latest analysis
 */
export const getLatestAnalysis = async (token: string): Promise<ResumeAnalysis> => {
    const res = await fetch(ResumeAnalyzerEndpoints.LATEST, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(res);
};

/**
 * Get quick analysis (lightweight)
 */
export const getQuickAnalysis = async (token: string): Promise<QuickAnalysis> => {
    const res = await fetch(ResumeAnalyzerEndpoints.QUICK, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(res);
};

/**
 * Delete an analysis
 */
export const deleteAnalysis = async (
    token: string,
    analysisId: string
): Promise<{ message: string; analysis_id: string }> => {
    const res = await fetch(ResumeAnalyzerEndpoints.DELETE(analysisId), {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(res);
};
