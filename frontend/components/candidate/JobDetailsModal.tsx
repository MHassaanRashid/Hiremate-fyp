"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Users,
    Building,
    Calendar,
    Award,
    CheckCircle2,
    Bookmark,
    BookmarkCheck,
    Share2,
    ExternalLink,
    Sparkles,
    TrendingUp,
} from "lucide-react"
import { Job } from "@/lib/api/jobs"
import { cn } from "@/lib/utils"

interface JobDetailsModalProps {
    job: Job | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onApply: (job: Job) => void
    isSaved: boolean
    onToggleSave: (jobId: string) => void
}

export function JobDetailsModal({
    job,
    open,
    onOpenChange,
    onApply,
    isSaved,
    onToggleSave,
}: JobDetailsModalProps) {
    if (!job) return null

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Posted today'
        if (diffDays === 1) return 'Posted yesterday'
        if (diffDays < 7) return `Posted ${diffDays} days ago`
        if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`
        return `Posted on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
                <ScrollArea className="max-h-[90vh]">
                    {/* Header Section */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
                                {job.company_name?.charAt(0) || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-bold truncate">{job.job_title}</h2>
                                    {job.is_featured && (
                                        <Badge className="bg-yellow-400 text-yellow-900 border-0">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-blue-100 text-lg mb-2">{job.company_name}</p>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <span className="flex items-center gap-1 text-blue-100">
                                        <MapPin className="w-4 h-4" />
                                        {job.location}
                                    </span>
                                    <span className="text-blue-200">•</span>
                                    <span className="flex items-center gap-1 text-blue-100">
                                        <Briefcase className="w-4 h-4" />
                                        {job.job_type}
                                    </span>
                                    {job.salary_range && (
                                        <>
                                            <span className="text-blue-200">•</span>
                                            <span className="flex items-center gap-1 text-blue-100">
                                                <DollarSign className="w-4 h-4" />
                                                {job.salary_range}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 border-b">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-medium">Posted</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                                {job.created_at ? formatDate(job.created_at) : 'Recently'}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-medium">Applicants</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">{job.applicants_count || 0}</p>
                        </div>
                        {job.experience_level && (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                                    <Award className="w-4 h-4" />
                                    <span className="text-xs font-medium">Experience</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-900">{job.experience_level}</p>
                            </div>
                        )}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-medium">Status</span>
                            </div>
                            <p className="text-sm font-semibold text-emerald-600">Actively Hiring</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 space-y-6">
                        {/* Job Description */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Building className="w-5 h-5 text-blue-600" />
                                Job Description
                            </h3>
                            <div className="prose prose-sm max-w-none text-slate-700">
                                <p className="whitespace-pre-line leading-relaxed">
                                    {job.description || 'No description available.'}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Requirements */}
                        {job.requirements && (
                            <>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        Requirements
                                    </h3>
                                    <div className="prose prose-sm max-w-none text-slate-700">
                                        <p className="whitespace-pre-line leading-relaxed">{job.requirements}</p>
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Required Skills */}
                        {job.required_skills && job.required_skills.length > 0 && (
                            <>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-600" />
                                        Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.required_skills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Benefits */}
                        {job.benefits && (
                            <>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-blue-600" />
                                        Benefits & Perks
                                    </h3>
                                    <div className="prose prose-sm max-w-none text-slate-700">
                                        <p className="whitespace-pre-line leading-relaxed">{job.benefits}</p>
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Company Info */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Building className="w-5 h-5 text-blue-600" />
                                About {job.company_name}
                            </h3>
                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        {job.company_name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{job.company_name}</p>
                                        <p className="text-sm text-slate-600">Technology Company</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    Join a dynamic team at {job.company_name} and work on cutting-edge projects that make a difference.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between gap-3">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleSave(job.id)}
                                className={cn(
                                    "gap-2",
                                    isSaved && "border-blue-600 text-blue-600"
                                )}
                            >
                                {isSaved ? (
                                    <>
                                        <BookmarkCheck className="w-4 h-4" />
                                        Saved
                                    </>
                                ) : (
                                    <>
                                        <Bookmark className="w-4 h-4" />
                                        Save Job
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>
                        </div>
                        <Button
                            onClick={() => {
                                onApply(job)
                                onOpenChange(false)
                            }}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 gap-2 font-semibold px-8"
                        >
                            Apply Now
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
