"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    User,
    ExternalLink,
    Loader2,
    CalendarCheck,
    ChevronRight,
    Search,
    Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Interview {
    id: string
    job_id: string
    candidate_id: string
    scheduled_at: string
    duration_minutes: number
    meeting_link?: string
    location?: string
    notes?: string
    status: string
    recruiter: {
        full_name: string
        email: string
        company_name?: string
        company_logo?: string
    }
    job: {
        job_title: string
    }
}

export default function CandidateInterviewsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/auth?tab=login")
                return
            }
            fetchInterviews()
        }
    }, [user, authLoading])

    const fetchInterviews = async () => {
        try {
            setLoading(true)
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const res = await fetch(`${backend}/interviews/candidate`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            })
            if (!res.ok) throw new Error("Failed to fetch interviews")
            const data = await res.json()
            setInterviews(data.interviews)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="p-6 md:p-10 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto space-y-8">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Interviews</h1>
                    <p className="text-slate-500 mt-2">Upcoming and past interviews for your job applications.</p>
                </div>

                {interviews.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 bg-white/50 py-20">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <CalendarCheck className="h-10 w-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900">No interviews scheduled yet</h3>
                            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                                When a recruiter schedules an interview with you, it will appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {interviews.map((interview) => (
                            <Card key={interview.id} className="group border-none shadow-sm ring-1 ring-slate-200 hover:ring-blue-300 transition-all duration-300 bg-white overflow-hidden">
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="w-full md:w-2 bg-blue-600"></div>
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-14 w-14 ring-2 ring-slate-50 shadow-sm">
                                                    <AvatarImage src={interview.recruiter.company_logo} />
                                                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">
                                                        {interview.recruiter.company_name?.charAt(0) || "C"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-xl group-hover:text-blue-600 transition-colors">
                                                        {interview.job.job_title}
                                                    </h3>
                                                    <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                                        <Building2 className="h-4 w-4" /> {interview.recruiter.company_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`
                                                capitalize px-3 py-1 rounded-full text-sm
                                                ${interview.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                                                ${interview.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                                                ${interview.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                                            `}>
                                                {interview.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Calendar className="h-5 w-5 text-blue-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Date</span>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {new Date(interview.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Clock className="h-5 w-5 text-blue-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Time</span>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Clock className="h-5 w-5 text-blue-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Duration</span>
                                                    <span className="text-sm font-bold text-slate-700">{interview.duration_minutes} Minutes</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Video className="h-5 w-5 text-blue-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Format</span>
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {interview.meeting_link ? "Online" : "In-Person"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {interview.notes && (
                                            <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 italic">Notes from Recruiter</p>
                                                <p className="text-sm text-slate-600 leading-relaxed">{interview.notes}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                                            {interview.meeting_link && (
                                                <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-semibold shadow-lg shadow-blue-200" asChild>
                                                    <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                                                        Join Meeting <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            {interview.location && !interview.meeting_link && (
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm uppercase tracking-tight">{interview.location}</span>
                                                </div>
                                            )}
                                            <div className="sm:ml-auto flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-slate-400 font-medium font-sans uppercase">Contact</p>
                                                    <p className="text-sm font-bold text-slate-700">{interview.recruiter.full_name}</p>
                                                </div>
                                                <Button variant="outline" className="h-10 border-slate-200 hover:bg-slate-50 shadow-sm" asChild>
                                                    <a href={`mailto:${interview.recruiter.email}`}>
                                                        Message Recruiter
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
