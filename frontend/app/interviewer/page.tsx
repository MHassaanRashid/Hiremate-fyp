"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getInterviewerDashboard } from "@/lib/api/interviewer"
import type { InterviewerDashboardData } from "@/types/interviewer"
import {
  Video,
  Calendar,
  Star,
  CheckCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  CalendarDays
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import InterviewCard from "@/components/interviewer/InterviewCard"
import EmptyState from "@/components/interviewer/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"

export default function InterviewerDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<InterviewerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const token = localStorage.getItem('access_token')
        if (!token) throw new Error('No access token')

        const data = await getInterviewerDashboard(token)
        setDashboardData(data)
      } catch (err: any) {
        console.error('Error fetching dashboard:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchDashboard()
    }
  }, [user, authLoading])

  if (authLoading || (!user && isLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl p-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-600 mb-6 font-medium">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const statsCards = dashboardData ? [
    {
      title: "Total Interviews",
      value: dashboardData.stats.totalInterviews.toString(),
      change: "+12%",
      icon: Video,
      color: "from-blue-500 to-indigo-500",
      glowColor: "shadow-blue-500/30",
    },
    {
      title: "Upcoming",
      value: dashboardData.stats.upcomingInterviews.toString(),
      change: `+${dashboardData.stats.upcomingInterviews}`,
      icon: Calendar,
      color: "from-emerald-500 to-teal-500",
      glowColor: "shadow-emerald-500/30",
    },
    {
      title: "Average Rating",
      value: dashboardData.stats.averageRating.toFixed(1),
      change: "+0.2",
      icon: Star,
      color: "from-amber-400 to-orange-500",
      glowColor: "shadow-amber-500/30",
    },
    {
      title: "Pending Reviews",
      value: dashboardData.stats.pendingReviews.toString(),
      change: "-2",
      icon: CheckCircle,
      color: "from-purple-500 to-pink-500",
      glowColor: "shadow-purple-500/30",
    },
  ] : []

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Welcome back, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Here's your interview overview and daily tasks.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : dashboardData ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/90 backdrop-blur-xl border-indigo-100/50 hover:border-indigo-200/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-semibold">
                        {stat.title}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-3xl font-bold text-slate-900 mr-2">
                          {stat.value}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg ${stat.glowColor} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs">
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 font-medium">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </Badge>
                    <span className="text-slate-400 ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Interviews */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                  Upcoming Interviews
                </h2>
                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium" onClick={() => router.push('/interviewer/interviews')}>
                  View All
                </Button>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-indigo-100/50 rounded-2xl shadow-sm p-1">
                {dashboardData.upcomingInterviews.length > 0 ? (
                  <div className="space-y-2 p-4">
                    {dashboardData.upcomingInterviews.slice(0, 3).map((interview) => (
                      <InterviewCard
                        key={interview.id}
                        interview={interview}
                        onClick={() => router.push(`/interviewer/interviews/${interview.id}`)}
                        className="hover:bg-slate-50 border-slate-100 shadow-none hover:shadow-sm"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No Upcoming Interviews"
                    description="You don't have any interviews scheduled at the moment."
                  />
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Recent Activity
              </h2>
              <Card className="bg-white/80 backdrop-blur-xl border-indigo-100/50 shadow-sm p-4 h-full">
                <CardContent className="p-0">
                  <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {dashboardData.recentActivity.map((activity) => (
                      <div key={activity.id} className="relative pl-10">
                        <div className="absolute left-0 top-1.5 w-9 h-9 bg-white rounded-full border-4 border-indigo-50 flex items-center justify-center z-10">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                        </div>
                        <p className="font-medium text-slate-800 text-sm leading-snug">{activity.message}</p>
                        <p className="text-slate-400 text-xs mt-1.5 font-medium">
                          {new Date(activity.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                    {dashboardData.recentActivity.length === 0 && (
                      <div className="text-center py-10 text-slate-500 text-sm">No recent activity</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
