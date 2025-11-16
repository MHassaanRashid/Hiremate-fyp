// frontend/hooks/use-dashboard.tsx
"use client"

import { useState, useEffect } from 'react'
import { getDashboardData, DashboardData } from '@/lib/api/dashboard'

interface UseDashboardReturn {
  data: DashboardData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for fetching dashboard data
 * Handles loading states, errors, and provides a refetch function
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useDashboard()
 * 
 * if (isLoading) return <LoadingSpinner />
 * if (error) return <ErrorMessage error={error} />
 * if (!data) return <EmptyState />
 * 
 * return <Dashboard data={data} />
 * ```
 */
export const useDashboard = (): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        throw new Error('No access token found. Please login.')
      }

      const dashboardData = await getDashboardData(accessToken)
      setData(dashboardData)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  }
}
