"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  MessageSquare,
  Award,
  Briefcase,
  Code,
  Target,
  Shield,
  Brain,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// ---------------------------
// Types
// ---------------------------
interface CandidateProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  avatar: string
  jobApplied: string
  applicationDate: string
  experience: string
  education: string
  skills: { name: string; level: number; color: string }[]
  aiEvaluation: {
    skillScore: number
    honestyScore: number
    behavioralScore: number
    overallScore: number
  }
  rank: number
  totalApplicants: number
  resumeUrl: string
  status: "new" | "reviewed" | "shortlisted" | "rejected"
  interviewStatus: "pending" | "scheduled" | "completed"
  notes: string
}

// ---------------------------
// Mock Data
// ---------------------------
const mockCandidate: CandidateProfile = {
  id: "1",
  name: "Ahmed Hassan",
  email: "ahmed.hassan@email.com",
  phone: "+92 300 1234567",
  location: "Karachi, Pakistan",
  avatar: "/placeholder.svg?height=120&width=120",
  jobApplied: "Senior Frontend Developer",
  applicationDate: "2024-01-15",
  experience: "4 years",
  education: "Bachelor's in Computer Science - FAST University",
  skills: [
    { name: "React", level: 95, color: "from-emerald-500 to-cyan-500" },
    { name: "JavaScript", level: 92, color: "from-blue-500 to-indigo-500" },
    { name: "TypeScript", level: 88, color: "from-purple-500 to-pink-500" },
    { name: "Node.js", level: 85, color: "from-orange-500 to-red-500" },
    { name: "CSS/SCSS", level: 90, color: "from-green-500 to-emerald-500" },
    { name: "Git", level: 87, color: "from-cyan-500 to-blue-500" },
  ],
  aiEvaluation: {
    skillScore: 92,
    honestyScore: 88,
    behavioralScore: 85,
    overallScore: 88,
  },
  rank: 3,
  totalApplicants: 156,
  resumeUrl: "#",
  status: "reviewed",
  interviewStatus: "scheduled",
  notes: "Strong technical background with excellent React skills. Good communication during initial screening.",
}

const experienceData = [
  {
    company: "TechLogix",
    position: "Frontend Developer",
    duration: "Jan 2022 - Present",
    description:
      "Led development of responsive web applications using React and TypeScript. Improved performance by 40%.",
  },
  {
    company: "Systems Limited",
    position: "Junior Developer",
    duration: "Jun 2020 - Dec 2021",
    description: "Developed user interfaces and collaborated with backend teams. Worked on 5+ major projects.",
  },
]

// ---------------------------
// Helper Functions
// ---------------------------
const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-400"
  if (score >= 80) return "text-blue-400"
  if (score >= 70) return "text-yellow-400"
  return "text-red-400"
}

const getRankSuffix = (rank: number) => {
  if (rank % 10 === 1 && rank % 100 !== 11) return "st"
  if (rank % 10 === 2 && rank % 100 !== 12) return "nd"
  if (rank % 10 === 3 && rank % 100 !== 13) return "rd"
  return "th"
}

// ---------------------------
// Components
// ---------------------------
const CandidateBasicInfoCard = ({ candidate }: { candidate: CandidateProfile }) => (
  <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
    <CardContent className="p-6 text-center">
      <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-emerald-400/30">
        <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
        <AvatarFallback className="bg-emerald-600 text-gray-800 text-2xl">
          {candidate.name.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{candidate.name}</h2>
      <p className="text-gray-600 mb-4">{candidate.jobApplied}</p>

      <div className="space-y-3 text-left">
        <div className="flex items-center text-gray-700">
          <Mail className="h-4 w-4 mr-3 text-emerald-400" />
          {candidate.email}
        </div>
        <div className="flex items-center text-gray-700">
          <Phone className="h-4 w-4 mr-3 text-emerald-400" />
          {candidate.phone}
        </div>
        <div className="flex items-center text-gray-700">
          <MapPin className="h-4 w-4 mr-3 text-emerald-400" />
          {candidate.location}
        </div>
        <div className="flex items-center text-gray-700">
          <Calendar className="h-4 w-4 mr-3 text-emerald-400" />
          Applied: {candidate.applicationDate}
        </div>
      </div>

      <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
        <Download className="mr-2 h-4 w-4" />
        Download Resume
      </Button>
    </CardContent>
  </Card>
)

const CandidateRankCard = ({ candidate }: { candidate: CandidateProfile }) => {
  const progressValue = ((candidate.totalApplicants - candidate.rank + 1) / candidate.totalApplicants) * 100
  return (
    <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center">
          <Award className="mr-2 h-5 w-5 text-yellow-400" />
          Candidate Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            {candidate.rank}
            <span className="text-lg">{getRankSuffix(candidate.rank)}</span>
          </div>
          <p className="text-gray-600">out of {candidate.totalApplicants} applicants</p>
          <div className="mt-4">
            <Progress
              value={progressValue}
              className="h-3 bg-blue-100"
            >
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000"
                style={{ width: `${progressValue}%` }}
              />
            </Progress>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Top {Math.round(progressValue)}% performer
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const RecruiterActionsCard = () => (
  <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
    <CardHeader>
      <CardTitle className="text-gray-800">Recruiter Actions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
        <UserCheck className="mr-2 h-4 w-4" />
        Shortlist Candidate
      </Button>
      <Button
        variant="outline"
        className="w-full border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
      >
        <UserX className="mr-2 h-4 w-4" />
        Reject Candidate
      </Button>
      <Button
        variant="outline"
        className="w-full border-blue-300 text-gray-700 hover:bg-blue-50 hover:text-gray-900"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Schedule Interview
      </Button>
    </CardContent>
  </Card>
)

const AIEvaluationPanel = ({ candidate }: { candidate: CandidateProfile }) => {
  const scores = [
    { name: "Overall", score: candidate.aiEvaluation.overallScore, color: "emerald-400" },
    { name: "Skill", score: candidate.aiEvaluation.skillScore, color: "blue-400" },
    { name: "Honesty", score: candidate.aiEvaluation.honestyScore, color: "purple-400" },
    { name: "Behavioral", score: candidate.aiEvaluation.behavioralScore, color: "orange-400" },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center">
          <Brain className="mr-2 h-5 w-5 text-emerald-400" />
          AI Evaluation Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {scores.map((s, idx) => (
            <div key={idx} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-blue-100"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`text-${s.color}`}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${s.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${getScoreColor(s.score)}`}>{s.score}%</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{s.name} Score</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ... Similar components for SkillsAssessmentCard, ExperienceCard, NotesSectionCard ...

// ---------------------------
// Main Component
// ---------------------------
export default function CandidateProfileView() {
  const [candidate] = useState<CandidateProfile>(mockCandidate)
  const [notes, setNotes] = useState(candidate.notes)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-blue-200/50 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800 mr-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Candidates
            </Button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-800">Candidate Profile</h1>
                <p className="text-gray-600">Detailed evaluation and assessment</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50/10 border-blue-200/50 text-blue-500 px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            AI Evaluated
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <CandidateBasicInfoCard candidate={candidate} />
          <CandidateRankCard candidate={candidate} />
          <RecruiterActionsCard />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AIEvaluationPanel candidate={candidate} />
          {/* Add SkillsAssessmentCard, ExperienceCard, NotesSectionCard here */}
        </div>
      </div>
    </div>
  )
}
