"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
    Briefcase,
    Plus,
    Search,
    MoreHorizontal,
    Users,
    Calendar,
    Eye,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MapPin,
    Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Job {
    id: string
    job_title: string
    company_name: string
    location: string
    job_type: string
    posted_date: string
    applicants_count?: number
    is_active?: boolean
}

export default function MyJobsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth?tab=login")
            return
        }

        if (user) {
            fetchJobs()
        }
    }, [user, authLoading, router])

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const backend = "/api"
            const res = await fetch(`${backend}/jobs/company/my-jobs`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            })

            if (!res.ok) {
                throw new Error("Failed to fetch jobs")
            }

            const data = await res.json()
            setJobs(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (id: string) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const backend = "/api"
            const res = await fetch(`${backend}/jobs/${deleteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            })

            if (!res.ok) throw new Error("Failed to delete job")

            setJobs(jobs.filter(j => j.id !== deleteId))
            setDeleteId(null)
        } catch (err: any) {
            setError(err.message)
            // Close dialog even on error to let user retry or see error
            setDeleteId(null)
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (authLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-900 relative">
            <AnimatedBackground />
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative z-10">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Job Listings</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your active job posts and track applicant status.</p>
                    </div>
                    <Button
                        onClick={() => router.push("/company/post-job")}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 h-12 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Post New Job
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900 rounded-xl">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="font-bold">Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardHeader className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-900">Active Listings</CardTitle>
                                <CardDescription className="text-slate-500">
                                    {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                                </CardDescription>
                            </div>
                        </div>

                        <div className="relative w-full max-w-sm group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search by title or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="space-y-4 p-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-xl" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="p-16 text-center text-slate-500">
                                <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
                                <p className="mb-8 max-w-sm mx-auto text-slate-500">You haven't posted any jobs yet, or no jobs matched your search criteria.</p>
                                {searchQuery === "" && (
                                    <Button onClick={() => router.push("/company/post-job")} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold">
                                        Create your first job listing
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[350px] font-bold text-slate-500 pl-8 py-5">Job Details</TableHead>
                                            <TableHead className="font-bold text-slate-500">Location</TableHead>
                                            <TableHead className="font-bold text-slate-500">Posted on</TableHead>
                                            <TableHead className="font-bold text-slate-500 text-center">Applicants</TableHead>
                                            <TableHead className="font-bold text-slate-500">Status</TableHead>
                                            <TableHead className="text-right font-bold text-slate-500 pr-8">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredJobs.map((job) => (
                                            <TableRow key={job.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => router.push(`/company/jobs/${job.id}`)}>
                                                <TableCell className="pl-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100">
                                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold rounded-lg">
                                                                {job.job_title.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.job_title}</span>
                                                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                                                <Building className="h-3 w-3" /> {user?.user_metadata?.cname || "Company"} • {job.job_type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                        {job.location}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        {new Date(job.posted_date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {job.applicants_count || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 font-bold">
                                                        Active
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                router.push(`/company/jobs/${job.id}`)
                                                            }}
                                                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100 p-1">
                                                                <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1.5">Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem className="rounded-lg font-medium cursor-pointer" onClick={() => router.push(`/company/jobs/${job.id}`)}>
                                                                    View Applicants
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-lg font-medium cursor-pointer" onClick={() => router.push(`/company/jobs/${job.id}/edit`)}>
                                                                    <Edit className="mr-2 h-4 w-4 text-slate-400" /> Edit Job
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                                                <DropdownMenuItem className="rounded-lg font-medium cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => handleDelete(job.id)}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Job Listing?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                                This action cannot be undone. This will permanently delete the job listing <span className="font-bold text-slate-900">{jobs.find(j => j.id === deleteId)?.job_title}</span> and all associated application data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200">
                                Delete Job
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
