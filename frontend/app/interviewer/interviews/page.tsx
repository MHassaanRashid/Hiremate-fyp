"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import InterviewerLayout from "@/layouts/InterviewerLayout"
import { getAssignedInterviews } from "@/lib/api/interviewer"
import type { AssignedInterview } from "@/types/interviewer"
import { Search, Filter, Video, AlertCircle, Calendar, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import InterviewCard from "@/components/interviewer/InterviewCard"
import EmptyState from "@/components/interviewer/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"

export default function InterviewsListPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [interviews, setInterviews] = useState<AssignedInterview[]>([])
    const [filteredInterviews, setFilteredInterviews] = useState<AssignedInterview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    useEffect(() => {
        const fetchInterviews = async () => {
            if (!user) return

            try {
                setIsLoading(true)
                const token = localStorage.getItem('access_token')
                if (!token) throw new Error('No access token')

                const data = await getAssignedInterviews(token)
                setInterviews(data)
                setFilteredInterviews(data)
            } catch (err: any) {
                console.error('Error fetching interviews:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (!authLoading && user) {
            fetchInterviews()
        }
    }, [user, authLoading])

    // Filter interviews based on search and filters
    useEffect(() => {
        let filtered = interviews

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(interview =>
                interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                interview.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                interview.company.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Type filter
        if (typeFilter !== "all") {
            filtered = filtered.filter(interview => interview.type === typeFilter)
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(interview => interview.status === statusFilter)
        }

        setFilteredInterviews(filtered)
    }, [searchQuery, typeFilter, statusFilter, interviews])

    const handleInterviewClick = (interview: AssignedInterview) => {
        if (interview.status === 'completed') {
            router.push(`/interviewer/review/${interview.id}`)
        } else {
            router.push(`/interviewer/interviews/${interview.id}`)
        }
    }

    if (authLoading || (!user && isLoading)) {
        return (
            <div className="flex h-screen items-center justify-center bg-transparent">
                <div className="w-full max-w-7xl p-6">
                    <Skeleton className="h-12 w-48 mb-6" />
                    <Skeleton className="h-16 w-full mb-8 rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (error && !interviews.length) {
        return (
            <InterviewerLayout>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
                        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <p className="text-rose-600 mb-6 font-medium">{error}</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </div>
            </InterviewerLayout>
        )
    }

    return (
        <InterviewerLayout>
            <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">My Interviews</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage and review all your assigned interviews.</p>
                    </div>
                    <div className="text-sm font-medium text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200/50">
                        Showing <span className="text-slate-900 font-bold">{filteredInterviews.length}</span> of {interviews.length} interviews
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-xl border border-indigo-100/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full group">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                            placeholder="Search by candidate, position, or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl bg-white"
                        />
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl border-slate-200 bg-white">
                                <SelectValue placeholder="Interview Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="live">Live Interview</SelectItem>
                                <SelectItem value="ai-assisted">AI-Assisted</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl border-slate-200 bg-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Interviews List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : filteredInterviews.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredInterviews.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                interview={interview}
                                onClick={() => handleInterviewClick(interview)}
                                className="border-0 shadow-lg hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 bg-white/90"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 p-12">
                        <EmptyState
                            icon={searchQuery || typeFilter !== "all" || statusFilter !== "all" ? Search : CalendarDays}
                            title={searchQuery || typeFilter !== "all" || statusFilter !== "all" ? "No Matching Interviews" : "No Interviews Assigned"}
                            description={searchQuery || typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your search or filters to find what you're looking for." : "You haven't been assigned any interviews yet. Check back later!"}
                        />
                    </div>
                )}
            </div>
        </InterviewerLayout>
    )
}
