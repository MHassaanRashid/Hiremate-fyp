"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
    Clock,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Lock
} from "lucide-react"
import { getQuiz, submitQuizAnswer, completeQuiz } from "@/lib/api/quiz"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { Progress } from "@/components/ui/progress"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"
import { QuizExecutionSkeleton } from "@/components/candidate/QuizExecutionSkeleton"


export default function QuizExecutionPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = params.quizId as string

    const [quiz, setQuiz] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Camera setup for proctoring
    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    setIsCameraActive(true)
                }
            } catch (err) {
                console.error("Camera access denied:", err)
                toast.error("Camera access is required for proctoring")
            }
        }
        setupCamera()

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    useEffect(() => {
        if (quizId) fetchQuizData()
    }, [quizId])

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleCompleteQuiz()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft])

    const fetchQuizData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/candidate')
                return
            }

            const data = await getQuiz(session.access_token, quizId)
            setQuiz(data.quiz)
            setQuestions(data.questions)
            setTimeLeft(data.quiz.duration_minutes * 60)
        } catch (error) {
            console.error("Error fetching quiz:", error)
            toast.error("Failed to load assessment")
            router.push('/candidate/quiz')
        } finally {
            setLoading(false)
        }
    }

    const handleOptionSelect = (value: string) => {
        setSelectedOption(parseInt(value))
    }

    const handleNextQuestion = async () => {
        if (selectedOption === null) {
            toast.error("Please select an answer")
            return
        }

        setSubmitting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await submitQuizAnswer(session.access_token, quizId, {
                question_id: questions[currentIndex].id,
                selected_option: selectedOption
            })

            // Reset selection for NEXT question
            setSelectedOption(null)

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1)
            } else {
                handleCompleteQuiz()
            }
        } catch (error) {
            console.error("Error submitting answer:", error)
            toast.error("Failed to save answer")
        } finally {
            setSubmitting(false)
        }
    }

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
            setIsCameraActive(false)
        }
    }

    const handleCompleteQuiz = async () => {
        setSubmitting(true)
        setIsCompleting(true) // Start the full screen loader

        // Stop camera immediately as we transition to "analyzing" state
        stopCamera()

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await completeQuiz(session.access_token, quizId)
            // Delay slightly to let the animation play/user perceive the "analysis"
            await new Promise(resolve => setTimeout(resolve, 2000))

            toast.success("Assessment Completed!")
            router.push(`/candidate/quiz/${quizId}/report`)
        } catch (error) {
            console.error("Error completing quiz:", error)
            toast.error("Failed to submit assessment")
            setIsCompleting(false) // Only turn off if error
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return <QuizExecutionSkeleton />
    }

    // NEW: Full Screen Completion Loader
    if (isCompleting) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white -z-10" />

                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin" />
                        <ShieldCheck className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    Finalizing Assessment
                </h2>

                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8 animate-pulse">
                    Analyzing your answers and proctoring data...
                </p>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            {/* Focused Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 md:px-8 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="font-bold text-slate-900 text-sm tracking-tight">CheckMate AI</h2>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Proctored Session</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border transition-all duration-300 ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                            }`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-lg font-bold tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
                        </div>

                        {/* Camera Preview */}
                        <div className="relative w-28 h-20 bg-black rounded-lg overflow-hidden border-2 border-slate-200 shadow-md hidden sm:block">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute top-1 right-1 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                                <span className="text-[8px] font-bold text-white uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 relative z-10 min-h-[calc(100vh-80px)] flex flex-col justify-center">
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
                            </div>
                            <span className="text-xs font-bold text-blue-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <Card key={currentIndex} className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm ring-1 ring-slate-100">
                        <CardHeader className="p-6 md:p-8 pb-4">
                            {currentQuestion && (
                                <div className="space-y-4">
                                    <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        Single Choice
                                    </Badge>
                                    <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 leading-normal">
                                        {currentQuestion.question_text}
                                    </CardTitle>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 pt-2">
                            <RadioGroup
                                key={`q-${currentIndex}`}
                                value={selectedOption?.toString() ?? ""}
                                onValueChange={handleOptionSelect}
                                className="grid grid-cols-1 gap-3"
                            >
                                {currentQuestion?.options?.map((option: string, index: number) => (
                                    <Label
                                        key={index}
                                        htmlFor={`option-${index}`}
                                        className={cn(
                                            "relative flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 transition-all cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 group",
                                            selectedOption === index
                                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <RadioGroupItem
                                            value={index.toString()}
                                            id={`option-${index}`}
                                            className="w-5 h-5 border-2 border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:text-blue-600 transition-all"
                                        />
                                        <span className={cn(
                                            "text-base font-medium transition-colors",
                                            selectedOption === index ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                                        )}>
                                            {option}
                                        </span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </CardContent>

                        <CardFooter className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Answer Locked after Submit</span>
                            </div>

                            <Button
                                onClick={handleNextQuestion}
                                disabled={selectedOption === null || submitting}
                                className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <>
                                        {currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                                        <ChevronRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Simple Footer/Pagination */}
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            HireMate Secure Assessment Environment • Session ID: {quizId?.slice(0, 8)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
