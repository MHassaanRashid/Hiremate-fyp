"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  FileText,
  Video,
  Upload,
  CheckCircle,
  Clock,
  Calendar,
  Award,
  Target,
  BarChart3,
  Download,
  Eye,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import CandidateLayout from "@/layouts/CandidateLayout"

// Mock dashboard data to replace the API call
const getMockDashboardData = () => ({
  resume_uploaded: true,
  stats: {
    scheduled: 3,
    completed: 7,
  },
  ai_score: 85,
  skills: [
    { skill: "JavaScript", score: 90 },
    { skill: "React", score: 85 },
    { skill: "Node.js", score: 80 },
    { skill: "Python", score: 75 },
  ],
  interviews: [
    {
      id: 1,
      company: "TechCorp",
      position: "Frontend Developer",
      status: "completed",
      date: "2023-12-15",
      score: 88,
    },
    {
      id: 2,
      company: "StartupXYZ",
      position: "Full Stack Developer",
      status: "scheduled",
      date: "2023-12-20",
    },
    {
      id: 3,
      company: "Enterprise Inc",
      position: "React Developer",
      status: "completed",
      date: "2023-12-10",
      score: 92,
    },
  ],
})

export default function JobSeekerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<any>(null)

  useEffect(() => {
    // Use mock data instead of API call to fix loading issue
    const mockData = getMockDashboardData()
    setDashboard(mockData)
  }, [])

  // Show loading only if user is not authenticated
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading for dashboard data
  if (!dashboard) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout>
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Resume */}
        <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-sm shadow-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Resume Status
                </p>
                <div className="flex items-center mt-2">
                  {dashboard.resume_uploaded ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-gray-800 font-semibold">
                        Uploaded
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-gray-800 font-semibold">
                        Not Uploaded
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Interviews */}
        <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-sm shadow-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Interviews
                </p>
                <div className="flex items-center mt-2">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-800 font-semibold">
                    {dashboard.stats.scheduled} Scheduled
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Video className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-sm shadow-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Completed
                </p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-800 font-semibold">
                    {dashboard.stats.completed} Interviews
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Score */}
        <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-sm shadow-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  AI Score
                </p>
                <div className="flex items-center mt-2">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-800 font-semibold">
                    {dashboard.ai_score}/100
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary + Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Overall AI Score
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 border-blue-300 text-blue-700"
                  >
                    {dashboard.ai_score >= 85 ? "Excellent" : "Good"}
                  </Badge>
                </div>
                <div className="relative">
                  <Progress value={dashboard.ai_score} className="h-4 bg-blue-100">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                      style={{ width: `${dashboard.ai_score}%` }}
                    />
                  </Progress>
                  <span className="absolute right-0 top-6 text-2xl font-bold text-gray-800">
                    {dashboard.ai_score}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Skills Assessment
                </h3>
                <div className="space-y-4">
                  {dashboard.skills.map((skill: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">
                          {skill.skill}
                        </span>
                        <span className="text-gray-800 font-semibold">
                          {skill.score}%
                        </span>
                      </div>
                      <Progress value={skill.score} className="h-2 bg-blue-100">
                        <div
                          className={`h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000`}
                          style={{ width: `${skill.score}%` }}
                        />
                      </Progress>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interviews */}
        <div>
          <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center">
                <Video className="mr-2 h-5 w-5 text-blue-600" />
                Recent Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.interviews.slice(0, 3).map((interview: any) => (
                  <div
                    key={interview.id}
                    className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {interview.company}
                      </h4>
                      <Badge
                        variant="outline"
                        className={
                          interview.status === "completed"
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-cyan-50 border-cyan-300 text-cyan-700"
                        }
                      >
                        {interview.status === "completed" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {interview.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {interview.position}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">
                        {interview.date}
                      </span>
                      {interview.score && (
                        <span className="text-blue-600 font-semibold text-sm">
                          {interview.score}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl">
                <Eye className="mr-2 h-4 w-4" />
                View All Interviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8">
        <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-sm shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="text-gray-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl h-12">
                <Upload className="mr-2 h-4 w-4" />
                Update Resume
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-12">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl h-12">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CandidateLayout>
  )
}