"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Video,
  Calendar,
  Star,
  Users,
  Award,
  Menu,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const statsData = [
  {
    title: "Interviews Conducted",
    value: "47",
    change: "+12%",
    icon: Video,
    color: "from-blue-500 to-indigo-500",
    glowColor: "shadow-blue-500/30",
  },
  {
    title: "Upcoming Interviews",
    value: "8",
    change: "+3",
    icon: Calendar,
    color: "from-emerald-500 to-cyan-500",
    glowColor: "shadow-emerald-500/30",
  },
  {
    title: "Average Rating",
    value: "4.8",
    change: "+0.2",
    icon: Star,
    color: "from-yellow-500 to-orange-500",
    glowColor: "shadow-yellow-500/30",
  },
  {
    title: "This Month Earnings",
    value: "$2,340",
    change: "+15%",
    icon: Award,
    color: "from-purple-500 to-pink-500",
    glowColor: "shadow-purple-500/30",
  },
]

const upcomingInterviews = [
  {
    id: 1,
    candidate: "John Smith",
    position: "Frontend Developer",
    company: "Tech Corp",
    time: "2:00 PM",
    date: "Today",
    status: "scheduled",
  },
  {
    id: 2,
    candidate: "Sarah Johnson",
    position: "Backend Developer",
    company: "StartupXYZ",
    time: "4:30 PM",
    date: "Tomorrow",
    status: "scheduled",
  },
  {
    id: 3,
    candidate: "Mike Wilson",
    position: "Full Stack Developer",
    company: "BigTech Inc",
    time: "10:00 AM",
    date: "Dec 15",
    status: "scheduled",
  },
]

export default function InterviewerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/interviewer")
        return
      }
    }
  }, [user, isLoading, router])

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-blue-200/50 px-6 py-4 shadow-sm shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 text-gray-600 hover:text-gray-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Welcome, {user.full_name || user.email.split("@")[0]}!
                  </h1>
                  <p className="text-gray-600">Your interviewer dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(user.full_name || user.email || "U")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-sm shadow-blue-500/10"
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
                <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm shadow-blue-500/10">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                      Upcoming Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {interview.candidate}
                            </h4>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 border-blue-300 text-blue-700"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {interview.time}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">
                            {interview.position} at {interview.company}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {interview.date}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl">
                      <Calendar className="mr-2 h-4 w-4" />
                      View All Interviews
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm shadow-blue-500/10 mb-6">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl">
                        <Video className="mr-2 h-4 w-4" />
                        Start Interview
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl">
                        <FileText className="mr-2 h-4 w-4" />
                        View Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm shadow-blue-500/10">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">Interview Completed</p>
                        <p className="text-gray-600">Alice Brown - UI/UX Designer</p>
                        <p className="text-gray-500 text-xs">2 hours ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">Interview Scheduled</p>
                        <p className="text-gray-600">David Lee - Data Analyst</p>
                        <p className="text-gray-500 text-xs">4 hours ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">Report Submitted</p>
                        <p className="text-gray-600">Emma Wilson - Product Manager</p>
                        <p className="text-gray-500 text-xs">1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
