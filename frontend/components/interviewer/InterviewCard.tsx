// Reusable interview card component
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Building2, Video, Bot } from "lucide-react"
import StatusBadge from "./StatusBadge"
import { cn } from "@/lib/utils"
import type { AssignedInterview } from "@/types/interviewer"

interface InterviewCardProps {
    interview: AssignedInterview
    onClick?: () => void
    className?: string
}

export default function InterviewCard({ interview, onClick, className }: InterviewCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
            .substring(0, 2)
    }

    const formatDate = (date: string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const formatTime = (time: string) => {
        return time
    }

    return (
        <Card
            className={cn(
                "bg-white/80 backdrop-blur-xl border-indigo-200/50 hover:border-indigo-300/50 transition-all duration-300 shadow-sm shadow-indigo-500/10 cursor-pointer hover:shadow-md hover:shadow-indigo-500/20",
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-indigo-100">
                        <AvatarImage src={interview.candidateAvatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold">
                            {getInitials(interview.candidateName)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <h4 className="font-semibold text-slate-900 truncate">
                                    {interview.candidateName}
                                </h4>
                                <p className="text-sm text-slate-600 truncate">
                                    {interview.position}
                                </p>
                            </div>
                            <StatusBadge status={interview.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>{interview.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(interview.scheduledDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatTime(interview.scheduledTime)} ({interview.duration} min)</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs",
                                    interview.type === 'live'
                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                        : "bg-purple-50 border-purple-300 text-purple-700"
                                )}
                            >
                                {interview.type === 'live' ? (
                                    <>
                                        <Video className="w-3 h-3 mr-1" />
                                        Live Interview
                                    </>
                                ) : (
                                    <>
                                        <Bot className="w-3 h-3 mr-1" />
                                        AI-Assisted
                                    </>
                                )}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
