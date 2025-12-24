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
    CheckCircle2
} from "lucide-react"
import { getTestLanguages, createTest } from "@/lib/api/tests"
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
import { Checkbox } from "@/components/ui/checkbox"

export default function TestsPage() {
    const router = useRouter()
    const [languages, setLanguages] = useState<TestLanguage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLanguage, setSelectedLanguage] = useState<TestLanguage | null>(null)
    const [showInstructions, setShowInstructions] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedAI, setAcceptedAI] = useState(false)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchLanguages()
    }, [])

    const fetchLanguages = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const data = await getTestLanguages(session.access_token)
                setLanguages(data)
            }
        } catch (error) {
            console.error("Error fetching languages:", error)
            toast.error("Failed to load test languages")
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

    const handleStartTest = async () => {
        if (!selectedLanguage || !acceptedTerms || !acceptedAI) return

        setCreating(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error("Please log in to start a test")
                return
            }

            const result = await createTest(session.access_token, selectedLanguage.code)
            toast.success("Test created! Good luck!")
            router.push(`/candidate/tests/${result.test_id}`)
        } catch (error: any) {
            console.error("Error creating test:", error)
            toast.error(error.message || "Failed to create test")
        } finally {
            setCreating(false)
            setShowInstructions(false)
        }
    }

    if (loading) {
        return (
            <CandidateLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                </div>
            </CandidateLayout>
        )
    }

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                            Select Your Test Language
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Choose a programming language to test your skills
                        </p>
                    </div>

                    {/* Info Alert */}
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-900">Test Policy</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            You can take one test per language per day. Duration: 15 minutes. Passing score: 80%.
                        </AlertDescription>
                    </Alert>

                    {/* Language Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {languages.map((language) => (
                            <LanguageCard
                                key={language.id}
                                language={language}
                                onSelect={handleLanguageSelect}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Instructions Modal */}
            <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Test Instructions</DialogTitle>
                        <DialogDescription>
                            Please read carefully before starting
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Test Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <FileQuestion className="w-5 h-5 text-blue-600" />
                                Test Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 pl-7">
                                <div>
                                    <p className="text-sm text-slate-600">Language</p>
                                    <p className="font-medium">{selectedLanguage?.display_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Duration</p>
                                    <p className="font-medium">{selectedLanguage?.duration_minutes} minutes</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Questions</p>
                                    <p className="font-medium">{selectedLanguage?.question_count} (MCQ + Coding)</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Passing Score</p>
                                    <p className="font-medium">{selectedLanguage?.passing_score}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Important Rules */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                Important Rules
                            </h3>
                            <ul className="space-y-2 pl-7 text-sm text-slate-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                    <span>You cannot pause once started</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                    <span>Browser tab switching is monitored</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                    <span>One test per language per day</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                    <span>Test will auto-submit when time expires</span>
                                </li>
                            </ul>
                        </div>

                        {/* Terms */}
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm text-slate-700 cursor-pointer leading-relaxed"
                                >
                                    I have read and accept the test rules and understand that I cannot pause once started
                                </label>
                            </div>
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="ai"
                                    checked={acceptedAI}
                                    onCheckedChange={(checked) => setAcceptedAI(checked as boolean)}
                                />
                                <label
                                    htmlFor="ai"
                                    className="text-sm text-slate-700 cursor-pointer leading-relaxed"
                                >
                                    I understand this test uses automated evaluation
                                </label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowInstructions(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStartTest}
                            disabled={!acceptedTerms || !acceptedAI || creating}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Test...
                                </>
                            ) : (
                                "Start Test"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CandidateLayout>
    )
}

function LanguageCard({ language, onSelect }: { language: TestLanguage; onSelect: (lang: TestLanguage) => void }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Card
            className="border-0 shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect(language)}
        >
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
                        {language.code.toUpperCase().slice(0, 2)}
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {language.question_count} Questions
                    </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-4">
                    {language.display_name}
                </CardTitle>
                <CardDescription className="text-slate-600">
                    {language.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{language.duration_minutes} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span>{language.passing_score}% to pass</span>
                    </div>
                </div>

                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 group-hover:shadow-xl group-hover:shadow-blue-600/40 transition-all"
                >
                    <Code2 className="w-4 h-4 mr-2" />
                    Take Test
                </Button>
            </CardContent>
        </Card>
    )
}
