"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import CandidateLayout from "@/layouts/CandidateLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    TrendingUp,
    Loader2,
    Home,
    FileText
} from "lucide-react"
import { getTestReport } from "@/lib/api/tests"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import type { TestReport } from "@/types/dashboard"

export default function TestReportPage() {
    const router = useRouter()
    const params = useParams()
    const testId = params.testId as string

    const [report, setReport] = useState<TestReport | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReport()
    }, [testId])

    const fetchReport = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/candidate')
                return
            }

            const data = await getTestReport(session.access_token, testId)
            setReport(data)
        } catch (error) {
            console.error("Error fetching report:", error)
            toast.error("Failed to load test report")
            router.push('/candidate/tests')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <CandidateLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </CandidateLayout>
        )
    }

    if (!report) {
        return (
            <CandidateLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-slate-600">Report not found</p>
                </div>
            </CandidateLayout>
        )
    }

    const passed = report.passed
    const scorePercentage = Math.round(report.score_percentage)

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                            Test Report
                        </h1>
                        <p className="text-slate-600 text-lg">
                            {report.language} Assessment
                        </p>
                    </div>

                    {/* Result Card */}
                    <Card className={`border-0 shadow-xl ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'
                        }`}>
                        <CardContent className="p-8 text-center">
                            <div className="mb-6">
                                {passed ? (
                                    <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto" />
                                ) : (
                                    <XCircle className="w-20 h-20 text-red-600 mx-auto" />
                                )}
                            </div>
                            <h2 className={`text-4xl font-bold mb-2 ${passed ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {passed ? 'Congratulations!' : 'Not Passed'}
                            </h2>
                            <p className={`text-xl mb-6 ${passed ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {passed
                                    ? 'You have successfully passed the test!'
                                    : 'You need 80% to pass. Keep practicing!'}
                            </p>
                            <div className="inline-block">
                                <div className="text-6xl font-bold text-slate-900 mb-2">
                                    {scorePercentage}%
                                </div>
                                <p className="text-slate-600">Your Score</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Breakdown */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-600" />
                                Performance Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600 mb-1">Correct Answers</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {report.correct_answers}/{report.total_questions}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600 mb-1">Accuracy</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {scorePercentage}%
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600 mb-1">Status</p>
                                    <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                        {passed ? 'Passed' : 'Failed'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-slate-600 mb-2">Completed on</p>
                                <p className="text-slate-900 font-medium">
                                    {new Date(report.completed_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Next Steps
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {passed ? (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-900">Interview Unlocked!</AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        You are now eligible for live interviews. Check your dashboard for interview opportunities.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <AlertTitle className="text-blue-900">Keep Practicing</AlertTitle>
                                    <AlertDescription className="text-blue-700">
                                        You can retake this test tomorrow. Use this time to practice and improve your skills.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={() => router.push('/candidate')}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => router.push('/candidate/tests')}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View All Tests
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CandidateLayout>
    )
}
