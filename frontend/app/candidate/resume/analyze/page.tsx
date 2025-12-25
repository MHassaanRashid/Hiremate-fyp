"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    Info,
    Award,
    BarChart3,
    Lightbulb,
    Home,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ResumeAnalyzerPage() {
    const router = useRouter();
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
            const data = await analyzeResume(token, { include_ai_analysis: true });
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
        if (score >= 85) return "from-emerald-500 to-teal-500";
        if (score >= 70) return "from-blue-500 to-cyan-500";
        if (score >= 50) return "from-amber-500 to-orange-500";
        return "from-rose-500 to-red-500";
    };

    const getScoreBg = (score: number) => {
        if (score >= 85) return "bg-emerald-50";
        if (score >= 70) return "bg-blue-50";
        if (score >= 50) return "bg-amber-50";
        return "bg-rose-50";
    };

    const getScoreText = (score: number) => {
        if (score >= 85) return "text-emerald-700";
        if (score >= 70) return "text-blue-700";
        if (score >= 50) return "text-amber-700";
        return "text-rose-700";
    };

    if (loading) {
        return (
            <CandidateLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative">
                    <div className="absolute inset-0 z-0">
                        <AnimatedBackground />
                    </div>
                    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                                        <div>
                                            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-2"></div>
                                            <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-9 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 relative z-10">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-pulse">
                            <div className="h-48 bg-slate-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </CandidateLayout>
        );
    }

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative">
                <div className="absolute inset-0 z-0">
                    <AnimatedBackground />
                </div>

                {/* Top Bar */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/candidate/resume">
                                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all hover:scale-105">
                                        <Home className="w-5 h-5 text-slate-600" />
                                    </button>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-bold text-slate-900">AI Resume Analyzer</h1>
                                        <p className="text-xs text-slate-500">Get instant feedback and improve your resume</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {analyzing && (
                                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 animate-pulse">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span className="hidden sm:inline">Analyzing...</span>
                                    </div>
                                )}
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    size="sm"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    <Zap className="w-4 h-4 mr-1.5" />
                                    <span className="hidden sm:inline">Analyze Resume</span>
                                    <span className="sm:hidden">Analyze</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 relative z-10">

                    {error && (
                        <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <XCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Error</h3>
                                        <p className="text-white/90 text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!analysis && !error && (
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                            <CardContent className="p-12 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-12 h-12 text-purple-600" />
                                </div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                    Ready to Optimize Your Resume?
                                </h2>
                                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                    Click "Analyze Resume" to get AI-powered insights, ATS compatibility scores, and personalized recommendations.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                                        <Target className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                                        <h3 className="font-bold text-slate-900 mb-1">ATS Score</h3>
                                        <p className="text-sm text-slate-600">Check compatibility</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                                        <Lightbulb className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                                        <h3 className="font-bold text-slate-900 mb-1">AI Insights</h3>
                                        <p className="text-sm text-slate-600">Smart suggestions</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                                        <Award className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                                        <h3 className="font-bold text-slate-900 mb-1">Score Breakdown</h3>
                                        <p className="text-sm text-slate-600">Detailed analysis</p>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    )}

                    {analysis && (
                        <>
                            {/* Overall Score */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className={`bg-gradient-to-r ${getScoreColor(analysis.overall_score)} p-4`}>
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold">Overall Resume Score</h2>
                                                <p className="text-white/90 text-xs">Based on industry standards</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-white/20 text-white border-white/30">
                                            {analysis.overall_score >= 85 && "Excellent"}
                                            {analysis.overall_score >= 70 && analysis.overall_score < 85 && "Good"}
                                            {analysis.overall_score >= 50 && analysis.overall_score < 70 && "Fair"}
                                            {analysis.overall_score < 50 && "Needs Work"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
                                    <div className="flex items-center gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-3 mb-4">
                                                <span className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                    {analysis.overall_score}
                                                </span>
                                                <span className="text-4xl text-slate-400">/100</span>
                                            </div>
                                            <p className="text-lg font-semibold text-slate-700 mb-4">
                                                {analysis.overall_score >= 85 && "🎉 Excellent! Your resume is outstanding."}
                                                {analysis.overall_score >= 70 && analysis.overall_score < 85 && "👍 Good! A few improvements will make it great."}
                                                {analysis.overall_score >= 50 && analysis.overall_score < 70 && "📈 Fair. Some work needed to stand out."}
                                                {analysis.overall_score < 50 && "💪 Needs improvement. Let's work on it together."}
                                            </p>
                                            <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getScoreColor(analysis.overall_score)} rounded-full transition-all duration-1000`}
                                                    style={{ width: `${analysis.overall_score}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">Score Breakdown</h2>
                                            <p className="text-white/90 text-xs">Detailed analysis of each section</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {analysis.completeness_score !== undefined && (
                                            <ScoreCard title="Completeness" score={analysis.completeness_score} icon={<FileText className="w-5 h-5" />} />
                                        )}
                                        {analysis.ats_score !== undefined && (
                                            <ScoreCard title="ATS Compatible" score={analysis.ats_score} icon={<CheckCircle2 className="w-5 h-5" />} />
                                        )}
                                        {analysis.formatting_score !== undefined && (
                                            <ScoreCard title="Formatting" score={analysis.formatting_score} icon={<Sparkles className="w-5 h-5" />} />
                                        )}
                                        {analysis.content_quality_score !== undefined && (
                                            <ScoreCard title="Content Quality" score={analysis.content_quality_score} icon={<Zap className="w-5 h-5" />} />
                                        )}
                                        {analysis.keyword_score !== undefined && (
                                            <ScoreCard title="Keywords" score={analysis.keyword_score} icon={<Target className="w-5 h-5" />} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section Scores */}
                            {analysis.section_scores && analysis.section_scores.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-lg font-bold">Section Analysis</h2>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-white space-y-4">
                                        {analysis.section_scores.map((section, idx) => (
                                            <div key={idx} className={`p-5 rounded-2xl border-2 ${getScoreBg(section.score)} border-slate-200 hover:shadow-md transition-all`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-bold text-slate-900">{section.section_name}</span>
                                                    <span className={cn("font-bold text-2xl", getScoreText(section.score))}>
                                                        {section.score}/100
                                                    </span>
                                                </div>
                                                <Progress value={section.score} className="h-2 mb-2" />
                                                {section.feedback && <p className="text-sm text-slate-600 mt-2">{section.feedback}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {analysis.strengths && analysis.strengths.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                                            <div className="flex items-center gap-3 text-white">
                                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-lg font-bold">Strengths</h2>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-white space-y-3">
                                            {analysis.strengths.map((strength, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-emerald-200 hover:shadow-md transition-all">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-emerald-900 font-medium text-sm">{strength}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-rose-500 to-red-500 p-4">
                                            <div className="flex items-center gap-3 text-white">
                                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-lg font-bold">Areas for Improvement</h2>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-gradient-to-br from-rose-50/50 to-white space-y-3">
                                            {analysis.weaknesses.map((weakness, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-red-200 hover:shadow-md transition-all">
                                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-red-900 font-medium text-sm">{weakness}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Suggestions */}
                            {analysis.suggestions && analysis.suggestions.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                                <Lightbulb className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-lg font-bold">Actionable Suggestions</h2>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-white space-y-4">
                                        {analysis.suggestions.map((suggestion, idx) => (
                                            <div key={suggestion.id || idx} className="p-5 rounded-2xl border-2 border-slate-200 hover:shadow-md transition-all bg-white">
                                                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={cn("border shadow-sm",
                                                            suggestion.priority === "high" ? "bg-red-100 text-red-700 border-red-300" :
                                                                suggestion.priority === "medium" ? "bg-amber-100 text-amber-700 border-amber-300" :
                                                                    "bg-blue-100 text-blue-700 border-blue-300"
                                                        )}>
                                                            {suggestion.priority.toUpperCase()}
                                                        </Badge>
                                                        <Badge className="bg-slate-100 text-slate-700 border-slate-300 shadow-sm">
                                                            {suggestion.category}
                                                        </Badge>
                                                    </div>
                                                    {suggestion.impact && (
                                                        <Badge className="bg-purple-100 text-purple-700 border-purple-300 shadow-sm">
                                                            {suggestion.impact}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-slate-900 font-semibold mb-2">{suggestion.message}</p>
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
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-lg font-bold">ATS Compatibility</h2>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-white space-y-6">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                            <div className="flex items-center gap-4 mb-3">
                                                <Badge className={cn("px-4 py-2 text-base font-bold shadow-lg",
                                                    analysis.ats_compatibility.passed
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-red-500 text-white"
                                                )}>
                                                    {analysis.ats_compatibility.passed ? "✓ ATS Friendly" : "⚠ Needs Improvements"}
                                                </Badge>
                                                <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                    {analysis.ats_compatibility.score}<span className="text-3xl">/100</span>
                                                </span>
                                            </div>
                                            <p className="text-slate-700 font-medium">
                                                {analysis.ats_compatibility.passed
                                                    ? "Your resume is optimized for Applicant Tracking Systems"
                                                    : "Your resume may have difficulty passing through ATS filters"}
                                            </p>
                                        </div>

                                        {analysis.ats_compatibility.issues.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                    Issues Found
                                                </h3>
                                                <div className="space-y-2">
                                                    {analysis.ats_compatibility.issues.map((issue, idx) => (
                                                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900">
                                                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm font-medium">{issue}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {analysis.ats_compatibility.recommendations.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Info className="w-5 h-5 text-blue-600" />
                                                    Recommendations
                                                </h3>
                                                <div className="space-y-2">
                                                    {analysis.ats_compatibility.recommendations.map((rec, idx) => (
                                                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                                                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm font-medium">{rec}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Analysis History */}
                            {history && history.analyses.length > 1 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-4">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-lg font-bold">Analysis History</h2>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-slate-50 to-white space-y-4">
                                        {history.improvement_trend && (
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 flex items-center gap-3">
                                                {history.improvement_trend === "improving" && <TrendingUp className="w-6 h-6 text-emerald-600" />}
                                                {history.improvement_trend === "declining" && <TrendingDown className="w-6 h-6 text-red-600" />}
                                                <div>
                                                    <p className="font-bold text-slate-900">Your resume is {history.improvement_trend}</p>
                                                    {history.average_score && (
                                                        <p className="text-sm text-slate-600">Average score: {history.average_score.toFixed(1)}/100</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            {history.analyses.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:shadow-md transition-all bg-white">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg", getScoreBg(item.overall_score), getScoreText(item.overall_score))}>
                                                            {item.overall_score}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">
                                                                {new Date(item.analyzed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                                            </p>
                                                            <p className="text-sm text-slate-600">
                                                                {new Date(item.analyzed_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {item.job_id && (
                                                        <Badge className="bg-purple-100 text-purple-700 border-purple-300">Job-specific</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </CandidateLayout>
    );
}

function ScoreCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
    const getColor = (score: number) => {
        if (score >= 85) return { gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700" };
        if (score >= 70) return { gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", text: "text-blue-700" };
        if (score >= 50) return { gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-700" };
        return { gradient: "from-rose-500 to-red-500", bg: "bg-rose-50", text: "text-rose-700" };
    };

    const colors = getColor(score);

    return (
        <div className={`p-5 rounded-2xl border-2 border-slate-200 ${colors.bg} hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`flex items-center gap-2 ${colors.text}`}>
                    {icon}
                    <span className="font-bold text-sm">{title}</span>
                </div>
                <span className={cn("text-3xl font-bold", colors.text)}>{score}</span>
            </div>
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-1000`}
                    style={{ width: `${score}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
