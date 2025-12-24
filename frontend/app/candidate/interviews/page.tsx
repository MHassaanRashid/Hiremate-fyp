"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    ExternalLink,
    Loader2,
    CalendarCheck,
    Building2,
    Mail,
    Phone,
    User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CandidateLayout from "@/layouts/CandidateLayout"
import { cn } from "@/lib/utils"

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
            <CandidateLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Skeleton className="h-20 w-1/3 rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-64 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </CandidateLayout>
        )
    }

    const upcomingInterviews = interviews.filter(i => new Date(i.scheduled_at) >= new Date())
    const pastInterviews = interviews.filter(i => new Date(i.scheduled_at) < new Date())

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                            My Interviews
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Manage your upcoming and past interview sessions
                        </p>
                    </div>

                    {/* Content */}
                    {interviews.length === 0 ? (
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-12 text-center">
                                <CalendarCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">No interviews scheduled</h3>
                                <p className="text-slate-500">
                                    When a recruiter schedules an interview with you, it will appear here
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {/* Upcoming Interviews */}
                            {upcomingInterviews.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                                        Upcoming Interviews ({upcomingInterviews.length})
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {upcomingInterviews.map((interview) => (
                                            <InterviewCard key={interview.id} interview={interview} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Past Interviews */}
                            {pastInterviews.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                                        Past Interviews ({pastInterviews.length})
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {pastInterviews.map((interview) => (
                                            <InterviewCard key={interview.id} interview={interview} isPast />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CandidateLayout >
    )
}

function InterviewCard({ interview, isPast = false }: { interview: Interview; isPast?: boolean }) {
    const scheduledDate = new Date(interview.scheduled_at)
    const isOnline = !!interview.meeting_link

    return (
        <Card className={cn(
            "border-0 shadow-lg bg-white hover:shadow-xl transition-all",
            isPast && "opacity-75"
        )}>
            <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                            {interview.recruiter.company_name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                                {interview.job.job_title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-slate-600">
                                <Building2 className="w-4 h-4" />
                                {interview.recruiter.company_name}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge className={cn(
                        "border",
                        isPast ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-100 text-blue-700 border-blue-200"
                    )}>
                        {isPast ? 'Completed' : 'Upcoming'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{scheduledDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{interview.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        {isOnline ? <Video className="w-4 h-4 text-slate-400" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                        <span>{isOnline ? 'Online' : 'In-Person'}</span>
                    </div>
                </div>

                {interview.notes && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Note from Recruiter</p>
                        <p className="text-sm text-slate-700">{interview.notes}</p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{interview.recruiter.full_name}</span>
                    </div>
                    {isOnline && interview.meeting_link && !isPast && (
                        <Button
                            asChild
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                        >
                            <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                                <Video className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
