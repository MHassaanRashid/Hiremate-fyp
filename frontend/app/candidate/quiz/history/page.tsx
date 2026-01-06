"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CandidateLayout from "@/layouts/CandidateLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    ChevronRight,
    Calendar,
    Award,
    Clock,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    ShieldAlert
} from "lucide-react"
import { getQuizHistory } from "@/lib/api/quiz"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"

export default function AssessmentHistoryPage() {
    const router = useRouter()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/candidate')
                return
            }

            const tests = await getQuizHistory(session.access_token)
            setHistory(tests)
        } catch (error) {
            console.error("Error fetching history:", error)
            toast.error("Failed to load assessment history")
        } finally {
            setLoading(false)
        }
    }

    const filteredHistory = history.filter(test =>
        test.language.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 relative">
                <AnimatedBackground />
                <div className="max-w-5xl mx-auto space-y-8 relative z-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessment History</h1>
                            <p className="text-slate-500 font-medium">Review your performance across all technical evaluations</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by language..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-100">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                            <p className="text-slate-500 font-bold animate-pulse">Loading your journey...</p>
                        </div>
                    ) : filteredHistory.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredHistory.map((test) => (
                                <Card
                                    key={test.id}
                                    className="group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden cursor-pointer ring-1 ring-slate-100"
                                    onClick={() => router.push(`/candidate/quiz/${test.id}/report`)}
                                >
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row md:items-center p-5 md:p-6 gap-6">
                                            {/* Status Icon */}
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover:scale-110 duration-300",
                                                test.status === 'terminated' ? "bg-red-50 text-red-600 border border-red-100" :
                                                    test.passed ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-600 border border-slate-100"
                                            )}>
                                                {test.status === 'terminated' ? <ShieldAlert className="w-7 h-7" /> :
                                                    test.passed ? <Award className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                                            </div>

                                            {/* Assessment Info */}
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-slate-900 leading-none">
                                                        {test.language} Evaluation
                                                    </h3>
                                                    <Badge className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        test.status === 'terminated' ? "bg-red-600 text-white hover:bg-red-700" :
                                                            test.passed ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                                    )}>
                                                        {test.status === 'terminated' ? "Terminated" :
                                                            test.passed ? "Verified" : "Attempted"}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(test.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(test.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score Metric */}
                                            <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                                <div className="space-y-1 text-left md:text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Score</p>
                                                    <p className={cn(
                                                        "text-2xl font-black tabular-nums",
                                                        test.passed ? "text-emerald-600" : "text-slate-900"
                                                    )}>
                                                        {Math.round(test.score_percentage)}%
                                                    </p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100">
                                                    <ChevronRight className="w-5 h-5 flex-shrink-0" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>

                                    {/* Progress Bar visual indicator at bottom */}
                                    <div className="h-1 w-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-1000",
                                                test.passed ? "bg-emerald-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${test.score_percentage}%` }}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Assessments Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                                You haven't completed any assessments yet. Take your first AI quiz to start building your record.
                            </p>
                            <Button
                                onClick={() => router.push('/candidate/quiz')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                            >
                                Take AI Quiz
                                <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </CandidateLayout>
    )
}
