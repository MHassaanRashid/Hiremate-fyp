"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import CompanyDashboard from "@/components/company/CompanyDashboard"

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth?tab=login")
        return
      }

      const fetchDashboardData = async () => {
        try {
          // In a real scenario, use your API function here
          const backend = "/api"
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
          setIsLoading(false)
        }
      }

      fetchDashboardData()
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>
  }

  // Use default data if fetch fails or is loading initally
  const defaultStats = { total_jobs: 0, total_applications: 0, shortlisted: 0 }

  return (
    <CompanyDashboard
      user={user}
      stats={dashboardData?.stats || defaultStats}
      recentApps={dashboardData?.recent_applications || []}
      loading={isLoading}
    />
  )
}

