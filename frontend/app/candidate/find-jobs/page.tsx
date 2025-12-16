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
import { Search, MapPin, Briefcase, DollarSign, Building } from "lucide-react"
import { getJobs, Job, applyToJob } from "@/lib/api/jobs"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { ApplicationDialog } from "@/components/candidate/ApplicationDialog"

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
        } catch (error: any) {
            console.error("Application error:", error)
            toast.error(error.message || "Failed to apply")
            throw error // Propagate to dialog to handle state
        }
    }

    return (
        <CandidateLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Find Your Dream Job
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Browse thousands of job openings tailored to your skills.
                        </p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-card p-4 rounded-xl shadow-sm border space-y-4 md:space-y-0 md:flex md:gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by job title or company..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Location" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Locations">All Locations</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="New York, NY">New York, NY</SelectItem>
                            <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                            <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Job Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Types">All Types</SelectItem>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} className="w-full md:w-auto">
                        Search Jobs
                    </Button>
                </div>

                {/* Job List */}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No jobs found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => (
                            <Card key={job.id} className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-blue-600 cursor-pointer" onClick={() => handleApplyClick(job)}>
                                <CardHeader className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {job.logo_url ? (
                                                <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-contain" />
                                            ) : (
                                                <Building className="h-6 w-6 text-gray-500" />
                                            )}
                                        </div>
                                        <Badge variant="secondary">{job.job_type}</Badge>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-1">{job.job_title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1 transition-colors group-hover:text-blue-500">
                                            <Building className="h-3 w-3" /> {job.company_name}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {job.location}
                                        </div>
                                        {job.salary_range && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {job.salary_range}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {job.description}
                                    </p>
                                    {job.requirements && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {job.requirements.slice(0, 3).map((req, i) => (
                                                <Badge key={i} variant="outline" className="text-xs bg-slate-50">{req}</Badge>
                                            ))}
                                            {job.requirements.length > 3 && (
                                                <Badge variant="outline" className="text-xs bg-slate-50">+{job.requirements.length - 3}</Badge>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full group-hover:bg-blue-600">Apply Now</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {selectedJob && (
                <ApplicationDialog
                    job={selectedJob}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onConfirm={handleConfirmApply}
                />
            )}
        </CandidateLayout>
    )
}
