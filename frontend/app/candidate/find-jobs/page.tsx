"use client"

import { useState, useEffect, useRef } from "react"
import CandidateLayout from "@/layouts/CandidateLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    MapPin,
    Briefcase,
    DollarSign,
    Building,
    ChevronRight,
    Filter,
    Clock,
    Sparkles,
    ArrowUpRight,
    Loader2,
    TrendingUp,
    Users,
    Bookmark,
    BookmarkCheck,
    Calendar,
    Award,
    MoreHorizontal,
    Share2,
    ExternalLink,
    Zap,
} from "lucide-react"
import { getJobs, Job, applyToJob } from "@/lib/api/jobs"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { ApplicationDialog } from "@/components/candidate/ApplicationDialog"
import { cn } from "@/lib/utils"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { JobDetailsModal } from "@/components/candidate/JobDetailsModal"

export default function FindJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [location, setLocation] = useState("All Locations")
    const [type, setType] = useState("All Types")
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
    const [locationSearch, setLocationSearch] = useState("")


    // Prevent duplicate toasts
    const lastToastTime = useRef<number>(0)
    const isMounted = useRef(false)

    // Load saved jobs from localStorage on mount
    useEffect(() => {
        isMounted.current = true
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('savedJobs')
            if (saved) {
                setSavedJobs(new Set(JSON.parse(saved)))
            }
        }
        return () => {
            isMounted.current = false
        }
    }, [])

    const fetchJobs = async () => {
        if (!isMounted.current) return

        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                // Use locationSearch for city/area filtering
                // Use location for work mode filtering (Remote/On-site/Hybrid)
                const locationParam = locationSearch || (location !== "All Locations" ? location : undefined)
                const typeParam = type !== "All Types" ? type : undefined
                const data = await getJobs(session.access_token, search, locationParam, typeParam)
                console.log("Jobs fetched:", data)
                console.log("First job:", data[0])
                console.log("First job applicants_count:", data[0]?.applicants_count)
                if (isMounted.current) {
                    setJobs(data)
                }
            }
        } catch (error) {
            console.error("Error fetching jobs:", error)
            if (isMounted.current) {
                toast.error("Failed to load jobs")
            }
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }

    // Initial load
    useEffect(() => {
        fetchJobs()
    }, [])

    // Auto-search when filters change
    useEffect(() => {
        if (isMounted.current) {
            fetchJobs()
        }
    }, [location, type])

    const handleSearch = () => {
        fetchJobs()
    }

    const handleClearFilters = () => {
        setSearch("")
        setLocationSearch("")
        setLocation("All Locations")
        setType("All Types")
        // fetchJobs will be called automatically by the useEffect
    }

    const handleApplyClick = (job: Job) => {
        setSelectedJob(job)
        setIsDialogOpen(true)
    }

    const handleViewDetails = (job: Job) => {
        setSelectedJob(job)
        setIsDetailsModalOpen(true)
    }

    const handleConfirmApply = async (note?: string) => {
        if (!selectedJob) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error("Please log in to apply")
                return
            }

            await applyToJob(session.access_token, selectedJob.id, note)
            toast.success("Application submitted successfully!")
            setIsDialogOpen(false)
            setSelectedJob(null)
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application")
        }
    }

    const toggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        // Prevent duplicate calls within 300ms
        const now = Date.now()
        if (now - lastToastTime.current < 300) {
            return
        }
        lastToastTime.current = now

        // Check current state BEFORE updating
        const wasSaved = savedJobs.has(jobId)

        setSavedJobs(prev => {
            const newSet = new Set(prev)
            if (newSet.has(jobId)) {
                newSet.delete(jobId)
            } else {
                newSet.add(jobId)
            }
            // Save to localStorage
            localStorage.setItem('savedJobs', JSON.stringify(Array.from(newSet)))
            return newSet
        })

        // Show toast AFTER setState
        if (wasSaved) {
            toast.success("Job removed from saved")
        } else {
            toast.success("Job saved for later")
        }
    }

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8 relative">
                <AnimatedBackground />
                <div className="max-w-5xl mx-auto space-y-6 relative z-10">

                    {/* Clean Professional Header */}
                    <Card className="border-0 shadow-xl bg-white overflow-hidden">
                        <CardContent className="p-0">
                            {/* Header with Search */}
                            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-6 md:p-8">
                                <div className="mb-6">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        Find Your Next Opportunity
                                    </h1>
                                    <p className="text-blue-100">
                                        Discover jobs that match your skills and career goals
                                    </p>
                                </div>

                                {/* Search Bar */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            placeholder="Search by job title, keyword, or company..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-12 h-12 border-0 bg-white shadow-md text-base rounded-xl focus:ring-2 focus:ring-white/50"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSearch}
                                        className="bg-white hover:bg-blue-50 text-blue-600 h-12 px-8 rounded-xl shadow-lg font-semibold"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5 mr-2" />
                                                Search
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Filters Bar */}
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-slate-700">Filter by:</span>

                                    {/* City/Area Search */}
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="City or area..."
                                            value={locationSearch}
                                            onChange={(e) => setLocationSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-9 h-10 w-[180px] bg-white border-slate-200 rounded-lg focus:border-blue-400 text-sm"
                                        />
                                    </div>

                                    {/* Work Mode Filter */}
                                    <Select value={location} onValueChange={setLocation}>
                                        <SelectTrigger className="h-10 w-auto min-w-[140px] bg-white border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
                                            <Briefcase className="w-4 h-4 mr-2 text-slate-500" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Locations">All Modes</SelectItem>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                            <SelectItem value="On-site">On-site</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Job Type Filter */}
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger className="h-10 w-auto min-w-[140px] bg-white border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
                                            <Clock className="w-4 h-4 mr-2 text-slate-500" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Types">All Types</SelectItem>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {(location !== "All Locations" || type !== "All Types" || search || locationSearch) && (
                                        <Button
                                            onClick={handleClearFilters}
                                            variant="ghost"
                                            size="sm"
                                            className="h-10 px-4 text-slate-600 hover:bg-slate-100 rounded-lg"
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Results Summary */}
                            <div className="px-6 py-4 bg-white border-t border-slate-100">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-blue-600">{jobs.length}</span>
                                        <span className="text-base font-medium text-slate-700">
                                            {jobs.length === 1 ? 'job' : 'jobs'} available
                                        </span>
                                        {(locationSearch || location !== "All Locations" || type !== "All Types") && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {locationSearch && (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5">
                                                            📍 {locationSearch}
                                                        </Badge>
                                                    )}
                                                    {location !== "All Locations" && (
                                                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-0.5">
                                                            {location}
                                                        </Badge>
                                                    )}
                                                    {type !== "All Types" && (
                                                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-2.5 py-0.5">
                                                            {type}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {savedJobs.size > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <BookmarkCheck className="w-4 h-4 text-amber-600" />
                                            <span>{savedJobs.size} saved</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Feed */}
                    <div>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-56 bg-white border border-slate-200 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <Card className="border-0 shadow-lg bg-white">
                                <CardContent className="p-16 text-center">
                                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No jobs found</h3>
                                    <p className="text-sm text-slate-500 mb-4">Try different search criteria</p>
                                    <Button
                                        onClick={() => {
                                            setSearch("")
                                            setLocation("All Locations")
                                            setType("All Types")
                                            fetchJobs()
                                        }}
                                        size="sm"
                                        variant="outline"
                                    >
                                        Clear Filters
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {jobs.map((job) => (
                                    <CompactJobCard
                                        key={job.id}
                                        job={job}
                                        onApply={handleApplyClick}
                                        onViewDetails={handleViewDetails}
                                        isSaved={savedJobs.has(job.id)}
                                        onToggleSave={toggleSaveJob}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div> {/* Closes max-w-4xl mx-auto space-y-6 */}
            </div> {/* Closes min-h-screen bg-gradient-to-br ... */}

            {/* Application Dialog */}
            <ApplicationDialog
                job={selectedJob || { id: '', company_name: '', job_title: '', location: '', job_type: '' }}
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSelectedJob(null)
                }}
                onConfirm={handleConfirmApply}
            />

            {/* Job Details Modal */}
            <JobDetailsModal
                job={selectedJob}
                open={isDetailsModalOpen}
                onOpenChange={(open) => {
                    setIsDetailsModalOpen(open)
                    if (!open) setSelectedJob(null)
                }}
                onApply={handleApplyClick}
                isSaved={selectedJob ? savedJobs.has(selectedJob.id) : false}
                onToggleSave={toggleSaveJob}
            />
        </CandidateLayout>
    )
}

function CompactJobCard({ job, onApply, onViewDetails, isSaved, onToggleSave }: {
    job: Job;
    onApply: (job: Job) => void;
    onViewDetails: (job: Job) => void;
    isSaved: boolean;
    onToggleSave: (jobId: string, e?: React.MouseEvent) => void;
}) {
    return (
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white overflow-hidden group">
            {/* Compact Header */}
            <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Company Logo */}
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                            {job.company_name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-semibold text-slate-900 text-sm truncate">
                                    {job.company_name}
                                </h3>
                                {job.is_featured && (
                                    <Badge className="bg-blue-600 text-white border-0 text-xs px-1.5 py-0">
                                        <Sparkles className="w-2.5 h-2.5" />
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500">
                                {(job.posted_date || job.created_at) ? (() => {
                                    const date = new Date(job.posted_date || job.created_at!)
                                    const now = new Date()
                                    const diffMs = now.getTime() - date.getTime()
                                    const diffMins = Math.floor(diffMs / (1000 * 60))
                                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                                    const diffWeeks = Math.floor(diffDays / 7)
                                    const diffMonths = Math.floor(diffDays / 30)

                                    if (diffMins < 1) return 'Just now'
                                    if (diffMins < 60) return `${diffMins}m ago`
                                    if (diffHours < 24) return `${diffHours}h ago`
                                    if (diffDays === 1) return '1 day ago'
                                    if (diffDays < 7) return `${diffDays} days ago`
                                    if (diffWeeks === 1) return '1 week ago'
                                    if (diffWeeks < 4) return `${diffWeeks} weeks ago`
                                    if (diffMonths === 1) return '1 month ago'
                                    if (diffMonths < 12) return `${diffMonths} months ago`
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                })() : 'Recent'} • {job.applicants_count || 0} applicants
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => onToggleSave(job.id, e)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                    >
                        {isSaved ? (
                            <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
                        ) : (
                            <Bookmark className="w-5 h-5 text-slate-400" />
                        )}
                    </button>
                </div>
            </CardHeader>

            {/* Compact Content */}
            <CardContent className="pt-0 pb-4 px-5">
                {/* Job Title */}
                <h2 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {job.job_title}
                </h2>

                {/* Compact Info Pills */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-medium">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {job.job_type}
                    </Badge>
                    {job.salary_range && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {job.salary_range}
                        </Badge>
                    )}
                    {job.experience_level && (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-medium">
                            {job.experience_level}
                        </Badge>
                    )}
                </div>

                {/* Description */}
                {job.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {job.description}
                    </p>
                )}

                {/* Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {job.required_skills.slice(0, 5).map((skill, index) => (
                            <span
                                key={index}
                                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                        {job.required_skills.length > 5 && (
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                +{job.required_skills.length - 5}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Compact Footer */}
            <CardFooter className="border-t border-slate-100 pt-3 pb-3 px-5 flex items-center justify-between gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(job)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-4 font-medium"
                >
                    View Details
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-slate-900 h-8 px-3"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        onClick={() => onApply(job)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-5 font-semibold"
                    >
                        Apply Now
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
