"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import InterviewerLayout from "@/layouts/InterviewerLayout"
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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import InterviewCard from "@/components/interviewer/InterviewCard"
import EmptyState from "@/components/interviewer/EmptyState"

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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <InterviewerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </InterviewerLayout>
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
      color: "from-emerald-500 to-cyan-500",
      glowColor: "shadow-emerald-500/30",
    },
    {
      title: "Average Rating",
      value: dashboardData.stats.averageRating.toFixed(1),
      change: "+0.2",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      glowColor: "shadow-yellow-500/30",
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
    <InterviewerLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-slate-600 mt-1">Here's your interview overview</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-t-2 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-xl border-indigo-200/50 hover:border-indigo-300/50 transition-all duration-300 shadow-sm shadow-indigo-500/10"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">
                          {stat.title}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-2xl font-bold text-gray-800 mr-2">
                            {stat.value}
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 border-emerald-400/30 text-emerald-600 text-xs"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {stat.change}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg ${stat.glowColor}`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Interviews */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50 shadow-sm shadow-indigo-500/10">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                        Upcoming Interviews
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/interviewer/interviews')}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.upcomingInterviews.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.upcomingInterviews.slice(0, 3).map((interview) => (
                          <InterviewCard
                            key={interview.id}
                            interview={interview}
                            onClick={() => router.push(`/interviewer/interviews/${interview.id}`)}
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
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50 shadow-sm shadow-indigo-500/10">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-indigo-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentActivity.map((activity) => (
                        <div key={activity.id} className="text-sm">
                          <p className="font-medium text-gray-800">{activity.message}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </InterviewerLayout>
  )
}
