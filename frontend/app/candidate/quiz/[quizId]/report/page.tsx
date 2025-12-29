"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import CandidateLayout from "@/layouts/CandidateLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    Loader2,
    Home,
    FileText,
    Calendar,
    Video,
    ArrowRight,
    Award,
    Download
} from "lucide-react"
import { getQuizReport } from "@/lib/api/quiz"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import type { TestReport } from "@/types/dashboard"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"

export default function QuizReportPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = params.quizId as string

    const [report, setReport] = useState<TestReport | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (quizId) fetchReport()
    }, [quizId])

    const fetchReport = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/candidate')
                return
            }

            const data = await getQuizReport(session.access_token, quizId)
            setReport(data)
        } catch (error) {
            console.error("Error fetching report:", error)
            toast.error("Failed to load quiz report")
            router.push('/candidate/quiz')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <CandidateLayout>
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-600 font-medium text-lg">Generating official report...</p>
                </div>
            </CandidateLayout>
        )
    }

    if (!report) {
        return (
            <CandidateLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-slate-600">Assessment report not found</p>
                </div>
            </CandidateLayout>
        )
    }

    const passed = report.passed
    const scorePercentage = Math.round(report.score_percentage)

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 relative">
                <AnimatedBackground />
                <div className="max-w-5xl mx-auto space-y-8 relative z-10">

                    {/* Compact Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assessment Report</h1>
                            <p className="text-slate-500 text-sm font-medium">ID: {quizId}</p>
                        </div>
                        <Button variant="outline" className="hidden sm:flex" disabled>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Result Card (Left Column) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className={cn(
                                "border-0 shadow-xl overflow-hidden relative",
                                passed ? "bg-gradient-to-br from-white to-emerald-50/50" : "bg-gradient-to-br from-white to-red-50/50"
                            )}>
                                <div className={cn("absolute top-0 left-0 w-2 h-full", passed ? "bg-emerald-500" : "bg-red-500")} />
                                <CardContent className="p-8 md:p-12">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                                        <div className={cn(
                                            "w-24 h-24 rounded-3xl flex items-center justify-center shadow-sm flex-shrink-0",
                                            passed ? "bg-white text-emerald-500" : "bg-white text-red-500"
                                        )}>
                                            {passed ? <Award className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <Badge className={cn("mb-2", passed ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100")}>
                                                    {passed ? "Competency Verified" : "Needs Improvement"}
                                                </Badge>
                                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                                                    {passed ? `Certified in ${report.language}` : `${report.language} Assessment Failed`}
                                                </h2>
                                            </div>
                                            <p className="text-slate-600 font-medium leading-relaxed">
                                                {passed
                                                    ? "You have successfully demonstrated the required technical proficiencies. This result authorizes you to proceed to the live interview stage."
                                                    : `You scored ${scorePercentage}%, which is below the required 80%. We recommend reviewing the core concepts and retaking the assessment.`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Grid inside the main card */}
                                    <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-200/60">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Score</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-1">{scorePercentage}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correct Answers</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-1">{report.correct_answers}<span className="text-base text-slate-400 font-medium ml-1">/ {report.total_questions}</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Taken</p>
                                            <p className="text-3xl font-bold text-slate-900 mt-1">14m</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NEXT STEP: Live Interview CTA - Only if passed */}
                            {passed && (
                                <Card className="border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                                    <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="space-y-4 max-w-lg">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-wide">
                                                <Video className="w-3.5 h-3.5" />
                                                Next Step Unlocked
                                            </div>
                                            <h3 className="text-2xl font-bold">Schedule Your Live Interview</h3>
                                            <p className="text-blue-100 font-medium leading-relaxed">
                                                Great job! Your profile has been fast-tracked. Select a time slot to showcase your communication skills to our team.
                                            </p>
                                        </div>
                                        <Button className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg rounded-xl shadow-xl transition-all whitespace-nowrap group-hover:scale-105">
                                            Book Interview
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Meta Info & Actions */}
                        <div className="space-y-6">
                            <Card className="border border-slate-200 shadow-sm bg-white p-6">
                                <h3 className="font-bold text-slate-900 mb-6">Assessment Details</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                            <Calendar className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed On</p>
                                            <p className="text-sm font-semibold text-slate-900 mt-0.5">
                                                {new Date(report.completed_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(report.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                            <CheckCircle2 className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                            <p className={cn("text-sm font-bold mt-0.5", passed ? "text-emerald-600" : "text-red-600")}>
                                                {passed ? "VERIFIED" : "NOT VERIFIED"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                                    <Button
                                        onClick={() => router.push('/candidate')}
                                        className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-xl"
                                    >
                                        Back to Dashboard
                                    </Button>
                                    {!passed && (
                                        <Button
                                            onClick={() => router.push('/candidate/quiz')}
                                            variant="outline"
                                            className="w-full h-12 font-bold border-2 rounded-xl"
                                        >
                                            Try Again
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </CandidateLayout>
    )
}
