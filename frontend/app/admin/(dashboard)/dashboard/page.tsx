"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Briefcase, FileText, Video, TrendingUp, Activity, BarChart3, PieChart } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        total_jobs: 0,
        total_applications: 0,
        total_interviews: 0,
        users_trend: 0,
        jobs_trend: 0,
        applications_trend: 0,
        interviews_trend: 0
    })
    const [analytics, setAnalytics] = useState({
        growth: [],
        activity: []
    })
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("access_token")
            const headers = { Authorization: `Bearer ${token}` }

            const [statsRes, analyticsRes] = await Promise.all([
                fetch(`/api/admin/stats`, { headers }),
                fetch(`/api/admin/analytics`, { headers })
            ])

            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats(data)
            }
            if (analyticsRes.ok) {
                const data = await analyticsRes.json()
                setAnalytics(data)
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Unified Header Card (Hero + Stats) - Matching Candidate Dashboard Style */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
                <CardContent className="p-0">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                                <p className="text-blue-50 text-lg">System overview and performance metrics.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-blue-50 text-sm font-medium">
                                    <Activity className="w-4 h-4 inline-block mr-2" />
                                    System Operational
                                </div>
                                <Button
                                    onClick={fetchData}
                                    disabled={loading}
                                    className="bg-white text-blue-600 hover:bg-blue-50 border-0 disabled:opacity-70"
                                >
                                    {loading ? 'Refreshing...' : 'Refresh Data'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        <ChartStatCard
                            title="Total Users"
                            value={stats.total_users}
                            icon={Users}
                            trend={stats.users_trend}
                            color="blue"
                            loading={loading}
                        />
                        <ChartStatCard
                            title="Active Jobs"
                            value={stats.total_jobs}
                            icon={Briefcase}
                            trend={stats.jobs_trend}
                            color="purple"
                            loading={loading}
                        />
                        <ChartStatCard
                            title="Applications"
                            value={stats.total_applications}
                            icon={FileText}
                            trend={stats.applications_trend}
                            color="emerald"
                            loading={loading}
                        />
                        <ChartStatCard
                            title="Interviews"
                            value={stats.total_interviews}
                            icon={Video}
                            trend={stats.interviews_trend}
                            color="amber"
                            loading={loading}
                            isLast
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                {/* Main Chart */}
                <Card className="lg:col-span-4 border-0 shadow-xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Platform Activity
                        </CardTitle>
                        <CardDescription>Views count throughout the day</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="views" name="Page Views" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Secondary Chart */}
                <Card className="lg:col-span-3 border-0 shadow-xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Growth Trends
                        </CardTitle>
                        <CardDescription>Users vs Jobs creation trend</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                                    />
                                    <Area type="monotone" dataKey="users" name="New Users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    <Area type="monotone" dataKey="jobs" name="New Jobs" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorJobs)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ChartStatCard({ title, value, icon: Icon, trend, color, isLast, loading }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50",
        emerald: "text-emerald-600 bg-emerald-50",
        amber: "text-amber-600 bg-amber-50"
    }

    const iconColor = colors[color] || colors.blue

    return (
        <div className={`p-8 border-b md:border-b-0 ${!isLast ? 'md:border-r' : ''} border-slate-100 hover:bg-slate-50/50 transition-colors group`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend !== 0 && (
                    <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                        {trend > 0 ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingUp className="w-3 h-3 ml-1 rotate-180" />}
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 font-medium text-sm">{title}</p>
                {loading ? (
                    <div className="h-9 w-24 bg-slate-200 rounded animate-pulse mt-1" />
                ) : (
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{(value || 0).toLocaleString()}</h3>
                )}
            </div>
        </div>
    )
}
