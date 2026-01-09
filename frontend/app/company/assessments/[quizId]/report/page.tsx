"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2,
    XCircle,
    Target,
    Loader2,
    ShieldAlert,
    ShieldCheck,
    Video,
    Award,
    Download,
    ChevronLeft,
    Brain,
    Clock,
    Calendar,
    SearchX,
    ArrowUpRight,
    Sparkles
} from "lucide-react"
import { getQuizReport } from "@/lib/api/quiz"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

export default function CompanyQuizReportPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = params.quizId as string

    const [report, setReport] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (quizId) fetchReport()
    }, [quizId])

    const fetchReport = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/auth/company')
                return
            }
            const data = await getQuizReport(token, quizId)
            setReport(data)
        } catch (error) {
            console.error("Error fetching report:", error)
            toast.error("Failed to load assessment report")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 font-medium text-lg italic">Retrieving AI Verification Data...</p>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="p-10 text-center space-y-4 rounded-[40px] shadow-xl">
                    <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto">
                        <SearchX className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 italic">Report Not Found</h3>
                    <p className="text-slate-500 max-w-xs">This assessment record may have been archived or moved.</p>
                    <Button onClick={() => router.back()} variant="outline" className="rounded-xl">Go Back</Button>
                </Card>
            </div>
        )
    }

    const passed = report.passed
    const scorePercentage = Math.round(report.score_percentage)
    const isTerminated = report.status === 'terminated'

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 relative overflow-hidden">
            <AnimatedBackground />

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">

                {/* Executive Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="p-0 hover:bg-transparent text-slate-400 hover:text-blue-600 font-bold flex items-center gap-2 mb-2 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Profile
                        </Button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
                            Mastery <span className="text-blue-600">Report</span>
                        </h1>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-500" />
                            AI Verified Assessment • ID: {quizId.slice(0, 8)}...
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-bold shadow-sm" onClick={() => window.print()}>
                            <Download className="w-5 h-5 mr-3" />
                            Export Data
                        </Button> */}
                        <Badge className={cn(
                            "h-14 px-8 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg",
                            passed ? "bg-emerald-600 shadow-emerald-500/20" : "bg-rose-600 shadow-rose-500/20"
                        )}>
                            {passed ? "Verified Expert" : "Verification Failed"}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Primary Insight Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {isTerminated ? (
                            <Card className="border-0 shadow-2xl rounded-[48px] overflow-hidden bg-white relative">
                                <div className="absolute top-0 left-0 w-4 h-full bg-rose-600" />
                                <CardContent className="p-12 space-y-10">
                                    <div className="flex items-start gap-8">
                                        <div className="w-24 h-24 rounded-[32px] bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner border border-rose-100 flex-shrink-0 animate-pulse">
                                            <ShieldAlert className="w-12 h-12" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Integrity Protocol Triggered</h2>
                                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-rose-700 text-sm font-bold leading-relaxed shadow-sm">
                                                <p className="font-black text-[10px] uppercase tracking-[0.2em] mb-3 opacity-60">Violation Critical Reason:</p>
                                                {report.termination_reason || "System detected excessive deviation from standard proctoring protocols."}
                                            </div>
                                        </div>
                                    </div>

                                    {report.violation_proof && (
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Visual Audit Proof</h3>
                                            <div className="relative aspect-video w-full rounded-[40px] overflow-hidden border-8 border-slate-50 shadow-2xl group cursor-zoom-in">
                                                <img
                                                    src={report.violation_proof}
                                                    alt="Violation Proof"
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                                    <div className="bg-rose-600 text-white p-3 rounded-xl shadow-lg">
                                                        <Video className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black text-sm italic">PROCTOR_CAP_SYSTEM</p>
                                                        <p className="text-rose-200 text-[10px] font-black uppercase tracking-widest">Integrity Violation Evidence</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-2xl rounded-[48px] overflow-hidden bg-white relative">
                                <div className={cn("absolute top-0 left-0 w-4 h-full", passed ? "bg-emerald-500" : "bg-rose-500")} />
                                <CardContent className="p-12 space-y-12">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                        <div className="space-y-6 flex-1 text-center md:text-left">
                                            <div className="space-y-2">
                                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">
                                                    {report.language} <span className="text-slate-400 underline decoration-slate-200 decoration-8 underline-offset-8">Score</span>
                                                </h2>
                                                <p className="text-slate-500 text-lg font-medium italic">
                                                    {passed
                                                        ? `Expert technical proficiency verified in ${report.language} core concepts.`
                                                        : `Technical requirements for ${report.language} were not met during this session.`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <svg className="w-48 h-48 transform -rotate-90">
                                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-50" />
                                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent"
                                                    strokeDasharray={552}
                                                    strokeDashoffset={552 - (552 * scorePercentage) / 100}
                                                    className={cn("transition-all duration-1000", passed ? "text-emerald-500" : "text-rose-500")}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-black text-slate-900 italic">{scorePercentage}%</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct</p>
                                            <p className="text-2xl font-black text-slate-900 italic">{report.correct_answers}</p>
                                        </div>
                                        <div className="text-center space-y-1 font-black text-slate-900 opacity-20 text-2xl self-center">/</div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Qs</p>
                                            <p className="text-2xl font-black text-slate-900 italic">{report.total_questions}</p>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session</p>
                                            <p className="text-2xl font-black text-slate-900 italic">Verified</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Audit Log */}
                        <Card className="border-0 shadow-2xl rounded-[40px] bg-white overflow-hidden">
                            <div className="bg-slate-900 p-8 flex items-center justify-between">
                                <h3 className="font-black text-white text-xl flex items-center gap-3 italic">
                                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                    AI Proctoring Logs
                                </h3>
                                <Badge className="bg-white/10 text-white border-0 font-black text-[10px] tracking-widest px-4">
                                    VERIFIED DATA
                                </Badge>
                            </div>
                            <CardContent className="p-0">
                                {report.proctoring_logs?.length > 0 ? (
                                    <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {report.proctoring_logs.map((log: any, i: number) => (
                                            <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/80 transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full shadow-lg transition-transform group-hover:scale-125",
                                                        ['phone', 'multi-face'].includes(log.type) ? "bg-rose-500 shadow-rose-200" : "bg-amber-500 shadow-amber-200"
                                                    )} />
                                                    <div className="space-y-1">
                                                        <p className="text-lg font-black text-slate-900 italic leading-none capitalize">{log.type.replace('-', ' ')} Event</p>
                                                        <p className="text-xs text-slate-500 font-medium">{log.reason}</p>
                                                        {log.proof && (
                                                            <div className="mt-4 relative w-32 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm cursor-zoom-in group/img" onClick={() => window.open(log.proof, '_blank')}>
                                                                <img src={log.proof} alt="Proof" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                                    <Video className="w-5 h-5 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-300 text-xs tracking-widest uppercase">
                                                        {new Date(log.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-24 text-center space-y-4">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-slate-900 italic">Pristine Integrity</p>
                                            <p className="text-slate-400 font-medium max-w-xs mx-auto">Zero proctoring events detected. This candidate maintained 100% focus.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-8">
                        <Card className="border-0 shadow-2xl rounded-[40px] bg-white p-10 space-y-10 border-t-8 border-blue-600">
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Audit Metadata</h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                                        <p className="text-base font-bold text-slate-900">
                                            {new Date(report.completed_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                            {new Date(report.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • VERIFIED
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                                        <p className="text-base font-bold text-slate-900 italic">25:14 Minutes</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target: 45:00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Benchmarking</p>
                                        <p className="text-base font-bold text-slate-900 italic">Top 15% of Candidates</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" /> Higher than average
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <Button
                                    className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black italic rounded-3xl shadow-xl shadow-slate-200"
                                    onClick={() => router.back()}
                                >
                                    Dismiss Report
                                </Button>
                            </div>
                        </Card>

                        {/* Hiring Status Card */}
                        <Card className="border-0 shadow-2xl rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
                            <div className="relative z-10 space-y-6">
                                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black italic">Verified Match</h4>
                                    <p className="text-blue-100 text-sm font-medium leading-relaxed">
                                        This report is legally binding proof of technical proficiency for this candidate profile.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
