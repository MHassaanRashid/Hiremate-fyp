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
    Trash2,
    Sparkles,
    Calendar,
    ArrowLeft
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
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

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
    ai_score?: number
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
            <div className="flex h-screen items-center justify-center bg-blue-50/30">
                <div className="space-y-6 w-full max-w-4xl p-6">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        )
    }

    if (!job) return <div>Job not found</div>

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-900 relative">
            <AnimatedBackground />
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative z-10">

                <div className="flex items-center gap-2 mb-4">
                    <Button
                        variant="ghost"
                        className="pl-0 hover:bg-transparent hover:text-blue-600 font-medium text-slate-500 transition-colors"
                        onClick={() => router.push("/company/jobs")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                    </Button>
                </div>

                {/* Job Header Card */}
                <Card className="border-0 shadow-xl bg-white overflow-hidden rounded-2xl">
                    <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Briefcase className="w-32 h-32 text-white" />
                        </div>
                    </div>
                    <CardHeader className="p-8 -mt-16 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 text-sm font-bold">
                                        {job.job_type}
                                    </Badge>
                                    <Badge variant="outline" className="border-slate-200 text-slate-600 px-3 py-1 flex items-center gap-1.5 font-medium">
                                        <Clock className="w-3.5 h-3.5" /> Posted {new Date(job.posted_date).toLocaleDateString()}
                                    </Badge>
                                    {job.salary_range && (
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 px-3 py-1 flex items-center gap-1.5 font-bold">
                                            <DollarSign className="w-3.5 h-3.5" /> {job.salary_range}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 mb-2">{job.job_title}</h1>
                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    {job.location}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 md:pt-16">
                                <Button variant="outline" onClick={() => router.push(`/company/jobs/${job.id}/edit`)} className="h-12 border-slate-200 font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all rounded-xl shadow-sm">
                                    Edit Job
                                </Button>
                                <Button variant="destructive" size="icon" className="h-12 w-12 rounded-xl shadow-sm hover:shadow-red-200 transition-all" onClick={handleDelete} title="Delete Job">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-slate-200/50 h-auto shadow-sm w-full md:w-auto inline-flex">
                        <TabsTrigger
                            value="applicants"
                            className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                        >
                            Applicants <Badge className="ml-2 bg-slate-100 text-slate-600 hover:bg-slate-100 border-0">{applications.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="details"
                            className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                        >
                            Job Details
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="applicants" className="mt-0">
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-0">
                                {applications.length === 0 ? (
                                    <div className="p-20 text-center flex flex-col items-center justify-center">
                                        <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                            <Users className="h-10 w-10 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
                                        <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                                            Candidates who apply to this role will be listed here.
                                        </p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="pl-8 py-5 font-bold text-slate-500">Candidate</TableHead>
                                                <TableHead className="font-bold text-slate-500">Applied Date</TableHead>
                                                <TableHead className="font-bold text-slate-500">Status</TableHead>
                                                <TableHead className="font-bold text-slate-500">Match Score</TableHead>
                                                <TableHead className="text-right pr-8 font-bold text-slate-500">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.map((app) => (
                                                <TableRow
                                                    key={app.id}
                                                    className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                                                    onClick={() => setSelectedCandidate(app)}
                                                >
                                                    <TableCell className="pl-8 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold">
                                                                    {app.candidate_name ? app.candidate_name.charAt(0) : "C"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{app.candidate_name || `Candidate #${app.user_id.substring(0, 4)}`}</p>
                                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                                                                    View Profile
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 font-medium">
                                                        {new Date(app.applied_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`
                                                            capitalize px-2.5 py-1 border-none font-bold shadow-sm
                                                            ${app.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' : ''}
                                                            ${app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : ''}
                                                            ${app.status === 'rejected' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' : ''}
                                                        `}>
                                                            {app.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {app.ai_score ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${app.ai_score > 80 ? 'bg-emerald-500' :
                                                                                app.ai_score > 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                                            }`}
                                                                        style={{ width: `${app.ai_score}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`text-xs font-bold ${app.ai_score > 80 ? 'text-emerald-600' :
                                                                        app.ai_score > 50 ? 'text-amber-600' : 'text-rose-600'
                                                                    }`}>{app.ai_score}%</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Processing</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    window.location.href = `mailto:${app.candidate_email}`
                                                                }}
                                                                className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Send Email"
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 p-1">
                                                                    <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1.5">Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem className="rounded-lg font-medium cursor-pointer py-2 focus:bg-blue-50 focus:text-blue-700" onClick={() => setSelectedCandidate(app)}>
                                                                        View Profile
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator className="bg-slate-100 my-1" />

                                                                    <DropdownMenuItem className="rounded-lg font-medium cursor-pointer py-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700" onClick={() => handleShortlist(app.id)}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Shortlist
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="rounded-lg font-medium cursor-pointer py-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700" onClick={() => handleReject(app.id)}>
                                                                        <XCircle className="mr-2 h-4 w-4" /> Reject
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
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 space-y-6">
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-white/50">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Job Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                                    {job.description || "No description provided."}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-white/50">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-500" />
                                    Key Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                                    {Array.isArray(job.requirements) ? (
                                        <ul className="list-none pl-0 space-y-3">
                                            {job.requirements.map((req, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <div className="min-w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shadow-sm" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{job.requirements || "No specific requirements listed."}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                                This action cannot be undone. This will permanently delete the job listing and all associated application data.
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
