"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getInterviewReview, submitEvaluation } from "@/lib/api/interviewer"
import type { InterviewReview, Evaluation } from "@/types/interviewer"
import {
    Video,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Send,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import ScoreInput from "@/components/interviewer/ScoreInput"
import toast from "react-hot-toast"

export default function ReviewInterviewPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const interviewId = params?.interviewId as string

    const [review, setReview] = useState<InterviewReview | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [evaluation, setEvaluation] = useState<Evaluation>({
        interviewId: interviewId,
        technicalSkills: 5,
        communication: 5,
        problemSolving: 5,
        culturalFit: 5,
        overallRating: 5,
        strengths: "",
        weaknesses: "",
        recommendation: "maybe",
        comments: "",
    })

    useEffect(() => {
        const fetchReview = async () => {
            if (!user || !interviewId) return

            try {
                setIsLoading(true)
                const token = localStorage.getItem('access_token')
                if (!token) throw new Error('No access token')

                const data = await getInterviewReview(token, interviewId)
                setReview(data)

                // Pre-fill if existing evaluation
                if (data.existingEvaluation) {
                    setEvaluation(data.existingEvaluation)
                }
            } catch (err: any) {
                console.error('Error fetching review:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (!authLoading && user) {
            fetchReview()
        }
    }, [user, authLoading, interviewId])

    // Calculate overall rating
    useEffect(() => {
        const avg = (
            evaluation.technicalSkills +
            evaluation.communication +
            evaluation.problemSolving +
            evaluation.culturalFit
        ) / 4
        setEvaluation(prev => ({ ...prev, overallRating: Math.round(avg * 10) / 10 }))
    }, [
        evaluation.technicalSkills,
        evaluation.communication,
        evaluation.problemSolving,
        evaluation.culturalFit,
    ])

    const handleSubmit = async () => {
        if (!evaluation.strengths || !evaluation.weaknesses || !evaluation.comments) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            setIsSubmitting(true)
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error('No access token')

            await submitEvaluation(token, evaluation)
            toast.success('Evaluation submitted successfully')
            router.push('/interviewer/history')
        } catch (err: any) {
            toast.error('Failed to submit evaluation')
            console.error('Error submitting evaluation:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (error || !review) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-rose-600 mb-4">{error || 'Interview not found'}</p>
                    <Button onClick={() => router.push('/interviewer/interviews')}>
                        Back to Interviews
                    </Button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-t-2 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading review...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Interview Review</h1>
                <p className="text-slate-600 mt-1">
                    {review.candidate.name} - {review.position}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Recording & AI Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recording Playback */}
                    <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Video className="w-5 h-5 mr-2 text-indigo-600" />
                                Interview Recording
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Recording Playback</p>
                                    <p className="text-sm text-slate-400 mt-2">Video player placeholder</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Summary */}
                    {review.aiSummary && (
                        <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                                        AI-Generated Summary
                                    </div>
                                    <Badge className="bg-indigo-100 text-indigo-700">
                                        Score: {review.aiSummary.overallScore}/10
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Behavioral Indicators */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3">Behavioral Indicators</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {review.aiSummary.behavioralIndicators.map((indicator, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {indicator.category}
                                                    </span>
                                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                                                        {indicator.score}/10
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-600">{indicator.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Strengths */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                        Strengths
                                    </h4>
                                    <ul className="space-y-1">
                                        {review.aiSummary.strengths.map((strength, index) => (
                                            <li key={index} className="text-sm text-slate-600 flex items-start">
                                                <span className="text-emerald-600 mr-2">•</span>
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
                                        Areas for Improvement
                                    </h4>
                                    <ul className="space-y-1">
                                        {review.aiSummary.weaknesses.map((weakness, index) => (
                                            <li key={index} className="text-sm text-slate-600 flex items-start">
                                                <span className="text-amber-600 mr-2">•</span>
                                                {weakness}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Key Insights */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Key Insights</h4>
                                    <ul className="space-y-1">
                                        {review.aiSummary.keyInsights.map((insight, index) => (
                                            <li key={index} className="text-sm text-slate-600 flex items-start">
                                                <span className="text-indigo-600 mr-2">•</span>
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Interviewer Notes */}
                    {review.interviewerNotes && (
                        <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                    Interview Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {review.interviewerNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Evaluation Form */}
                <div>
                    <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50 sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                Evaluation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Score Inputs */}
                            <ScoreInput
                                label="Technical Skills"
                                value={evaluation.technicalSkills}
                                onChange={(value) =>
                                    setEvaluation({ ...evaluation, technicalSkills: value })
                                }
                            />
                            <ScoreInput
                                label="Communication"
                                value={evaluation.communication}
                                onChange={(value) =>
                                    setEvaluation({ ...evaluation, communication: value })
                                }
                            />
                            <ScoreInput
                                label="Problem Solving"
                                value={evaluation.problemSolving}
                                onChange={(value) =>
                                    setEvaluation({ ...evaluation, problemSolving: value })
                                }
                            />
                            <ScoreInput
                                label="Cultural Fit"
                                value={evaluation.culturalFit}
                                onChange={(value) =>
                                    setEvaluation({ ...evaluation, culturalFit: value })
                                }
                            />

                            {/* Overall Rating */}
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-slate-900">Overall Rating</span>
                                    <Badge className="bg-indigo-100 text-indigo-700 text-lg px-3 py-1">
                                        {evaluation.overallRating.toFixed(1)}/10
                                    </Badge>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Recommendation *
                                </label>
                                <Select
                                    value={evaluation.recommendation}
                                    onValueChange={(value: any) =>
                                        setEvaluation({ ...evaluation, recommendation: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="strong-hire">Strong Hire</SelectItem>
                                        <SelectItem value="hire">Hire</SelectItem>
                                        <SelectItem value="maybe">Maybe</SelectItem>
                                        <SelectItem value="no-hire">No Hire</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Strengths */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Strengths *
                                </label>
                                <Textarea
                                    placeholder="What are the candidate's key strengths?"
                                    value={evaluation.strengths}
                                    onChange={(e) =>
                                        setEvaluation({ ...evaluation, strengths: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>

                            {/* Weaknesses */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Weaknesses *
                                </label>
                                <Textarea
                                    placeholder="What areas need improvement?"
                                    value={evaluation.weaknesses}
                                    onChange={(e) =>
                                        setEvaluation({ ...evaluation, weaknesses: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>

                            {/* Comments */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Additional Comments *
                                </label>
                                <Textarea
                                    placeholder="Any additional feedback or observations?"
                                    value={evaluation.comments}
                                    onChange={(e) =>
                                        setEvaluation({ ...evaluation, comments: e.target.value })
                                    }
                                    rows={4}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
