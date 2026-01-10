"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, User, Building, Filter, Calendar, Briefcase, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem("access_token")
                const response = await fetch(`/api/admin/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setApplications(data)
                }
            } catch (error) {
                console.error("Failed to fetch applications", error)
                toast.error("Failed to load applications")
            } finally {
                setLoading(false)
            }
        }
        fetchApplications()
    }, [])

    const filteredApps = applications.filter(app =>
        app.candidate?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
        app.job?.company_name?.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'accepted':
            case 'hired': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
            case 'interviewing': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-slate-100 text-slate-800 border-slate-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="w-3 h-3 mr-1" />
            case 'accepted':
            case 'hired': return <CheckCircle2 className="w-3 h-3 mr-1" />
            case 'rejected': return <XCircle className="w-3 h-3 mr-1" />
            case 'interviewing': return <Calendar className="w-3 h-3 mr-1" />
            default: return null
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Applications</h1>
                    <p className="text-slate-500 mt-1">Track and manage candidate applications across the platform.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-500/20">
                        <FileText className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            <Card className="border shadow-lg shadow-slate-200/50 bg-white/50 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-slate-900">Application History</CardTitle>
                            <CardDescription>View latest applications and their status.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Search candidate, job, or company..."
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
                                <TableHead>Job Role</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-500">
                                            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                                            Loading applications...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredApps.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center text-slate-500">
                                        No applications found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApps.map((app) => (
                                    <TableRow key={app.id} className="hover:bg-slate-50/80 border-slate-100 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-white shadow-sm">
                                                    {app.candidate?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm">{app.candidate?.full_name || "Unknown"}</div>
                                                    <div className="text-xs text-slate-500">{app.candidate?.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="font-medium text-slate-900 text-sm">{app.job?.title}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-sm">{app.job?.company_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-xs font-medium">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {new Date(app.applied_at).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusColor(app.status)} shadow-none border px-2.5 py-0.5 pointer-events-none`}>
                                                {getStatusIcon(app.status)}
                                                <span className="capitalize">{app.status}</span>
                                            </Badge>
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
