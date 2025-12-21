"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { getJobs, Job, applyToJob } from "@/lib/api/jobs"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { ApplicationDialog } from "@/components/candidate/ApplicationDialog"
import { cn } from "@/lib/utils"

export default function FindJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [location, setLocation] = useState("All Locations")
    const [type, setType] = useState("All Types")
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const fetchJobs = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const data = await getJobs(session.access_token, search, location, type)
                setJobs(data)
            }
        } catch (error) {
            console.error("Error fetching jobs:", error)
            toast.error("Failed to load jobs")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleSearch = () => {
        fetchJobs()
    }

    const handleApplyClick = (job: Job) => {
        setSelectedJob(job)
        setIsDialogOpen(true)
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

    return (
        <CandidateLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                            Discover Your Next Opportunity
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Browse {jobs.length} open positions from top companies
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <Card className="border-0 shadow-lg bg-white">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-5">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            placeholder="Job title, keywords, or company"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-12 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <Select value={location} onValueChange={setLocation}>
                                        <SelectTrigger className="h-12 border-slate-200">
                                            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Locations">All Locations</SelectItem>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                            <SelectItem value="New York">New York</SelectItem>
                                            <SelectItem value="San Francisco">San Francisco</SelectItem>
                                            <SelectItem value="London">London</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger className="h-12 border-slate-200">
                                            <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
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
                                </div>
                                <div className="md:col-span-2">
                                    <Button
                                        onClick={handleSearch}
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <Card className="border-0 shadow-lg bg-white">
                            <CardContent className="p-12 text-center">
                                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs found</h3>
                                <p className="text-slate-500">Try adjusting your search criteria</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {jobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onApply={handleApplyClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>


            <ApplicationDialog
                job={selectedJob || { id: '', company_name: '', job_title: '', location: '', job_type: '' }}
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setSelectedJob(null)
                }}
                onConfirm={handleConfirmApply}
            />
        </CandidateLayout>
    )
}

function JobCard({ job, onApply }: { job: Job; onApply: (job: Job) => void }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Card
            className="border-0 shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                            {job.company_name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                                {job.job_title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-slate-600">
                                <Building className="w-4 h-4" />
                                {job.company_name}
                            </CardDescription>
                        </div>
                    </div>
                    {job.is_featured && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{job.job_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{job.salary_range || 'Competitive'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span>{job.experience_level || 'All levels'}</span>
                    </div>
                </div>

                {job.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                        {job.description}
                    </p>
                )}

                {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {job.required_skills.slice(0, 4).map((skill, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="bg-slate-50 text-slate-700 border-slate-200"
                            >
                                {skill}
                            </Badge>
                        ))}
                        {job.required_skills.length > 4 && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                                +{job.required_skills.length - 4} more
                            </Badge>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                        Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                    {job.applicants_count !== undefined && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {job.applicants_count} applicants
                        </span>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
                <Button
                    onClick={() => onApply(job)}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 group-hover:shadow-xl group-hover:shadow-blue-600/40 transition-all"
                >
                    Apply Now
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    )
}
