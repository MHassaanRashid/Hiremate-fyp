"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Users,
  Briefcase,
  Star,
  TrendingUp,
  FileText,
  Clock,
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  Calendar,
  Sparkles,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardStats {
  total_jobs: number
  total_applications: number
  shortlisted: number
}

interface RecentApplication {
  id: string
  job_title: string
  status: string
  applied_date: string
  candidate: {
    name: string
    email: string
    avatar: string | null
  }
}

interface DashboardData {
  stats: DashboardStats
  recent_applications: RecentApplication[]
}

export default function RecruiterDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth?tab=login")
        return
      }

      const fetchDashboardData = async () => {
        try {
          const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
          const res = await fetch(`${backend}/dashboard/company`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })

          if (!res.ok) throw new Error("Failed to fetch dashboard data")
          const data = await res.json()
          setDashboardData(data)
        } catch (err) {
          console.error("Error fetching dashboard data:", err)
        } finally {
          setLoading(false)
        }
      }

      fetchDashboardData()
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <Skeleton className="h-4/5 w-4/5 rounded-2xl" />
      </div>
    )
  }

  const stats = dashboardData?.stats || { total_jobs: 0, total_applications: 0, shortlisted: 0 }
  const recentApps = dashboardData?.recent_applications || []

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200/60 px-8 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Recruiter Dashboard <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Welcome back, {user?.full_name || 'Hiring Manager'}. Here's what's happening with your job postings.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/company/post-job")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Briefcase className="mr-2 h-5 w-5" /> Post New Job
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total Jobs */}
          <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-1.5 bg-blue-500 w-full"></div>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Jobs</p>
                  <h2 className="text-4xl font-black text-slate-900">{stats.total_jobs}</h2>
                </div>
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Briefcase className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                <TrendingUp className="h-3 w-3 mr-1" /> +2 this month
              </div>
            </CardContent>
          </Card>

          {/* Total Candidates */}
          <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-1.5 bg-purple-500 w-full"></div>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Candidates</p>
                  <h2 className="text-4xl font-black text-slate-900">{stats.total_applications}</h2>
                </div>
                <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                  <Users className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                <TrendingUp className="h-3 w-3 mr-1" /> +24% vs last week
              </div>
            </CardContent>
          </Card>

          {/* Shortlisted */}
          <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-1.5 bg-amber-500 w-full"></div>
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Shortlisted</p>
                  <h2 className="text-4xl font-black text-slate-900">{stats.shortlisted}</h2>
                </div>
                <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <Star className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                <TrendingUp className="h-3 w-3 mr-1" /> High conversion rate
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Recent Applications */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100 flex flex-row items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Recent Applications</CardTitle>
                  <CardDescription>Track your newest incoming talent.</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  className="text-blue-600 font-bold hover:bg-blue-50"
                  onClick={() => router.push("/company/candidates")}
                >
                  View All Candidates <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {recentApps.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="px-8 font-bold text-slate-500 py-4">Candidate</TableHead>
                        <TableHead className="font-bold text-slate-500">Job Role</TableHead>
                        <TableHead className="font-bold text-slate-500">Status</TableHead>
                        <TableHead className="text-right px-8 font-bold text-slate-500">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentApps.map((app) => (
                        <TableRow key={app.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 ring-2 ring-slate-100 ring-offset-2">
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                  {app.candidate.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{app.candidate.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{app.candidate.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{app.job_title}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`
                              capitalize border-none px-3 py-1 font-bold
                              ${app.status === 'pending' ? 'bg-amber-50 text-amber-600' : ''}
                              ${app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600' : ''}
                              ${app.status === 'rejected' ? 'bg-rose-50 text-rose-600' : ''}
                            `}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                              onClick={() => router.push("/company/candidates")}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-20 text-center">
                    <div className="mx-auto bg-slate-50 rounded-full h-20 w-20 flex items-center justify-center mb-6 text-slate-300">
                      <Users className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">When candidates apply to your jobs, they'll appear here automatically.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Quick Insights */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-blue-600 text-white overflow-hidden relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="h-32 w-32 -mr-16 -mt-16" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight">Recruitment Tip ✨</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-blue-100 text-sm leading-relaxed">Companies that respond to applicants within 24 hours have a 60% higher hire rate. Check your pending inbox!</p>
                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold" onClick={() => router.push("/company/candidates")}>Go to Candidates</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" /> Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Review 4 Applicants</p>
                    <p className="text-xs text-slate-500 font-medium">Software Engineer position</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">3 Interviews Today</p>
                    <p className="text-xs text-slate-500 font-medium">Next: 2:00 PM with Sarah</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}
