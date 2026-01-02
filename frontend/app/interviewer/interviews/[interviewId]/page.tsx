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
    ShieldAlert,
    MessageSquare,
    CheckCircle2
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
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
    const [violations, setViolations] = useState<any[]>([])
    const [isLive, setIsLive] = useState(false)

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

    // Timer for interview duration & Real-time proctoring
    useEffect(() => {
        if (isLive) {
            const interval = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)

            // Subscribe to proctoring channel
            const channel = supabase.channel(`interview_${interviewId}`)
                .on('broadcast', { event: 'proctoring_violation' }, (payload) => {
                    console.log('Received violation:', payload)
                    setViolations(prev => [payload.payload, ...prev])
                    toast(
                        (t) => (
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Candidate Violation</p>
                                    <p className="text-[10px] text-slate-600 font-medium">{payload.payload.reason}</p>
                                </div>
                            </div>
                        ),
                        {
                            duration: 6000,
                            style: { borderLeft: '4px solid #ef4444', borderRadius: '12px' }
                        }
                    )
                })
                .subscribe()

            return () => {
                clearInterval(interval)
                supabase.removeChannel(channel)
            }
        }
    }, [isLive, interviewId])

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
                    {!isLive ? (
                        <Button
                            onClick={() => setIsLive(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 font-bold rounded-xl shadow-lg shadow-emerald-600/20"
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Start Interview Session
                        </Button>
                    ) : (
                        <>
                            <Badge className="bg-indigo-100 text-indigo-700 text-lg px-4 py-2 border-indigo-200">
                                <Clock className="w-4 h-4 mr-2" />
                                {formatTime(elapsedTime)}
                            </Badge>
                            <Button
                                variant="destructive"
                                onClick={handleEndInterview}
                                className="bg-rose-600 hover:bg-rose-700 h-11 px-6 font-bold rounded-xl shadow-lg shadow-rose-600/20"
                            >
                                <X className="w-4 h-4 mr-2" />
                                End Interview
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Container */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-0">
                            <div className="aspect-video bg-slate-900 flex flex-col items-center justify-center text-white relative">
                                {!isLive ? (
                                    <div className="text-center p-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 max-w-sm">
                                        <Video className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                                        <h3 className="font-bold text-lg mb-2">Ready to start?</h3>
                                        <p className="text-slate-400 text-xs mb-6 font-medium">Click "Start Interview Session" above to begin monitoring and join the call.</p>
                                    </div>
                                ) : (
                                    <>
                                        <Video className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                        <div className="text-center">
                                            <p className="text-xl font-black tracking-tight text-white/90">LIVE SESSION ACTIVE</p>
                                            <p className="text-xs text-slate-400 mt-2 font-medium">Connected to Zoom via secure tunnel</p>

                                            {interview.meetingLink && (
                                                <Button
                                                    className="mt-8 bg-blue-600 hover:bg-blue-700 h-12 px-8 font-black rounded-xl transition-all shadow-xl shadow-blue-600/30"
                                                    onClick={() => window.open(interview.meetingLink, '_blank')}
                                                >
                                                    Join Zoom Meeting
                                                </Button>
                                            )}
                                        </div>

                                        <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Recoring Active</span>
                                        </div>
                                    </>
                                )}
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

                {/* Left Column: Proctoring & Info */}
                <div className="space-y-6">
                    {/* Live Proctoring Monitor */}
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl bg-white overflow-hidden border-t-4 border-red-500">
                        <CardHeader className="bg-red-50/50 pb-3">
                            <CardTitle className="text-sm font-black text-red-900 flex items-center gap-2 uppercase tracking-widest">
                                <ShieldAlert className="w-4 h-4" />
                                AI Proctoring Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {violations.length === 0 ? (
                                <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">No violations detected</p>
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {violations.map((v, i) => (
                                        <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-3 animate-in slide-in-from-right duration-300">
                                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-black text-red-900 uppercase tracking-tighter">{v.type}</p>
                                                <p className="text-[10px] text-red-700 font-medium leading-normal">{v.reason}</p>
                                                <p className="text-[8px] text-red-400 mt-1 font-bold">{new Date(v.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Live Sync Active
                                </p>
                            </div>
                        </CardContent>
                    </Card>
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
