"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    CalendarClock,
    Mail,
    Phone,
    Briefcase,
    TrendingUp,
    FileText,
    Brain,
    Eye
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
import CandidateProfileSheet from "@/components/company/CandidateProfileSheet"

interface Application {
    id: string
    user_id: string
    status: string
    applied_date: string
    job_title: string
    candidate_name?: string
    candidate_email?: string
    candidate_phone?: string
    candidate_location?: string
    ai_score?: number
    job_id: string
}

export default function CandidatesPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null)
    const [activeTab, setActiveTab] = useState("all")

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/auth?tab=login")
                return
            }
            fetchApplications()
        }
    }, [user, authLoading])

    const fetchApplications = async () => {
        try {
            setLoading(true)
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const token = localStorage.getItem("access_token")

            // We use the dashboard's "recent applications" endpoint or a dedicated one if it existed.
            // For now, let's fetch from the generic company dashboard and then filter, or better, 
            // many company applications across all jobs.
            const res = await fetch(`${backend}/jobs/company/all-applications`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setApplications(data)
            } else {
                // Fallback if the endpoint is not ready
                console.warn("Using empty list as fallback")
                setApplications([])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
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
            fetchApplications()
            setSelectedCandidate(null)
        } catch (err: any) {
            console.error(err)
        }
    }

    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            (app.candidate_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (app.job_title?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        if (activeTab === "all") return matchesSearch;
        return matchesSearch && app.status === activeTab;
    });

    if (loading || authLoading) {
        return (
            <div className="p-6 md:p-10 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Candidates</h1>
                        <p className="text-slate-500 mt-2">Manage applications across all your active job postings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or job..."
                                className="pl-9 w-64 border-slate-200 bg-white shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200">
                        <TabsList className="bg-transparent h-12 rounded-none p-0 gap-8">
                            <TabsTrigger value="all" className="h-full px-2 rounded-none bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-semibold transition-all">
                                All Candidates <Badge className="ml-2 bg-slate-100 text-slate-600 hover:bg-slate-100">{applications.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="h-full px-2 rounded-none bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-semibold transition-all text-slate-500">
                                Pending
                            </TabsTrigger>
                            <TabsTrigger value="shortlisted" className="h-full px-2 rounded-none bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-semibold transition-all text-slate-500">
                                Shortlisted
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="h-full px-2 rounded-none bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none font-semibold transition-all text-slate-500">
                                Rejected
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value={activeTab} className="mt-6">
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardContent className="p-0">
                                {filteredApplications.length === 0 ? (
                                    <div className="p-20 text-center flex flex-col items-center justify-center">
                                        <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                            <Users className="h-10 w-10 text-blue-500 opacity-50" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">No candidates found</h3>
                                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                                            {searchQuery ? "Try adjusting your search query." : "When candidates apply to your jobs, they'll appear here."}
                                        </p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="py-4">Candidate</TableHead>
                                                <TableHead>Job Role</TableHead>
                                                <TableHead>Applied Date</TableHead>
                                                <TableHead>Match Score</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredApplications.map((app) => (
                                                <TableRow key={app.id} className="hover:bg-blue-50/20 transition-all cursor-pointer" onClick={() => setSelectedCandidate(app)}>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                                                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                                    {app.candidate_name?.charAt(0) || "C"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">{app.candidate_name || "Unknown Candidate"}</p>
                                                                <p className="text-xs text-slate-500">{app.candidate_email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="text-sm font-medium text-slate-700">{app.job_title}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-500">
                                                        {new Date(app.applied_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-12 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${(app.ai_score || 0) > 70 ? 'bg-emerald-500' :
                                                                            (app.ai_score || 0) > 40 ? 'bg-amber-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${app.ai_score || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700">{app.ai_score || 0}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`
                                                            capitalize px-2 py-0.5 border-none font-bold
                                                            ${app.status === 'pending' ? 'bg-amber-50 text-amber-700' : ''}
                                                            ${app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700' : ''}
                                                            ${app.status === 'rejected' ? 'bg-rose-50 text-rose-700' : ''}
                                                        `}>
                                                            {app.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuLabel>Candidate Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedCandidate(app); }}>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Full Profile
                                                                </DropdownMenuItem>
                                                                {app.status !== 'shortlisted' && (
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app.id, 'shortlisted'); }}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Shortlist
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {app.status !== 'rejected' && (
                                                                    <DropdownMenuItem className="text-rose-600" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app.id, 'rejected'); }}>
                                                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem>
                                                                    <Mail className="mr-2 h-4 w-4" /> Send Email
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {selectedCandidate && (
                <CandidateProfileSheet
                    isOpen={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    candidate={{
                        ...selectedCandidate,
                        application_id: selectedCandidate.id
                    }}
                    onShortlist={handleShortlist}
                    onReject={handleStatusUpdate}
                    jobId={selectedCandidate.job_id}
                />
            )}
        </div>
    )
}
