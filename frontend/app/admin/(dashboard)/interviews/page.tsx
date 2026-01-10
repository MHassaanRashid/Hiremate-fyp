"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Video, CheckCircle, Clock, Filter, AlertCircle, Building, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AdminInterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchInterviews()
    }, [])

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem("access_token")
            const response = await fetch(`/api/admin/interviews`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setInterviews(data)
            }
        } catch (error) {
            console.error("Failed to fetch interviews", error)
            toast.error("Failed to load interviews")
        } finally {
            setLoading(false)
        }
    }

    const filteredInterviews = interviews.filter((int: any) =>
        (int.candidate?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (int.interviewer?.full_name || int.interviewer_email || "").toLowerCase().includes(search.toLowerCase()) ||
        (int.job_title || "").toLowerCase().includes(search.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 shadow-sm"><CheckCircle className="w-3 h-3 mr-1.5" /> Completed</Badge>
            case 'scheduled': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1 shadow-sm"><Calendar className="w-3 h-3 mr-1.5" /> Scheduled</Badge>
            case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1 shadow-sm"><AlertCircle className="w-3 h-3 mr-1.5" /> Cancelled</Badge>
            default: return <Badge variant="outline" className="text-slate-500 capitalize px-3 py-1">{status || 'Pending'}</Badge>
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Global Interviews</h1>
                    <p className="text-slate-500 mt-1">Oversee all interview sessions, schedules, and outcomes.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-500/20">
                        <Calendar className="w-4 h-4" /> Schedule New
                    </Button>
                </div>
            </div>

            <Card className="border shadow-lg shadow-slate-200/50 bg-white/50 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-slate-900">All Interviews</CardTitle>
                            <CardDescription>A complete log of past and upcoming interviews.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Search candidate, interviewer..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="pl-6">Candidate</TableHead>
                                <TableHead>Interviewer</TableHead>
                                <TableHead>Role & Company</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                                            Loading interviews...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredInterviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center text-slate-500">
                                        No interviews found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInterviews.map((int: any) => (
                                    <TableRow key={int.id} className="hover:bg-slate-50/80 border-slate-100 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {int.candidate?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm">{int.candidate?.full_name || "Unknown Candidate"}</div>
                                                    <div className="text-xs text-slate-500">{int.candidate?.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs">
                                                    {int.interviewer?.full_name?.charAt(0) || <Video className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 text-sm">{int.interviewer?.full_name || int.interviewer_email}</div>
                                                    <div className="text-xs text-slate-500">Interviewer</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 text-sm flex items-center gap-1.5">
                                                    {int.job_title}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Building className="w-3 h-3" /> {int.company_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 w-fit">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {int.scheduled_at ? new Date(int.scheduled_at).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                }) : 'Not scheduled'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(int.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
