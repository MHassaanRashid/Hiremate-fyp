"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CandidateLayout from "@/layouts/CandidateLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Code2,
    Clock,
    FileQuestion,
    TrendingUp,
    AlertCircle,
    Loader2,
    Lock,
    CheckCircle2,
    Sparkles,
    ShieldCheck,

    Video,
    Zap,
    Timer,
    CheckSquare,
    Target,
    FileText,
    Info,
    Camera,
    Trophy,
    ArrowRight,
    ArrowLeftRight,
    BadgeAlert, // Still used in main page or might be used in rules
    Ban,
    History as HistoryIcon,
} from "lucide-react"
import { getQuizLanguages, createQuiz } from "@/lib/api/quiz"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import type { TestLanguage } from "@/types/dashboard"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"


import { getTechIcon } from "@/components/icons/TechIcons"
import { QuizSkeleton } from "@/components/candidate/QuizSkeleton"


export default function QuizSelectionPage() {
    const router = useRouter()
    const [languages, setLanguages] = useState<TestLanguage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLanguage, setSelectedLanguage] = useState<TestLanguage | null>(null)
    const [showInstructions, setShowInstructions] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedAI, setAcceptedAI] = useState(false)
    const [creating, setCreating] = useState(false)
    const [generationStep, setGenerationStep] = useState(0)

    const generationSteps = [
        "Initializing AI engine...",
        "Analyzing assessment standards...",
        "Generating technical MCQs...",
        "Validating question integrity...",
        "Preparing proctoring environment...",
        "Finalizing your assessment..."
    ]

    useEffect(() => {
        fetchLanguages()
    }, [])

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (creating) {
            interval = setInterval(() => {
                setGenerationStep(prev => (prev + 1) % generationSteps.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [creating]);

    const fetchLanguages = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const data = await getQuizLanguages(session.access_token)
                setLanguages(data)
            }
        } catch (error) {
            console.error("Error fetching languages:", error)
            toast.error("Failed to load assessment languages")
        } finally {
            setLoading(false)
        }
    }

    const handleLanguageSelect = (language: TestLanguage) => {
        setSelectedLanguage(language)
        setShowInstructions(true)
        setAcceptedTerms(false)
        setAcceptedAI(false)
    }

    const handleStartQuiz = async () => {
        if (!selectedLanguage || !acceptedTerms || !acceptedAI) return

        // 1. Camera Access Check
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            // Close the stream immediately, checks passed
            stream.getTracks().forEach(track => track.stop())
        } catch (error) {
            console.error("Camera access denied:", error)
            toast.error("Camera access is required. Please enable permissions in your browser.")
            return
        }

        setCreating(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error("Please log in to start an assessment")
                return
            }

            const result = await createQuiz(session.access_token, selectedLanguage.code)
            toast.success("Assessment ready!")
            router.push(`/candidate/quiz/${result.test_id}`)
        } catch (error: any) {
            console.error("Error creating quiz:", error)
            toast.error(error.message || "Failed to create quiz")
            setCreating(false)
        }
    }

    if (loading) {
        return <QuizSkeleton />
    }

    return (
        <CandidateLayout>
            <TooltipProvider>
                {/* Full Screen Generation Overlay - Simplified & Friendly */}
                {creating && (
                    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                        {/* Subtle Background Elements */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white -z-10" />

                        <div className="relative mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center relative">
                                <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
                                <div className="absolute inset-0 border-4 border-blue-100 rounded-2xl animate-[spin_3s_linear_infinite]" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                            Preparing your assessment
                        </h2>

                        <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8 animate-pulse">
                            {generationSteps[generationStep] || "Finalizing secure environment..."}
                        </p>

                        <div className="h-1.5 w-64 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-700 ease-in-out rounded-full"
                                style={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 md:p-12 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
                    <AnimatedBackground />


                    <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                        {/* Modern Header */}
                        <div className="text-center space-y-6 pt-8">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 text-blue-700 text-sm font-bold uppercase tracking-wider shadow-sm">
                                <Zap className="w-4 h-4 fill-current" />
                                AI-Powered Assessment
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                                Choose Your <br className="hidden sm:block" />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Technology
                                </span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                                Select a technology to begin your professional skills assessment powered by AI.
                            </p>
                        </div>

                        {/* Enhanced Rules Bar */}
                        <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-slate-900/5">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
                                <QuickRule
                                    icon={<FileText className="w-5 h-5" />}
                                    label="Questions"
                                    value="10 MCQs"
                                    color="blue"
                                />
                                <QuickRule
                                    icon={<Timer className="w-5 h-5" />}
                                    label="Time Limit"
                                    value="15 Minutes"
                                    color="purple"
                                />
                                <QuickRule
                                    icon={<ArrowLeftRight className="w-5 h-5" />}
                                    label="No Backtrack"
                                    value="Sequential"
                                    color="amber"
                                    tooltip="Once you submit an answer, you cannot go back to change it."
                                />
                                <QuickRule
                                    icon={<Camera className="w-5 h-5" />}
                                    label="Monitoring"
                                    value="AI Proctored"
                                    color="rose"
                                />
                                <QuickRule
                                    icon={<Trophy className="w-5 h-5" />}
                                    label="Passing %"
                                    value="80% Score"
                                    color="emerald"
                                />
                            </div>
                        </div>

                        {/* Technology Grid */}
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Available Technologies</h2>
                                <p className="text-slate-500 font-medium">{languages.length} professional assessments ready</p>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8 md:gap-12 py-8">
                                {languages.map((language) => (
                                    <TechIcon
                                        key={language.id}
                                        language={language}
                                        onSelect={handleLanguageSelect}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </TooltipProvider>

            {/* Assessment Confirmation Modal */}
            <Dialog open={showInstructions} onOpenChange={(open) => !creating && setShowInstructions(open)}>
                <DialogContent className="max-w-xl p-0 overflow-hidden border border-slate-200 rounded-2xl shadow-2xl bg-white">
                    <DialogHeader className="p-6 pb-2 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-1 rounded-full bg-blue-600" />
                            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Confirmation</span>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                            Start {selectedLanguage?.display_name} Assessment
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Please review the requirements before proceeding.
                        </DialogDescription>
                    </DialogHeader>



                    <div className="p-6">
                        <div className="flex flex-col gap-6">
                            {/* Key Details */}
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                                    {selectedLanguage && (() => {
                                        const Icon = getTechIcon(selectedLanguage.code)
                                        return <Icon className="w-7 h-7" />
                                    })()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Assessment Details</h4>
                                    <p className="text-sm text-slate-500">
                                        {selectedLanguage?.duration_minutes} Minutes • {selectedLanguage?.question_count} Questions • Adaptive Format
                                    </p>
                                </div>
                            </div>

                            {/* Rules */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                                    Proctoring Requirements
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                        <span>Webcam monitoring will be active throughout the session</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                        <span>Switching tabs or windows is strictly prohibited</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                        <span>Once answered, you cannot return to previous questions</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Agreements */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <ConsentRow
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={setAcceptedTerms}
                                    label="I agree to the proctoring requirements"
                                />
                                <ConsentRow
                                    id="ai"
                                    checked={acceptedAI}
                                    onCheckedChange={setAcceptedAI}
                                    label="I accept the AI-based evaluation standards"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 bg-white flex flex-col sm:flex-row gap-3">


                        <Button
                            variant="ghost"
                            onClick={() => setShowInstructions(false)}
                            disabled={creating}
                            className="h-12 font-bold text-slate-500 hover:text-slate-900 rounded-xl flex-1 border border-slate-200 bg-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStartQuiz}
                            disabled={!acceptedTerms || !acceptedAI || creating}
                            className="h-12 px-8 font-bold text-lg bg-blue-600 hover:bg-blue-700 shadow-md rounded-xl flex-[2] transition-all"
                        >
                            {creating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Start Assessment"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CandidateLayout >
    )
}

function QuickRule({ icon, label, value, color, tooltip }: { icon: any, label: string, value: string, color: string, tooltip?: string }) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    }

    return (
        <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm border", colors[color])}>
                {icon}
            </div>
            <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-3 h-3 text-slate-300 hover:text-slate-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-[11px] p-3 text-slate-600 bg-white border-slate-200 shadow-xl rounded-xl">
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            <p className="text-sm font-black text-slate-800 tracking-tight">{value}</p>
        </div>
    )
}

function TechIcon({ language, onSelect }: { language: TestLanguage; onSelect: (lang: TestLanguage) => void }) {
    const IconComponent = getTechIcon(language.code)

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    onClick={() => onSelect(language)}
                    className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:-translate-y-3"
                >
                    <div className={cn(
                        "w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center transition-all duration-500 relative overflow-hidden p-4",
                        "bg-white border-2 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
                        "group-hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)] group-hover:border-blue-300/60 group-hover:scale-110"
                    )}>
                        <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80"
                        )} />
                        <IconComponent className="w-full h-full transition-all duration-500 z-10 group-hover:scale-110" />
                    </div>
                    <span className="mt-4 text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors tracking-wide uppercase">
                        {language.display_name}
                    </span>
                    <div className="absolute -bottom-2 w-10 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out shadow-lg shadow-blue-500/50" />
                </div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white border-0 text-xs font-bold px-4 py-2 rounded-xl shadow-2xl mb-2">
                Take {language.display_name} Test
            </TooltipContent>
        </Tooltip>
    )
}

function StatBox({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    const colors: any = {
        blue: "bg-blue-50/50 text-blue-600 border-blue-100/50",
        indigo: "bg-indigo-50/50 text-indigo-600 border-indigo-100/50",
        amber: "bg-amber-50/50 text-amber-600 border-amber-100/50",
        emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100/50"
    }

    return (
        <div className={cn("p-4 rounded-xl border transition-all", colors[color])}>
            <div className="flex items-center gap-2 mb-1.5 opacity-60">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-lg font-bold tabular-nums tracking-tight">{value}</p>
        </div>
    )
}

function ConsentRow({ id, checked, onCheckedChange, label }: { id: string, checked: boolean, onCheckedChange: (v: boolean) => void, label: string }) {
    return (
        <label
            htmlFor={id}
            className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                checked ? "bg-blue-50/50 border-blue-200 shadow-sm" : "bg-white border-slate-100 hover:bg-slate-50"
            )}
        >
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(v) => onCheckedChange(v as boolean)}
                className="w-5 h-5 rounded-md data-[state=checked]:bg-blue-600 border-slate-300"
            />
            <span className={cn(
                "text-sm font-semibold transition-colors",
                checked ? "text-blue-900" : "text-slate-600"
            )}>
                {label}
            </span>
        </label>
    )
}

function RuleItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold text-slate-700">{text}</span>
        </div>
    )
}
