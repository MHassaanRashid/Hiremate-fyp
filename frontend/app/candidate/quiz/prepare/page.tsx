"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    CheckCircle2,
    ShieldCheck,
    Camera,
    Brain,
    FileText,
    Sparkles
} from "lucide-react"
import { createQuiz } from "@/lib/api/quiz"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"
import { useProctoring } from "@/hooks/use-proctoring"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'


export default function QuizPreparationPage() {
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
    const { isModelReady, diagnostics } = useProctoring({
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

    // Auto-start when both systems ready
    useEffect(() => {
        if (quizReady && isModelReady && quizId) {
            // Redirect immediately - no artificial delay
            router.push(`/candidate/quiz/${quizId}`)
        }
    }, [quizReady, isModelReady, quizId, router])

    const allSystemsReady = quizReady && isModelReady

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
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        Quiz Preparation
                                    </h3>
                                    <p className={cn(
                                        "text-sm font-semibold transition-colors",
                                        quizReady ? "text-green-700 text-base" : "text-blue-600 animate-pulse"
                                    )}>
                                        {quizReady ? "✓ Quiz is ready to begin" : "Generating AI questions..."}
                                    </p>
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
                            isModelReady ? "border-green-300 bg-gradient-to-br from-white to-green-50 shadow-green-100" : "border-blue-200 bg-white"
                        )}>
                            <CardContent className="p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
                                        isModelReady ? "bg-green-500 shadow-green-200" : "bg-blue-500"
                                    )}>
                                        {isModelReady ? (
                                            <CheckCircle2 className="w-7 h-7 text-white" />
                                        ) : (
                                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                                        )}
                                    </div>
                                    {isModelReady && (
                                        <Badge className="bg-green-500 text-white hover:bg-green-600 shadow-lg text-sm font-bold px-3 py-1">
                                            ✓ Ready
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        Monitoring System
                                    </h3>
                                    <p className={cn(
                                        "text-sm font-semibold transition-colors",
                                        isModelReady ? "text-green-700 text-base" : "text-blue-600 animate-pulse"
                                    )}>
                                        {isModelReady ? "✓ AI monitoring is active" : "Initializing AI detectors..."}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                                    <MonitoringCheckItem
                                        icon={<Camera className="w-3.5 h-3.5" />}
                                        label="Camera Access"
                                        ready={diagnostics.some(d => d.includes("Camera"))}
                                    />
                                    <MonitoringCheckItem
                                        icon={<Brain className="w-3.5 h-3.5" />}
                                        label="Face Detection AI"
                                        ready={diagnostics.some(d => d.includes("Face Detection Active"))}
                                    />
                                    <MonitoringCheckItem
                                        icon={<Sparkles className="w-3.5 h-3.5" />}
                                        label="Object Detection AI"
                                        ready={diagnostics.some(d => d.includes("Object Detection Ready"))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Hidden Camera Feed */}
                    <div className="hidden">
                        <video ref={videoRef} autoPlay playsInline muted />
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
