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

            const res = await fetch(`${backend}/jobs/company/all-applications`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setApplications(data)
            } else {
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
        <div className="min-h-screen relative p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Candidates</h1>
                        <p className="text-slate-500 mt-2">Manage applications across all your active job postings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                                placeholder="Search by name or job..."
                                className="pl-9 w-64 border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm focus:border-blue-500 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-2 mb-4">
                            <TabsList className="bg-slate-100/50 p-1 rounded-xl h-auto">
                                {['all', 'pending', 'shortlisted', 'rejected'].map(tab => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className="rounded-lg px-4 py-2 text-sm font-medium capitalize data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                                    >
                                        {tab}
                                        {tab === 'all' && (
                                            <Badge className="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-300 border-none h-5 px-1.5 min-w-[1.25rem]">
                                                {applications.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <TabsContent value={activeTab} className="mt-0">
                            <div className="rounded-xl overflow-hidden border border-slate-100">
                                {filteredApplications.length === 0 ? (
                                    <div className="p-20 text-center flex flex-col items-center justify-center bg-white/50">
                                        <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300">
                                            <Users className="h-10 w-10 text-blue-500 opacity-50" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">No candidates found</h3>
                                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                                            {searchQuery ? "Try adjusting your search query." : "When candidates apply to your jobs, they'll appear here."}
                                        </p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow className="hover:bg-transparent border-slate-100">
                                                <TableHead className="py-4 font-semibold text-slate-600">Candidate</TableHead>
                                                <TableHead className="font-semibold text-slate-600">Job Role</TableHead>
                                                <TableHead className="font-semibold text-slate-600">Applied Date</TableHead>
                                                <TableHead className="font-semibold text-slate-600">Match Score</TableHead>
                                                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                                                <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-white/50">
                                            {filteredApplications.map((app) => (
                                                <TableRow key={app.id} className="hover:bg-blue-50/30 transition-all cursor-pointer border-slate-100" onClick={() => setSelectedCandidate(app)}>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
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
                                                            <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${(app.ai_score || 0) > 70 ? 'bg-emerald-500' :
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
                                                            capitalize px-2.5 py-0.5 border-none font-semibold shadow-sm
                                                            ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                                                            ${app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' : ''}
                                                            ${app.status === 'rejected' ? 'bg-rose-100 text-rose-700' : ''}
                                                        `}>
                                                            {app.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
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
                                                                    <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app.id, 'rejected'); }}>
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
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {selectedCandidate && (
                <CandidateProfileSheet
                    isOpen={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    candidate={{
                        ...selectedCandidate,
                        application_id: selectedCandidate.id
                    }}
                    onShortlist={(id) => handleStatusUpdate(id, 'shortlisted')}
                    onReject={(id) => handleStatusUpdate(id, 'rejected')}
                    jobId={selectedCandidate.job_id}
                />
            )}
        </div>
    )
}
