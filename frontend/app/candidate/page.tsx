"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardData } from "@/lib/api/dashboard"
import CandidateLayout from "@/layouts/CandidateLayout"
import CandidateDashboard from "@/components/candidate/CandidateDashboard"
import type {
  CandidateProfile,
  DashboardStats,
  Application,
  RecommendedJob,
  Interview,
  ProfileStrength,
  ActivityItem,
} from "@/types/dashboard"

interface DashboardData {
  profile: CandidateProfile
  stats: DashboardStats
  applications: Application[]
  recommendedJobs: RecommendedJob[]
  interviews: Interview[]
  profileStrength: ProfileStrength
  activity: ActivityItem[]
}

export default function CandidatePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const accessToken = localStorage.getItem('access_token')
        if (!accessToken) {
          console.error('No access token found')
          setError('Please login to view your dashboard')
          return
        }

        // Fetch data from backend API
        const data = await getDashboardData(accessToken)

        // Set dashboard data with defaults for empty arrays
        setDashboardData({
          profile: data.profile,
          stats: data.stats,
          applications: data.applications || [],
          recommendedJobs: data.recommendedJobs || [],
          interviews: data.interviews || [],
          profileStrength: data.profileStrength,
          activity: data.activity || [],
        })
      } catch (error: any) {
        console.error('Error fetching dashboard:', error)
        setError(error.message || 'Failed to load dashboard')

        // Set empty dashboard with default values (no mock data)
        setDashboardData({
          profile: {
            name: user?.full_name || user?.email || 'Candidate',
            full_name: user?.full_name,
            profileCompletion: 0
          },
          stats: {
            applicationsSubmitted: 0,
            interviewsScheduled: 0,
            profileViews: 0,
            profileScore: 0,
          },
          applications: [],
          recommendedJobs: [],
          interviews: [],
          profileStrength: {
            resume: false,
            skills: false,
            photo: false,
            experience: false,
            education: false,
            certifications: false,
          },
          activity: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch when user is authenticated
    if (!authLoading && user) {
      fetchDashboardData()
    }
  }, [authLoading, user])

  // Handle error state only
  if (error && !authLoading && !dashboardData) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  // Main dashboard render - always show, let skeleton handle loading
  return (
    <CandidateLayout>
      <CandidateDashboard
        profile={dashboardData?.profile || {
          name: user?.full_name || user?.email || 'Candidate',
          full_name: user?.full_name,
          profileCompletion: 0
        }}
        stats={dashboardData?.stats || {
          applicationsSubmitted: 0,
          interviewsScheduled: 0,
          profileViews: 0,
          profileScore: 0,
        }}
        applications={dashboardData?.applications || []}
        recommendedJobs={dashboardData?.recommendedJobs || []}
        interviews={dashboardData?.interviews || []}
        profileStrength={dashboardData?.profileStrength || {
          resume: false,
          skills: false,
          photo: false,
          experience: false,
          education: false,
          certifications: false,
        }}
        activity={dashboardData?.activity || []}
        isLoading={authLoading || isLoading}
      />
    </CandidateLayout>
  )
}
