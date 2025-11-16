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
            name: 'Candidate', 
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

  // Authentication loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !dashboardData) {
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

  // Main dashboard render
  return (
    <CandidateLayout>
      {dashboardData ? (
        <CandidateDashboard
          profile={dashboardData.profile}
          stats={dashboardData.stats}
          applications={dashboardData.applications}
          recommendedJobs={dashboardData.recommendedJobs}
          interviews={dashboardData.interviews}
          profileStrength={dashboardData.profileStrength}
          activity={dashboardData.activity}
          isLoading={isLoading}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      )}
    </CandidateLayout>
  )
}
