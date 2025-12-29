"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getInterviewDetails, saveInterviewNotes, endInterview } from "@/lib/api/interviewer"
import type { InterviewDetails } from "@/types/interviewer"
import {
    Video,
    User,
    Briefcase,
    GraduationCap,
    FileText,
    Clock,
    Save,
    X,
    AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

export default function LiveInterviewPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const interviewId = params?.interviewId as string

    const [interview, setInterview] = useState<InterviewDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [notes, setNotes] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)

    useEffect(() => {
        const fetchInterview = async () => {
            if (!user || !interviewId) return

            try {
                setIsLoading(true)
                const token = localStorage.getItem('access_token')
                if (!token) throw new Error('No access token')

                const data = await getInterviewDetails(token, interviewId)
                setInterview(data)
                setNotes(data.notes || "")
            } catch (err: any) {
                console.error('Error fetching interview:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (!authLoading && user) {
            fetchInterview()
        }
    }, [user, authLoading, interviewId])

    // Timer for interview duration
    useEffect(() => {
        if (interview?.status === 'in-progress') {
            const interval = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [interview?.status])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleSaveNotes = async () => {
        if (!interview) return

        try {
            setIsSaving(true)
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error('No access token')

            await saveInterviewNotes(token, interview.id, notes)
            toast.success('Notes saved successfully')
        } catch (err: any) {
            toast.error('Failed to save notes')
            console.error('Error saving notes:', err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleEndInterview = async () => {
        if (!interview) return

        if (!confirm('Are you sure you want to end this interview?')) return

        try {
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error('No access token')

            await endInterview(token, interview.id)
            toast.success('Interview ended successfully')
            router.push(`/interviewer/review/${interview.id}`)
        } catch (err: any) {
            toast.error('Failed to end interview')
            console.error('Error ending interview:', err)
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

    if (error || !interview) {
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
                    <p className="mt-2 text-gray-600">Loading interview...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Live Interview</h1>
                    <p className="text-slate-600 mt-1">{interview.candidate.name} - {interview.position}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className="bg-indigo-100 text-indigo-700 text-lg px-4 py-2">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(elapsedTime)}
                    </Badge>
                    <Button
                        variant="destructive"
                        onClick={handleEndInterview}
                        className="bg-rose-600 hover:bg-rose-700"
                    >
                        <X className="w-4 h-4 mr-2" />
                        End Interview
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Container */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                        <CardContent className="p-6">
                            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Video Interview Interface</p>
                                    <p className="text-sm text-slate-400 mt-2">WebRTC integration placeholder</p>
                                    {interview.meetingLink && (
                                        <a
                                            href={interview.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                                        >
                                            Join Meeting
                                        </a>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Panel */}
                    <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                    Interview Notes
                                </div>
                                <Button
                                    size="sm"
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Save Notes'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Take notes during the interview..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={10}
                                className="resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Candidate Info Panel */}
                <div>
                    <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="w-5 h-5 mr-2 text-indigo-600" />
                                Candidate Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900">
                                    {interview.candidate.name}
                                </h3>
                                <p className="text-sm text-slate-600">{interview.candidate.email}</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                        <Briefcase className="w-4 h-4" />
                                        Position
                                    </div>
                                    <p className="text-sm text-slate-600 ml-6">{interview.candidate.position}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                        <Clock className="w-4 h-4" />
                                        Experience
                                    </div>
                                    <p className="text-sm text-slate-600 ml-6">{interview.candidate.experience}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                        <GraduationCap className="w-4 h-4" />
                                        Education
                                    </div>
                                    <p className="text-sm text-slate-600 ml-6">{interview.candidate.education}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                        <FileText className="w-4 h-4" />
                                        Skills
                                    </div>
                                    <div className="flex flex-wrap gap-2 ml-6">
                                        {interview.candidate.skills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="bg-indigo-50 border-indigo-300 text-indigo-700"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {interview.candidate.resumeUrl && (
                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => window.open(interview.candidate.resumeUrl, '_blank')}
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            View Resume
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
