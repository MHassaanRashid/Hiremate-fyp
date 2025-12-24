"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CandidateLayout from "@/layouts/CandidateLayout";
import {
    analyzeResume,
    getLatestAnalysis,
    getAnalysisHistory,
    type ResumeAnalysis,
    type AnalysisHistory,
} from "@/lib/api/resume-analyzer";
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Sparkles,
    FileText,
    Target,
    Zap,
    Clock,
    RefreshCw,
    ChevronRight,
    Info,
    Award,
    BarChart3,
    Lightbulb,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ResumeAnalyzerPage() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [history, setHistory] = useState<AnalysisHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLatestAnalysis();
        loadHistory();
    }, []);

    const loadLatestAnalysis = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            if (!token) {
                setLoading(false);
                return;
            }

            const data = await getLatestAnalysis(token);
            setAnalysis(data);
        } catch (err: any) {
            console.error("Error loading analysis:", err);
            if (!err.message?.includes("404")) {
                setError(err.message || "Failed to load analysis");
            }
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const data = await getAnalysisHistory(token, 10);
            setHistory(data);
        } catch (err: any) {
            console.error("Error loading history:", err);
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);
            setError(null);

            const token = localStorage.getItem("access_token");
            if (!token) {
                setError("Please log in to analyze your resume");
                setAnalyzing(false);
                return;
            }

            const data = await analyzeResume(token, {
                include_ai_analysis: true,
            });

            setAnalysis(data);
            await loadHistory();
        } catch (err: any) {
            console.error("Analysis error:", err);
            setError(err.message || "Failed to analyze resume");
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return "text-emerald-600";
        if (score >= 70) return "text-blue-600";
        if (score >= 50) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 85) return "bg-emerald-100";
        if (score >= 70) return "bg-blue-100";
        if (score >= 50) return "bg-amber-100";
        return "bg-red-100";
    };

    const getScoreGradient = (score: number) => {
        if (score >= 85) return "from-emerald-500 to-teal-600";
        if (score >= 70) return "from-blue-500 to-indigo-600";
        if (score >= 50) return "from-amber-500 to-orange-600";
        return "from-red-500 to-rose-600";
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "excellent":
                return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
            case "good":
                return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
            case "needs_improvement":
                return <AlertCircle className="w-5 h-5 text-amber-600" />;
            case "poor":
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Info className="w-5 h-5 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "border-l-4 border-red-500 bg-red-50";
            case "medium":
                return "border-l-4 border-amber-500 bg-amber-50";
            case "low":
                return "border-l-4 border-blue-500 bg-blue-50";
            default:
                return "border-l-4 border-gray-500 bg-gray-50";
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-500 text-white";
            case "medium":
                return "bg-amber-500 text-white";
            case "low":
                return "bg-blue-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    if (loading) {
        return (
            <CandidateLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
                            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-white animate-pulse" />
                            </div>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">Loading your analysis...</p>
                        <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
                    </div>
                </div>
            </CandidateLayout>
        );
    }

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/candidate/resume">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                                    </button>
                                </Link>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-slate-900">
                                            AI Resume Analyzer
                                        </h1>
                                    </div>
                                    <p className="text-slate-600">
                                        Get instant feedback and improve your resume with AI-powered insights
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                            >
                                {analyzing ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Analyze Resume
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top">
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-red-900">Error</p>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {!analysis && !error && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center animate-in fade-in">
                            <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-12 h-12 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                    Ready to Optimize Your Resume?
                                </h2>
                                <p className="text-slate-600 mb-8">
                                    Click the button below to get AI-powered insights, ATS compatibility scores, and personalized recommendations to make your resume stand out.
                                </p>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 inline-flex items-center gap-2 group"
                                >
                                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Analyze Now
                                </button>
                            </div>
                        </div>
                    )}

                    {analysis && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom">
                            {/* Overall Score Card */}
                            <div className={`bg-gradient-to-br ${getScoreGradient(analysis.overall_score)} rounded-2xl shadow-xl p-8 text-white relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                                <div className="relative flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="w-6 h-6" />
                                            <p className="text-white/90 font-medium">Overall Resume Score</p>
                                        </div>
                                        <div className="flex items-baseline gap-3 mb-4">
                                            <span className="text-7xl font-bold tracking-tight">
                                                {analysis.overall_score}
                                            </span>
                                            <span className="text-4xl text-white/80">/100</span>
                                        </div>
                                        <p className="text-lg text-white/90 font-medium">
                                            {analysis.overall_score >= 85 && "🎉 Excellent! Your resume is outstanding."}
                                            {analysis.overall_score >= 70 && analysis.overall_score < 85 && "👍 Good! A few improvements will make it great."}
                                            {analysis.overall_score >= 50 && analysis.overall_score < 70 && "📈 Fair. Some work needed to stand out."}
                                            {analysis.overall_score < 50 && "💪 Needs improvement. Let's work on it together."}
                                        </p>
                                    </div>

                                    <div className="relative w-48 h-48">
                                        <svg className="transform -rotate-90 w-48 h-48">
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="88"
                                                stroke="rgba(255,255,255,0.2)"
                                                strokeWidth="16"
                                                fill="none"
                                            />
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="88"
                                                stroke="white"
                                                strokeWidth="16"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 88}`}
                                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - analysis.overall_score / 100)}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Target className="w-16 h-16 text-white/50" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-slate-900">Score Breakdown</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {analysis.completeness_score !== undefined && (
                                        <ScoreCard
                                            title="Completeness"
                                            score={analysis.completeness_score}
                                            icon={<FileText className="w-5 h-5" />}
                                        />
                                    )}
                                    {analysis.ats_score !== undefined && (
                                        <ScoreCard
                                            title="ATS Compatible"
                                            score={analysis.ats_score}
                                            icon={<CheckCircle2 className="w-5 h-5" />}
                                        />
                                    )}
                                    {analysis.formatting_score !== undefined && (
                                        <ScoreCard
                                            title="Formatting"
                                            score={analysis.formatting_score}
                                            icon={<Sparkles className="w-5 h-5" />}
                                        />
                                    )}
                                    {analysis.content_quality_score !== undefined && (
                                        <ScoreCard
                                            title="Content Quality"
                                            score={analysis.content_quality_score}
                                            icon={<Zap className="w-5 h-5" />}
                                        />
                                    )}
                                    {analysis.keyword_score !== undefined && (
                                        <ScoreCard
                                            title="Keywords"
                                            score={analysis.keyword_score}
                                            icon={<Target className="w-5 h-5" />}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Section Scores */}
                            {analysis.section_scores && analysis.section_scores.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                        Section Analysis
                                    </h2>
                                    <div className="space-y-4">
                                        {analysis.section_scores.map((section, idx) => (
                                            <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(section.status)}
                                                        <span className="font-semibold text-slate-900 text-lg">
                                                            {section.section_name}
                                                        </span>
                                                    </div>
                                                    <span className={`font-bold text-lg ${getScoreColor(section.score)}`}>
                                                        {section.score}/100
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-3 mb-2 overflow-hidden">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${section.score >= 85 ? "bg-gradient-to-r from-emerald-500 to-teal-600" :
                                                                section.score >= 70 ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
                                                                    section.score >= 50 ? "bg-gradient-to-r from-amber-500 to-orange-600" :
                                                                        "bg-gradient-to-r from-red-500 to-rose-600"
                                                            }`}
                                                        style={{ width: `${section.score}%` }}
                                                    />
                                                </div>
                                                {section.feedback && (
                                                    <p className="text-sm text-slate-600 mt-2">{section.feedback}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Strengths */}
                                {analysis.strengths && analysis.strengths.length > 0 && (
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-6 h-6" />
                                            Strengths
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.strengths.map((strength, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-emerald-800">
                                                    <div className="p-1 bg-emerald-200 rounded-full mt-0.5">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                    <span className="flex-1">{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Weaknesses */}
                                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-6 h-6" />
                                            Areas for Improvement
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.weaknesses.map((weakness, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-red-800">
                                                    <div className="p-1 bg-red-200 rounded-full mt-0.5">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                    <span className="flex-1">{weakness}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Suggestions */}
                            {analysis.suggestions && analysis.suggestions.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Lightbulb className="w-6 h-6 text-amber-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">Actionable Suggestions</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {analysis.suggestions.map((suggestion, idx) => (
                                            <div
                                                key={suggestion.id || idx}
                                                className={`rounded-xl p-5 ${getPriorityColor(suggestion.priority)} hover:shadow-md transition-all`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadge(suggestion.priority)}`}>
                                                            {suggestion.priority.toUpperCase()}
                                                        </span>
                                                        <span className="px-3 py-1 bg-white/80 rounded-full text-xs font-semibold text-slate-700">
                                                            {suggestion.category}
                                                        </span>
                                                    </div>
                                                    {suggestion.impact && (
                                                        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                                            {suggestion.impact}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-900 font-medium text-base mb-2">
                                                    {suggestion.message}
                                                </p>
                                                {suggestion.section && (
                                                    <p className="text-sm text-slate-600">
                                                        📍 Section: <span className="font-medium">{suggestion.section}</span>
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ATS Compatibility */}
                            {analysis.ats_compatibility && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-2xl font-bold text-slate-900">ATS Compatibility</h2>
                                    </div>

                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className={`px-4 py-2 rounded-lg font-semibold ${analysis.ats_compatibility.passed
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-red-500 text-white"
                                                }`}>
                                                {analysis.ats_compatibility.passed ? "✓ ATS Friendly" : "⚠ Needs ATS Improvements"}
                                            </div>
                                            <span className="text-3xl font-bold text-slate-900">
                                                {analysis.ats_compatibility.score}/100
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {analysis.ats_compatibility.passed
                                                ? "Your resume is optimized for Applicant Tracking Systems"
                                                : "Your resume may have difficulty passing through ATS filters"}
                                        </p>
                                    </div>

                                    {analysis.ats_compatibility.issues.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                Issues Found
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysis.ats_compatibility.issues.map((issue, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-red-700 bg-red-50 p-3 rounded-lg">
                                                        <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                        <span>{issue}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {analysis.ats_compatibility.recommendations.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Info className="w-5 h-5 text-blue-600" />
                                                Recommendations
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysis.ats_compatibility.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-blue-700 bg-blue-50 p-3 rounded-lg">
                                                        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Analysis History */}
                            {history && history.analyses.length > 1 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-2xl font-bold text-slate-900">Analysis History</h2>
                                    </div>

                                    {history.improvement_trend && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl flex items-center gap-3 border border-blue-200">
                                            {history.improvement_trend === "improving" && <TrendingUp className="w-6 h-6 text-emerald-600" />}
                                            {history.improvement_trend === "declining" && <TrendingDown className="w-6 h-6 text-red-600" />}
                                            {history.improvement_trend === "stable" && <Info className="w-6 h-6 text-blue-600" />}
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    Your resume is {history.improvement_trend}
                                                </p>
                                                {history.average_score && (
                                                    <p className="text-sm text-slate-600">
                                                        Average score: {history.average_score.toFixed(1)}/100
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {history.analyses.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${getScoreBgColor(item.overall_score)} ${getScoreColor(item.overall_score)} group-hover:scale-110 transition-transform`}>
                                                        {item.overall_score}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {new Date(item.analyzed_at).toLocaleDateString("en-US", {
                                                                month: "long",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </p>
                                                        <p className="text-sm text-slate-600">
                                                            {new Date(item.analyzed_at).toLocaleTimeString("en-US", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {item.job_id && (
                                                    <span className="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                                                        Job-specific
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CandidateLayout>
    );
}

// Helper Component: Score Card
function ScoreCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
    const getColor = (score: number) => {
        if (score >= 85) return { bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-gradient-to-r from-emerald-500 to-teal-600" };
        if (score >= 70) return { bg: "bg-blue-100", text: "text-blue-700", bar: "bg-gradient-to-r from-blue-500 to-indigo-600" };
        if (score >= 50) return { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-gradient-to-r from-amber-500 to-orange-600" };
        return { bg: "bg-red-100", text: "text-red-700", bar: "bg-gradient-to-r from-red-500 to-rose-600" };
    };

    const colors = getColor(score);

    return (
        <div className={`${colors.bg} rounded-xl p-5 border border-slate-200 hover:shadow-md transition-all group`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`${colors.text} flex items-center gap-2`}>
                    {icon}
                    <span className="font-semibold">{title}</span>
                </div>
                <span className={`text-2xl font-bold ${colors.text} group-hover:scale-110 transition-transform`}>{score}</span>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full ${colors.bar} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}
