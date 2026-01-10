"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Search, Briefcase, Building, MapPin } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const router = useRouter()

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem("access_token")
            const response = await fetch(`/api/admin/jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setJobs(data)
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error)
            toast.error("Failed to load jobs")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return

        try {
            const token = localStorage.getItem("access_token")
            const response = await fetch(`/api/admin/jobs/${jobId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.ok) {
                toast.success("Job deleted successfully")
                setJobs(jobs.filter(j => j.id !== jobId))
            } else {
                throw new Error("Failed to delete")
            }
        } catch (error) {
            toast.error("Failed to delete job")
        }
    }

    const filteredJobs = jobs.filter(job =>
        (job.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (job.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (job.company_name || "").toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* ... Header remains same ... */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Global Jobs</h1>
                    <p className="text-slate-500 mt-1">Monitor and manage all job postings across the platform</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search jobs, companies..."
                        className="pl-10 bg-white border-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-slate-500">Loading jobs...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow>
                                    <TableHead className="pl-6">Job Role</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Posted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                            No jobs found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <TableRow key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6 py-4">
                                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                                    {job.title}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">{job.job_type} • {job.experience_level}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                                                        {(job.company_name?.[0] || job.profiles?.full_name?.[0] || "C").toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 text-sm">{job.company_name || "Unknown Company"}</div>
                                                        <div className="text-xs text-slate-500">by {job.profiles?.full_name || "Recruiter"}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {job.location}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${job.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {job.status || 'Active'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteJob(job.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
