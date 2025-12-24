"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    Users,
    ChevronLeft,
    FileText,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    MessageSquare,
    X,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import CandidateProfileSheet from "@/components/company/CandidateProfileSheet"

interface Job {
    id: string
    job_title: string
    company_name: string
    location: string
    job_type: string
    posted_date: string
    description: string
    requirements: string[] | string
    salary_range: string
    applicants_count?: number
}

interface Application {
    id: string
    user_id: string
    status: string
    applied_date: string
    resume_url?: string
    candidate_name?: string
    candidate_email?: string
    candidate_phone?: string
    candidate_location?: string
    candidate_summary?: string
    candidate_skills?: any[]
    candidate_experience?: any[]
    candidate_education?: any[]
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [job, setJob] = useState<Job | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("applicants")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null)

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/auth?tab=login")
                return
            }
            fetchData()
        }
    }, [user, authLoading, params.id])

    const fetchData = async () => {
        try {
            setLoading(true)
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const token = localStorage.getItem("access_token")

            // Fetch Job Details
            const jobRes = await fetch(`${backend}/jobs/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!jobRes.ok) throw new Error("Failed to fetch job")
            const jobData = await jobRes.json()
            setJob(jobData)

            // Fetch Applications
            const appRes = await fetch(`${backend}/jobs/company/jobs/${params.id}/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (appRes.ok) {
                const appData = await appRes.json()
                setApplications(appData)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = () => {
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const res = await fetch(`${backend}/jobs/${params.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            })

            if (!res.ok) throw new Error("Failed to delete job")

            router.push("/company/jobs")
        } catch (err: any) {
            alert(err.message)
        } finally {
            setShowDeleteDialog(false)
        }
    }

    const handleStatusUpdate = async (applicationId: string, status: string) => {
        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const token = localStorage.getItem("access_token")

            const res = await fetch(`${backend}/jobs/applications/${applicationId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (!res.ok) throw new Error("Failed to update status")

            // Refresh applications list
            fetchData()
            setSelectedCandidate(null)
        } catch (err: any) {
            console.error(err)
            alert(err.message)
        }
    }

    const handleShortlist = (applicationId: string) => {
        handleStatusUpdate(applicationId, "shortlisted")
    }

    const handleReject = (applicationId: string) => {
        handleStatusUpdate(applicationId, "rejected")
    }

    if (loading || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="space-y-4 w-full max-w-4xl p-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    if (!job) return <div>Job not found</div>

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">

                <Button
                    variant="ghost"
                    className="pl-0 hover:bg-transparent hover:text-blue-600 mb-2"
                    onClick={() => router.push("/company/jobs")}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Jobs
                </Button>

                {/* Job Header Card */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 w-full"></div>
                    <CardHeader className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{job.job_title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                                    <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.job_type}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Posted {new Date(job.posted_date).toLocaleDateString()}</span>
                                    {job.salary_range && (
                                        <span className="flex items-center gap-1.5 font-medium text-green-600 px-2 py-0.5 bg-green-50 rounded-md">
                                            <DollarSign className="h-3.5 w-3.5" /> {job.salary_range}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={() => router.push(`/company/jobs/${job.id}/edit`)}>Edit Job</Button>
                                <Button variant="destructive" size="icon" className="w-10" onClick={handleDelete} title="Delete Job"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start h-12 bg-white border-b border-gray-200 rounded-none p-0 mb-6">
                        <TabsTrigger
                            value="applicants"
                            className="h-full px-6 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent font-medium"
                        >
                            Applicants <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">{applications.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="details"
                            className="h-full px-6 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent font-medium"
                        >
                            Job Details
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="applicants" className="mt-0">
                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-lg font-semibold">Candidates</CardTitle>
                                <CardDescription>Review and manage applications for this role.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {applications.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p>No applications yet.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow>
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Applied Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Match Score</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.map((app) => (
                                                <TableRow
                                                    key={app.id}
                                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedCandidate(app)}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                    {app.candidate_name ? app.candidate_name.charAt(0) : "C"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{app.candidate_name || `Candidate #${app.user_id.substring(0, 4)}`}</p>
                                                                <p className="text-xs text-blue-600 hover:underline">View Profile</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {new Date(app.applied_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`
                                                    capitalize
                                                    ${app.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                                                    ${app.status === 'shortlisted' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                    ${app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                `}>
                                                            {app.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-green-500 w-[70%]"></div>
                                                            </div>
                                                            <span className="text-xs font-medium text-green-600">70%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600">
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => setSelectedCandidate(app)}>View Profile</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleShortlist(app.id)}>Shortlist</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleReject(app.id)}>Reject</DropdownMenuItem>
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
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4">Description</h3>
                            <div className="prose text-slate-600 whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </Card>

                        <Card className="border-none shadow-sm bg-white p-6">
                            <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                            <div className="prose text-slate-600">
                                {Array.isArray(job.requirements) ? (
                                    <ul className="list-disc pl-5 space-y-2">
                                        {job.requirements.map((req, i) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="whitespace-pre-wrap">{job.requirements}</p>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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

                <CandidateProfileSheet
                    isOpen={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    candidate={selectedCandidate ? { ...selectedCandidate, application_id: selectedCandidate.id } : null}
                    onShortlist={handleShortlist}
                    onReject={handleReject}
                    jobId={params.id}
                />

            </div>
        </div>
    )
}
