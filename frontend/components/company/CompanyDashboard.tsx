"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    Users,
    Star,
    TrendingUp,
    Search,
    Plus,
    ArrowRight,
    ChevronRight,
    Bell,
    Sparkles,
    Calendar,
    Clock,
    Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

// Types matching the dashboard data structure
interface DashboardStats {
    total_jobs: number;
    total_applications: number;
    shortlisted: number;
}

interface RecentApplication {
    id: string;
    job_title: string;
    status: string;
    applied_date: string;
    candidate: {
        name: string;
        email: string;
        avatar: string | null;
    };
}

interface CompanyDashboardProps {
    user: any;
    stats: DashboardStats;
    recentApps: RecentApplication[];
    loading?: boolean;
}

// Reusing StatCard style
interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    trend?: string;
    color?: 'blue' | 'purple' | 'amber' | 'emerald';
}

function StatCard({ icon: Icon, label, value, trend, color = 'blue' }: StatCardProps) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600 ring-blue-600/20",
        purple: "bg-purple-50 text-purple-600 ring-purple-600/20",
        amber: "bg-amber-50 text-amber-600 ring-amber-600/20",
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-600/20"
    };

    const gradientStyles = {
        blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
        purple: "from-purple-500 to-indigo-600 shadow-purple-500/30",
        amber: "from-amber-500 to-orange-600 shadow-amber-500/30",
        emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30"
    }

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between h-full group hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">{label}</p>
                    <h3 className="text-3xl font-black tracking-tight text-slate-900">{value}</h3>
                </div>
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br",
                    gradientStyles[color]
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-xs">
                    <span className="text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {trend}
                    </span>
                    <span className="text-slate-400 ml-2 font-medium">vs last month</span>
                </div>
            )}
        </div>
    );
}

export default function CompanyDashboard({
    user,
    stats,
    recentApps,
    loading = false,
}: CompanyDashboardProps) {
    const router = useRouter();

    if (loading) {
        return <DashboardSkeleton />;
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'reviewing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shortlisted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 relative">
            <AnimatedBackground />
            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Unified Header Card */}
                <Card className="border-0 shadow-xl bg-white overflow-hidden rounded-2xl">
                    <CardContent className="p-0">
                        {/* Top Section - Welcome & Action */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-10 relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-wider mb-2">
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                        Recruiter Portal
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                        Welcome back, {user?.full_name?.split(' ')[0] || 'Partner'}!
                                    </h1>
                                    <p className="text-blue-100 text-base md:text-lg max-w-xl font-medium">
                                        Manage your talent pipeline effectively. You have new applicants waiting for review.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => router.push('/company/post-job')}
                                        className="bg-white text-blue-600 hover:bg-blue-50 font-bold h-12 px-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 rounded-xl border-0"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Post New Job
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid - Integrated into header card bottom */}
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
                            <div className="p-6 md:p-8 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push('/company/jobs')}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <Briefcase className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900">{stats.total_jobs}</p>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Jobs</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push('/company/candidates')}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <Users className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900">{stats.total_applications}</p>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Applicants</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push('/company/candidates?status=shortlisted')}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <Star className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900">{stats.shortlisted}</p>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Shortlisted</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Applications List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-400" />
                                Recent Applications
                            </h2>
                            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-bold hover:bg-blue-50" onClick={() => router.push('/company/candidates')}>
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <Card className="border-0 shadow-lg bg-white overflow-hidden rounded-2xl">
                            <CardContent className="p-0">
                                {recentApps.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {recentApps.map((app) => (
                                            <div key={app.id} className="p-4 md:p-5 hover:bg-slate-50 transition-all cursor-pointer group flex items-center gap-4" onClick={() => router.push('/company/candidates')}>
                                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                    <AvatarImage src={app.candidate.avatar || undefined} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                                        {app.candidate.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                            {app.candidate.name}
                                                        </h4>
                                                        <Badge className={cn("capitalize border-0", getStatusColor(app.status))}>
                                                            {app.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-500 gap-2">
                                                        <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">{app.job_title}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">No applications yet</h3>
                                        <p className="text-slate-500 text-sm max-w-xs">When candidates apply to your jobs, they will appear here.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="space-y-6">
                        {/* Tips Widget */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative rounded-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="h-32 w-32 -mr-10 -mt-10" />
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Sparkles className="w-5 h-5 text-yellow-300" /> Pro Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <p className="text-blue-100 text-sm font-medium leading-relaxed mb-4">
                                    Adding a generic "skills" quiz to your job post can automatically filter the top 20% of candidates for you.
                                </p>
                                <Button variant="secondary" className="w-full bg-white text-blue-600 font-bold hover:bg-blue-50 border-0" size="sm">
                                    Learn More
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Upcoming Activity */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                Today's Agenda
                            </h2>
                            <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                                <CardContent className="p-0 divide-y divide-slate-100">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-col flex-col items-center justify-center text-purple-600 font-bold shadow-sm border border-purple-100 text-xs leading-tight">
                                                <span>DEC</span>
                                                <span className="text-lg">29</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">Candidate Review</h4>
                                                <p className="text-xs text-slate-500 font-medium mb-1">Review top 5 applicants for Frontend Role</p>
                                                <Badge variant="outline" className="text-[10px] h-5 bg-slate-50 text-slate-500 border-slate-200">
                                                    2:00 PM
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-64 bg-slate-200 rounded-2xl w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-8 bg-slate-200 rounded w-48 mb-4" />
                        <div className="h-96 bg-slate-200 rounded-2xl w-full" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-48 bg-slate-200 rounded-2xl w-full" />
                        <div className="h-64 bg-slate-200 rounded-2xl w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
