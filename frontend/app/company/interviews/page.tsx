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
    Filter,
    MoreVertical,
    CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            const backend = "/api"
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
            <div className="flex h-screen items-center justify-center bg-blue-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl p-6">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Interviews</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage and track your scheduled interviews.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search candidates or jobs..."
                                className="pl-10 h-11 bg-white/80 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-11 w-11 bg-white/80 border-slate-200 shadow-sm rounded-xl">
                            <Filter className="h-4 w-4 text-slate-600" />
                        </Button>
                    </div>
                </div>

                {filteredInterviews.length === 0 ? (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden py-20">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <CalendarDays className="h-10 w-10 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No interviews found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                                {searchQuery ? "No results matching your search query." : "When you schedule interviews with candidates, they'll appear here."}
                            </p>
                            {!searchQuery && (
                                <Button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105" onClick={() => router.push('/company/jobs')}>
                                    Go to Jobs to Schedule
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredInterviews.map((interview) => (
                            <Card key={interview.id} className="group border-0 shadow-lg hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden rounded-2xl ring-1 ring-slate-100">
                                <div className="flex h-full">
                                    <div className={`w-1.5 ${interview.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-14 w-14 ring-4 ring-white shadow-sm">
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-lg">
                                                        {interview.candidate.full_name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                        {interview.candidate.full_name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                        Applying for <span className="text-slate-800">{interview.job.job_title}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>View Application</DropdownMenuItem>
                                                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Cancel Interview</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> Date
                                                </div>
                                                <div className="font-semibold text-slate-700">
                                                    {new Date(interview.scheduled_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Time
                                                </div>
                                                <div className="font-semibold text-slate-700">
                                                    {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ({interview.duration_minutes}m)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                {interview.location?.toLowerCase().includes('remote') || interview.meeting_link ? (
                                                    <div className="bg-blue-100/50 p-2 rounded-lg">
                                                        <Video className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-100/50 p-2 rounded-lg">
                                                        <MapPin className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-slate-600">
                                                    {interview.location || (interview.meeting_link ? "Virtual Meeting" : "Location TBD")}
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                {interview.meeting_link && (
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-md shadow-blue-200" asChild>
                                                        <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                                                            Join <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
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
