"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import CandidateLayout from "@/layouts/CandidateLayout"
import { getJobs, applyToJob, type Job } from "@/lib/api/jobs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { ApplicationDialog } from "@/components/candidate/ApplicationDialog"
import {
    Search,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Filter,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Sparkles,
    SlidersHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const JOB_TYPES = [
    { label: "All Types", value: "all" },
    { label: "Full-time", value: "full-time" },
    { label: "Part-time", value: "part-time" },
    { label: "Contract", value: "contract" },
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" }
]

export default function FindJobsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const { toast } = useToast()

    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Application Dialog State
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleApplyClick = (job: Job) => {
        setSelectedJob(job)
        setIsDialogOpen(true)
    }

    const handleConfirmApply = async (jobId: string, notes: string) => {
        const token = localStorage.getItem("access_token")
        if (!token) return

        try {
            await applyToJob(token, jobId, notes)
            toast({
                title: "Application Submitted!",
                description: "Good luck! The employer has received your application.",
                variant: "default", // or "success" if configured
            })
        } catch (err: any) {
            toast({
                title: "Application Failed",
                description: err.message || "Something went wrong.",
                variant: "destructive",
            })
            throw err // Re-throw to let dialog handle loading state if needed
        }
    }

    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [location, setLocation] = useState("")
    const [debouncedLocation, setDebouncedLocation] = useState("")
    const [jobType, setJobType] = useState("all")
    const [page, setPage] = useState(1)
    const pageSize = 12

    // Debounce inputs
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setDebouncedLocation(location)
        }, 500)
        return () => clearTimeout(t)
    }, [searchTerm, location])

    // Fetch jobs
    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return

            const token = localStorage.getItem("access_token")
            if (!token) {
                setError("Please login to find jobs")
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)
                const data = await getJobs(token, {
                    search: debouncedSearch,
                    location: debouncedLocation,
                    jobType: jobType === 'all' ? undefined : jobType,
                    page,
                    pageSize
                })
                setJobs(data || [])
            } catch (err: any) {
                console.error("Error fetching jobs:", err)
                setError("Failed to load jobs. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        if (!authLoading && user) {
            fetchJobs()
        }
    }, [user, authLoading, debouncedSearch, debouncedLocation, jobType, page])

    const handleClearFilters = () => {
        setSearchTerm("")
        setLocation("")
        setJobType("all")
        setPage(1)
    }

    const hasActiveFilters = useMemo(() => {
        return !!debouncedSearch || !!debouncedLocation || jobType !== "all"
    }, [debouncedSearch, debouncedLocation, jobType])

    if (authLoading || !user) {
        return (
            <CandidateLayout>
                <div className="min-h-screen bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                        <div className="space-y-6">
                            <Skeleton className="h-14 w-64 rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-2xl" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-72 w-full rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </CandidateLayout>
        )
    }

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
                {/* Hero Section */}
                <div className="bg-white border-b border-indigo-100/50 pb-8 pt-10 sticky top-0 z-30 shadow-sm/50 backdrop-blur-3xl bg-white/80 supports-[backdrop-filter]:bg-white/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                        {/* Title Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                    Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">Next Role</span>
                                </h1>
                                <p className="text-lg text-slate-500 font-medium max-w-2xl">
                                    Discover opportunities that match your skills, experience, and career goals.
                                </p>
                            </div>

                        </div>

                        {/* Search & Filters Bar */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200 p-2 md:p-3 flex flex-col md:flex-row items-center gap-3">
                            {/* Search Input */}
                            <div className="relative flex-1 w-full md:w-auto">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    className="pl-11 h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-base placeholder:text-slate-400 transition-all shadow-sm"
                                    placeholder="Search by job title, company, or keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Location Input */}
                            <div className="relative w-full md:w-72">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    className="pl-11 h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-base placeholder:text-slate-400 transition-all shadow-sm"
                                    placeholder="Location (e.g. Remote)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            {/* Divider for Desktop */}
                            <div className="hidden md:block h-8 w-px bg-slate-200 mx-1" />

                            {/* Job Type Select */}
                            <div className="w-full md:w-48">
                                <Select value={jobType} onValueChange={setJobType}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl text-base shadow-sm">
                                        <SelectValue placeholder="Job Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {JOB_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Clear Filters Button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    onClick={handleClearFilters}
                                    className="h-12 px-4 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium whitespace-nowrap"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Status/Loading/Result States */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-[320px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-24 w-full rounded-xl" />
                                    <div className="pt-4 flex items-center justify-between">
                                        <Skeleton className="h-10 w-28 rounded-xl" />
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl bg-red-50 border border-red-100 p-10 text-center">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h3 className="text-lg font-bold text-red-900 mb-2">Something went wrong</h3>
                            <p className="text-red-600 mb-6">{error}</p>
                            <Button onClick={() => window.location.reload()} variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50">
                                Try Again
                            </Button>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="rounded-3xl bg-white border border-dashed border-slate-300 p-16 text-center shadow-sm">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                We couldn't find any positions matching your current filters. Try adjusting your search criteria or clear all filters to see everything.
                            </p>
                            <Button
                                onClick={handleClearFilters}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-xl px-8 h-12 font-medium"
                            >
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-500" />
                                    Latest Opportunities <span className="text-slate-400 font-normal text-sm ml-2">({jobs.length} jobs)</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="group relative bg-white border border-slate-200 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full"
                                    >
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                    {job.company_logo ? (
                                                        <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        job.company_name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                        {job.job_title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="line-clamp-1">{job.company_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {job.posted_date && (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium hover:bg-slate-200 border-0">
                                                    {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true }).replace("about ", "")}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {job.job_type && (
                                                <Badge variant="outline" className="rounded-lg border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors px-2.5 py-1">
                                                    {job.job_type}
                                                </Badge>
                                            )}
                                            {job.location && (
                                                <Badge variant="outline" className="rounded-lg border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors px-2.5 py-1">
                                                    <MapPin className="w-3 h-3 mr-1.5 inline-block" />
                                                    {job.location}
                                                </Badge>
                                            )}
                                            {job.salary_range && (
                                                <Badge variant="outline" className="rounded-lg border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors px-2.5 py-1">
                                                    <DollarSign className="w-3 h-3 mr-1 inline-block" />
                                                    {job.salary_range}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex-1 mb-6">
                                            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                                                {job.description || "No description provided for this position."}
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-5 border-t border-slate-100 flex items-center gap-3">
                                            <Button
                                                onClick={() => handleApplyClick(job)}
                                                className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white shadow-lg shadow-slate-200 hover:shadow-indigo-200 rounded-xl h-11 font-medium transition-all group-hover:translate-y-[-2px]"
                                            >
                                                Apply Now
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50 transition-colors">
                                                <Sparkles className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ApplicationDialog
                    job={selectedJob}
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onConfirm={handleConfirmApply}
                />
            </div>
        </CandidateLayout>
    )
}
