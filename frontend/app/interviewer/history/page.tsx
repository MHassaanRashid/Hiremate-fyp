"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getInterviewHistory } from "@/lib/api/interviewer"
import type { InterviewHistoryItem } from "@/types/interviewer"
import { History, Search, Calendar, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/interviewer/StatusBadge"
import EmptyState from "@/components/interviewer/EmptyState"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [history, setHistory] = useState<InterviewHistoryItem[]>([])
    const [filteredHistory, setFilteredHistory] = useState<InterviewHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return

            try {
                setIsLoading(true)
                const token = localStorage.getItem('access_token')
                if (!token) throw new Error('No access token')

                const data = await getInterviewHistory(token)
                setHistory(data)
                setFilteredHistory(data)
            } catch (err: any) {
                console.error('Error fetching history:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (!authLoading && user) {
            fetchHistory()
        }
    }, [user, authLoading])

    // Filter history based on search
    useEffect(() => {
        if (searchQuery) {
            const filtered = history.filter(item =>
                item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.company.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredHistory(filtered)
        } else {
            setFilteredHistory(history)
        }
    }, [searchQuery, history])

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
            .substring(0, 2)
    }

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'strong-hire':
                return 'bg-emerald-50 border-emerald-300 text-emerald-700'
            case 'hire':
                return 'bg-blue-50 border-blue-300 text-blue-700'
            case 'maybe':
                return 'bg-amber-50 border-amber-300 text-amber-700'
            case 'no-hire':
                return 'bg-rose-50 border-rose-300 text-rose-700'
            default:
                return 'bg-slate-50 border-slate-300 text-slate-700'
        }
    }

    const getRecommendationLabel = (recommendation: string) => {
        switch (recommendation) {
            case 'strong-hire':
                return 'Strong Hire'
            case 'hire':
                return 'Hire'
            case 'maybe':
                return 'Maybe'
            case 'no-hire':
                return 'No Hire'
            default:
                return recommendation
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

    if (error && !history.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-rose-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Interview History</h1>
                <p className="text-slate-600 mt-1">Review your past interviews and evaluations</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                    placeholder="Search by candidate, position, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600">
                Showing {filteredHistory.length} of {history.length} interviews
            </div>

            {/* History List */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-t-2 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading history...</p>
                    </div>
                </div>
            ) : filteredHistory.length > 0 ? (
                <div className="space-y-3">
                    {filteredHistory.map((item) => (
                        <Card
                            key={item.id}
                            className="bg-white/80 backdrop-blur-xl border-indigo-200/50 hover:border-indigo-300/50 transition-all duration-300 shadow-sm shadow-indigo-500/10 cursor-pointer hover:shadow-md hover:shadow-indigo-500/20"
                            onClick={() => router.push(`/interviewer/review/${item.id}`)}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <Avatar className="h-14 w-14 border-2 border-indigo-100">
                                        <AvatarImage src={item.candidateAvatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold">
                                            {getInitials(item.candidateName)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 truncate">
                                                    {item.candidateName}
                                                </h4>
                                                <p className="text-sm text-slate-600 truncate">
                                                    {item.position} at {item.company}
                                                </p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(item.interviewDate).toLocaleDateString()}</span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs font-medium", getRecommendationColor(item.recommendation))}
                                            >
                                                {getRecommendationLabel(item.recommendation)}
                                            </Badge>
                                            <Badge variant="outline" className="bg-indigo-50 border-indigo-300 text-indigo-700">
                                                Score: {item.finalScore}/10
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={History}
                    title={searchQuery ? "No Matching Interviews" : "No Interview History"}
                    description={searchQuery ? "Try adjusting your search query" : "You haven't completed any interviews yet."}
                />
            )}
        </div>
    )
}
