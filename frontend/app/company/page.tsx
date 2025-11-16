"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import CompanySidebar from "@/components/company/CompanySidebar"
import {
  Search,
  Users,
  Calendar,
  Star,
  Award,
  Plus,
  Menu,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Candidate {
  id: string
  name: string
  email: string
  job_applied: string
  interview_status: string
  application_date: string
  score: number
  experience: string
  skills: string[]
  avatar: string
  location: string
  application_status: string
}

const statsData = [
  {
    title: "Total Applications",
    value: "156",
    change: "+12%",
    icon: Users,
    color: "from-emerald-500 to-cyan-500",
    glowColor: "shadow-emerald-500/30",
  },
  {
    title: "Interviews Scheduled",
    value: "24",
    change: "+8%",
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
    glowColor: "shadow-blue-500/30",
  },
  {
    title: "Shortlisted",
    value: "42",
    change: "+15%",
    icon: Star,
    color: "from-purple-500 to-pink-500",
    glowColor: "shadow-purple-500/30",
  },
  {
    title: "Hired This Month",
    value: "8",
    change: "+25%",
    icon: Award,
    color: "from-orange-500 to-red-500",
    glowColor: "shadow-orange-500/30",
  },
]

export default function RecruiterDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth?tab=login")
        return
      }

      const fetchCandidates = async () => {
        try {
          const res = await fetch("http://localhost:5000/candidates/")
          const data = await res.json()
          setCandidates(data)
        } catch (err) {
          console.error("Error fetching candidates:", err)
        } finally {
          setLoading(false)
        }
      }

      fetchCandidates()
    }
  }, [user, isLoading, router])

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.job_applied.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || candidate.application_status === statusFilter

    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "high" && candidate.score >= 85) ||
      (scoreFilter === "medium" && candidate.score >= 70 && candidate.score < 85) ||
      (scoreFilter === "low" && candidate.score < 70)

    const applicationDate = new Date(candidate.application_date)
    const today = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" &&
        applicationDate.toDateString() === today.toDateString()) ||
      (dateFilter === "week" &&
        applicationDate >= new Date(today.getTime() - oneWeek)) ||
      (dateFilter === "month" &&
        applicationDate >= new Date(today.getTime() - oneMonth))

    return matchesSearch && matchesStatus && matchesScore && matchesDate
  })

  if (isLoading || loading) {
    return (
      <div className="p-6 text-gray-600">Loading...</div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <CompanySidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-blue-200/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Candidate Management</h1>
                <p className="text-gray-600">Manage and track your candidates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-2xl font-bold text-gray-800 mr-2">{stat.value}</span>
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

          {/* Filters and Search */}
          <Card className="mb-6 bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-blue-50 border-blue-200 text-gray-800 placeholder-gray-500 focus:ring-blue-300"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-blue-50 border-blue-200 text-gray-800">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={scoreFilter} onValueChange={setScoreFilter}>
                    <SelectTrigger className="w-32 bg-blue-50 border-blue-200 text-gray-800">
                      <SelectValue placeholder="Score" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200">
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="high">85+ High</SelectItem>
                      <SelectItem value="medium">70-84 Medium</SelectItem>
                      <SelectItem value="low">Below 70</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32 bg-blue-50 border-blue-200 text-gray-800">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className={`border-blue-200 ${viewMode === "cards" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                  >
                    Cards
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className={`border-blue-200 ${viewMode === "table" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                  >
                    Table
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Display */}
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((c) => (
                <Card
                  key={c.id}
                  className="bg-white/90 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {c.avatar && (
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-sm text-gray-600">{c.job_applied}</p>
                        <p className="text-sm text-gray-600">{c.location}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">
                      <strong>Status:</strong> {c.application_status} <br />
                      <strong>Interview:</strong> {c.interview_status} <br />
                      <strong>Score:</strong> {c.score}
                    </p>
                    {c.experience && (
                      <p className="mt-2 text-sm text-gray-700">{c.experience}</p>
                    )}
                    {c.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.skills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 border-blue-300"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>Table view to be implemented</p>
          )}
        </main>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-blue-900/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
