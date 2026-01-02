"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    CheckCircle2,
    ShieldCheck,
    ShieldAlert,
    Camera,
    Brain,
    FileText,
    Sparkles,
    Eye,
    Shield
} from "lucide-react"
import { createQuiz } from "@/lib/api/quiz"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"
import { useProctoring } from "@/hooks/use-proctoring"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function QuizPreparationContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const languageCode = searchParams.get('lang')
    const videoRef = useRef<HTMLVideoElement>(null)

    const [quizId, setQuizId] = useState<string | null>(null)
    const [quizReady, setQuizReady] = useState(false)
    const [quizDetails, setQuizDetails] = useState<any>(null)
    const [creationError, setCreationError] = useState<string | null>(null)

    // Enter fullscreen on mount
    useEffect(() => {
        const enterFullscreen = () => {
            const element = document.documentElement
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => {
                    console.error("Error entering fullscreen:", err)
                })
            }
        }
        // Enter fullscreen immediately
        const timer = setTimeout(enterFullscreen, 100)
        return () => clearTimeout(timer)
    }, [])

    // Monitor proctoring initialization
    const { isModelReady, isCalibrated, diagnostics } = useProctoring({
        videoRef,
        isActive: false, // Not active during preparation
        onWarning: () => { },
        onTerminate: () => { }
    })

    // Create quiz on mount
    useEffect(() => {
        if (!languageCode) {
            toast.error("Language not specified")
            router.push('/candidate/quiz')
            return
        }

        const createQuizAsync = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push('/auth/candidate')
                    return
                }

                const result = await createQuiz(session.access_token, languageCode)
                setQuizId(result.test_id)
                setQuizDetails(result)
                setQuizReady(true)
            } catch (error: any) {
                console.error("Error creating quiz:", error)
                setCreationError(error.message || "Failed to create quiz")
                toast.error("Failed to create assessment")
            }
        }

        createQuizAsync()
    }, [languageCode, router])

    // Automatic redirect when both are ready
    useEffect(() => {
        if (quizReady && isModelReady && isCalibrated) {
            const timer = setTimeout(() => {
                router.push(`/candidate/quiz/${quizId}`)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [quizReady, isModelReady, isCalibrated, quizId, router]) // Added isCalibrated

    if (creationError) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 text-center border-red-200 bg-red-50">
                    <p className="text-red-600 font-semibold mb-4">{creationError}</p>
                    <button
                        onClick={() => router.push('/candidate/quiz')}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                        Return to Quiz Selection
                    </button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <div className="max-w-2xl w-full space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 text-blue-700 text-sm font-bold uppercase tracking-wider shadow-sm">
                            <ShieldCheck className="w-4 h-4" />
                            Secure Assessment Environment
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Preparing Your Assessment
                        </h1>
                        <p className="text-slate-600 font-medium text-lg">
                            {languageCode ? `${languageCode.toUpperCase()} Assessment` : 'Loading...'}
                        </p>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quiz Preparation Status */}
                        <Card className={cn(
                            "border-2 transition-all duration-500 shadow-xl",
                            quizReady ? "border-green-300 bg-gradient-to-br from-white to-green-50 shadow-green-100" : "border-blue-200 bg-white"
                        )}>
                            <CardContent className="p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
                                        quizReady ? "bg-green-500 shadow-green-200" : "bg-blue-500"
                                    )}>
                                        {quizReady ? (
                                            <CheckCircle2 className="w-7 h-7 text-white" />
                                        ) : (
                                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                                        )}
                                    </div>
                                    {quizReady && (
                                        <Badge className="bg-green-500 text-white hover:bg-green-600 shadow-lg text-sm font-bold px-3 py-1">
                                            ✓ Ready
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Quiz Generator</h3>
                                    <p className="text-slate-500 font-medium">
                                        {quizReady ? "Questions Generated" : "AI is creating your quiz..."}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn(
                                            "h-full bg-blue-600 transition-all duration-[2000ms] ease-out",
                                            quizReady ? "w-full bg-green-500" : "w-2/3 animate-pulse"
                                        )} />
                                    </div>
                                </div>

                                {quizDetails && (
                                    <div className="pt-4 border-t border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600 font-medium">
                                                {quizDetails.total_questions || 0} Questions
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Monitoring Preparation Status */}
                        <Card className={cn(
                            "border-2 transition-all duration-500 shadow-xl",
                            isModelReady && isCalibrated ? "border-green-300 bg-gradient-to-br from-white to-green-50 shadow-green-100" : "border-indigo-200 bg-white"
                        )}>
                            <CardContent className="p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
                                        isModelReady && isCalibrated ? "bg-green-500 shadow-green-200" : "bg-indigo-500"
                                    )}>
                                        {isModelReady && isCalibrated ? (
                                            <ShieldCheck className="w-7 h-7 text-white" />
                                        ) : (
                                            <ShieldCheck className="w-7 h-7 text-white animate-pulse" />
                                        )}
                                    </div>
                                    <Badge className={cn(
                                        "text-white shadow-lg text-sm font-bold px-3 py-1",
                                        isModelReady && isCalibrated ? "bg-green-500" : "bg-indigo-400"
                                    )}>
                                        {isModelReady && isCalibrated ? "✓ Monitoring Active" : "Initializing..."}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Monitoring System</h3>
                                    <p className="text-slate-500 font-medium">
                                        {isModelReady && isCalibrated ? "AI Proctoring Active" : "Initializing AI detectors..."}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <MonitoringCheckItem
                                        icon={<Camera className="w-4 h-4" />}
                                        label="Camera Access"
                                        ready={diagnostics.some(d => d.includes("Camera"))}
                                    />
                                    <MonitoringCheckItem
                                        icon={<Shield className="w-4 h-4" />}
                                        label="AI Vision Engine"
                                        ready={isModelReady}
                                    />
                                    <MonitoringCheckItem
                                        icon={<Eye className="w-4 h-4" />}
                                        label="Gaze Calibration"
                                        ready={isCalibrated}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
                        <div className="flex gap-4">
                            <div className="w-32 h-24 rounded-lg bg-black overflow-hidden shadow-md ring-2 ring-slate-200/50">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <p className="text-sm font-bold text-slate-900 mb-1">Testing Camera Feed</p>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Make sure your face is clearly visible and you are looking at the screen for calibration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MonitoringCheckItem({ icon, label, ready }: { icon: React.ReactNode, label: string, ready: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className={cn(
                "flex items-center justify-center",
                ready ? "text-green-600" : "text-slate-400"
            )}>
                {icon}
            </div>
            <span className={cn(
                "font-semibold text-sm",
                ready ? "text-slate-900" : "text-slate-500"
            )}>
                {label}
            </span>
            {ready ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto font-bold" />
            ) : (
                <Loader2 className="w-4 h-4 text-blue-500 ml-auto animate-spin" />
            )}
        </div>
    )
}

export default function QuizPreparationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <QuizPreparationContent />
        </Suspense>
    )
}
