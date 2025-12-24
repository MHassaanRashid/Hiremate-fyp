"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import InterviewerLayout from "@/layouts/InterviewerLayout"
import { getAssignedInterviews } from "@/lib/api/interviewer"
import type { AssignedInterview } from "@/types/interviewer"
import { Search, Filter, Video, AlertCircle } from "lucide-react"
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

    if (error && !interviews.length) {
        return (
            <InterviewerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <p className="text-rose-600 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </div>
            </InterviewerLayout>
        )
    }

    return (
        <InterviewerLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">My Interviews</h1>
                    <p className="text-slate-600 mt-1">Manage all your assigned interviews</p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Search by candidate, position, or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Interview Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="live">Live Interview</SelectItem>
                            <SelectItem value="ai-assisted">AI-Assisted</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48">
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

                {/* Results Count */}
                <div className="text-sm text-slate-600">
                    Showing {filteredInterviews.length} of {interviews.length} interviews
                </div>

                {/* Interviews List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-8 h-8 border-t-2 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading interviews...</p>
                        </div>
                    </div>
                ) : filteredInterviews.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredInterviews.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                interview={interview}
                                onClick={() => handleInterviewClick(interview)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Video}
                        title={searchQuery || typeFilter !== "all" || statusFilter !== "all" ? "No Matching Interviews" : "No Interviews Assigned"}
                        description={searchQuery || typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your search or filters" : "You don't have any interviews assigned yet."}
                    />
                )}
            </div>
        </InterviewerLayout>
    )
}
