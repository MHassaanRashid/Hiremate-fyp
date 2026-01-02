"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProctoring } from "@/hooks/use-proctoring"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Loader2, Video, Clock } from "lucide-react"
import toast from "react-hot-toast"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function CandidateInterviewRoom() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const interviewId = params.interviewId as string

    const [interview, setInterview] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)

    // 1. Fetch Interview Data
    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const { data, error } = await supabase
                    .from("interviews")
                    .select("*")
                    .eq("id", interviewId)
                    .single()

                if (error) throw error
                setInterview(data)
            } catch (err) {
                console.error("Error fetching interview:", err)
                toast.error("Failed to load interview details")
            } finally {
                setLoading(false)
            }
        }

        if (interviewId) fetchInterview()
    }, [interviewId])

    // 2. Real-time Broadcasting of Violations
    const broadcastViolation = useCallback(async (reason: string, type: string) => {
        const channel = supabase.channel(`interview_${interviewId}`)
        await channel.send({
            type: 'broadcast',
            event: 'proctoring_violation',
            payload: { reason, type, timestamp: new Date().toISOString() }
        })
    }, [interviewId])

    const handleWarning = useCallback((count: number, reason: string, type: any) => {
        // Show local toast
        toast.error(`Proctoring Warning: ${reason}`, { id: 'proctoring-warn' })
        // Broadcast to interviewer
        broadcastViolation(reason, type)
    }, [broadcastViolation])

    // 3. Initialize Proctoring
    const { isModelReady, status: proctoringStatus } = useProctoring({
        videoRef,
        isActive: !loading && !!interview,
        onWarning: handleWarning,
        onTerminate: (reason, proof) => {
            toast.error("Interview proctoring critical violation recorded.")
            broadcastViolation("CRITICAL: " + reason, "terminal")
        }
    })

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            {/* Room Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">HM</div>
                        <div>
                            <h2 className="font-bold text-slate-900">{interview?.job_title}</h2>
                            <p className="text-xs text-slate-500 font-medium">Live Technical Interview</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-green-700">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Secure Session</span>
                        </div>
                        <div className="w-32 h-20 bg-black rounded-lg overflow-hidden border-2 border-slate-200 relative">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            {!isModelReady && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Zoom Embed Area */}
                    <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between p-4 px-6">
                            <div className="flex items-center gap-3">
                                <Video className="w-5 h-5 text-blue-400" />
                                <span className="font-bold tracking-tight">Zoom Meeting Window</span>
                            </div>
                            <Badge className="bg-blue-600">Active</Badge>
                        </CardHeader>
                        <CardContent className="p-0 aspect-video bg-slate-800 flex flex-col items-center justify-center text-white text-center">
                            <div className="max-w-md p-8">
                                <Video className="w-16 h-16 mx-auto mb-6 text-slate-600" />
                                <h3 className="text-xl font-bold mb-4">Zoom Integration</h3>
                                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                                    Click the button below to join the secure Zoom meeting.
                                    Maintain your camera feed within the proctoring frame at all times.
                                </p>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 h-12 px-8 font-bold text-lg rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                    onClick={() => window.open(interview?.location, '_blank')}
                                >
                                    Launch Zoom Meeting
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white/90">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-slate-600 space-y-2">
                                <p>• Do not switch tabs or minimize the browser.</p>
                                <p>• Ensure your face is clearly visible to the AI.</p>
                                <p>• No use of external devices (phones, etc).</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white/90">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-slate-600 space-y-2">
                                <p>Scheduled: {interview?.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : 'Loading...'}</p>
                                <p>Duration: 60 Minutes</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden border-t-4 border-blue-600">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">AI Monitor</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Head Tracking</span>
                                <div className={`w-2 h-2 rounded-full ${proctoringStatus === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Object Detection</span>
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Tab Focus</span>
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-red-600 mb-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Live Warning Feed</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic">
                                    Warnings are visible to your interviewer in real-time.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
