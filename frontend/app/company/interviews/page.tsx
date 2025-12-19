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
    Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    candidate: {
        full_name: string
        email: string
        company_logo?: string
    }
    job: {
        job_title: string
    }
}

export default function CompanyInterviewsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

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
            const res = await fetch(`${backend}/interviews/company`, {
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

    const filteredInterviews = interviews.filter(interview =>
        interview.candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.job.job_title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (authLoading || loading) {
        return (
            <div className="p-6 md:p-10 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Interviews</h1>
                        <p className="text-slate-500 mt-2">Manage and track your scheduled interviews.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search candidates or jobs..."
                                className="pl-9 w-64 border-slate-200 bg-white shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="bg-white border-slate-200 shadow-sm">
                            <Filter className="h-4 w-4 text-slate-600" />
                        </Button>
                    </div>
                </div>

                {filteredInterviews.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 bg-transparent py-20">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <CalendarCheck className="h-10 w-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900">No interviews found</h3>
                            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                                {searchQuery ? "No results matching your search." : "When you schedule interviews with candidates, they'll appear here."}
                            </p>
                            {!searchQuery && (
                                <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/company/jobs')}>
                                    Go to Jobs to Schedule
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredInterviews.map((interview) => (
                            <Card key={interview.id} className="group border-none shadow-sm ring-1 ring-slate-200 hover:ring-blue-300 transition-all duration-300 bg-white overflow-hidden">
                                <div className="flex h-full">
                                    <div className="w-2 bg-blue-600"></div>
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12 ring-2 ring-slate-50">
                                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                        {interview.candidate.full_name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                        {interview.candidate.full_name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                        Role: <span className="font-medium text-slate-700">{interview.job.job_title}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`
                                                capitalize px-2.5 py-0.5 rounded-full
                                                ${interview.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                                                ${interview.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                                            `}>
                                                {interview.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="flex items-center gap-2.5 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium">
                                                    {new Date(interview.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                <Clock className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium">
                                                    {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration_minutes}m)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-2.5 text-slate-600">
                                                {interview.location?.toLowerCase().includes('remote') || interview.meeting_link ? (
                                                    <Video className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                )}
                                                <span className="text-sm">
                                                    {interview.location || (interview.meeting_link ? "Virtual Interview" : "Not specified")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {interview.meeting_link && (
                                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 h-9" asChild>
                                                    <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                                                        Join Meeting <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                            )}
                                            <Button variant="outline" className="flex-1 border-slate-200 h-9 group-hover:border-blue-200" asChild>
                                                <a href={`mailto:${interview.candidate.email}`}>
                                                    Message <ChevronRight className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
                                                </a>
                                            </Button>
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
