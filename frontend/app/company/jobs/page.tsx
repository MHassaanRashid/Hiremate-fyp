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
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
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
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
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
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Jobs</h1>
                        <p className="text-slate-500">Manage your job postings and view applicants.</p>
                    </div>
                    <Button
                        onClick={() => router.push("/company/post-job")}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Post New Job
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="p-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-blue-500" />
                                Active Listings
                            </CardTitle>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search jobs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="space-y-4 p-6">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
                                <p className="mb-6">You haven't posted any jobs yet, or no jobs matched your search.</p>
                                {searchQuery === "" && (
                                    <Button onClick={() => router.push("/company/post-job")} variant="outline">Create your first job</Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[300px]">Job Title</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Posted Date</TableHead>
                                        <TableHead>Applicants</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredJobs.map((job) => (
                                        <TableRow key={job.id} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell className="font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-semibold">{job.job_title}</span>
                                                    <span className="text-xs text-gray-500">{job.job_type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{job.location}</TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {new Date(job.posted_date).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">{job.applicants_count || 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/company/jobs/${job.id}`)}
                                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => router.push(`/company/jobs/${job.id}`)}>
                                                                View Applicants
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/company/jobs/${job.id}/edit`)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Job
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(job.id)}>
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
                        )}
                    </CardContent>
                </Card>

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the job listing and all associated application data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Delete Job
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
