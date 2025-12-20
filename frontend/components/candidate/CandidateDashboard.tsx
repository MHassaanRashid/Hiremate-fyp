"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Briefcase,
  Calendar,
  Eye,
  TrendingUp,
  MapPin,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  FileText,
  Award,
  Building,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Bell,
  MessageSquare,
  Search,
  ArrowRight,
  Target,
  Rocket,
  ArrowUpRight,
  DollarSign,
  Zap,
} from 'lucide-react';
import {
  CandidateProfile,
  DashboardStats,
  Application,
  RecommendedJob,
  Interview,
  ProfileStrength,
  ActivityItem,
} from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface CandidateDashboardProps {
  profile: CandidateProfile;
  stats: DashboardStats;
  applications: Application[];
  recommendedJobs: RecommendedJob[];
  interviews: Interview[];
  profileStrength: ProfileStrength;
  activity: ActivityItem[];
  isLoading?: boolean;
}

export default function CandidateDashboard({
  profile,
  stats,
  applications,
  recommendedJobs,
  interviews,
  profileStrength,
  activity,
  isLoading = false,
}: CandidateDashboardProps) {
  const router = useRouter();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const strengthItems = Object.values(profileStrength);
  const completedItems = strengthItems.filter(Boolean).length;
  const strengthPercentage = Math.round((completedItems / strengthItems.length) * 100);

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'reviewing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shortlisted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'accepted': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Welcome back, {profile.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-slate-600 text-lg">Here's what's happening with your job search today</p>
          </div>
          <Button
            onClick={() => router.push('/candidate/find-jobs')}
            className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40"
          >
            <Search className="w-4 h-4 mr-2" />
            Find Jobs
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Briefcase}
            label="Applications"
            value={stats.total_applications}
            trend="+12%"
            trendUp={true}
            color="blue"
          />
          <StatCard
            icon={Eye}
            label="Profile Views"
            value={stats.profile_views}
            trend="+8%"
            trendUp={true}
            color="emerald"
          />
          <StatCard
            icon={Calendar}
            label="Interviews"
            value={stats.interviews_scheduled}
            trend="+3"
            trendUp={true}
            color="purple"
          />
          <StatCard
            icon={Target}
            label="Shortlisted"
            value={stats.shortlisted}
            trend="+5"
            trendUp={true}
            color="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Applications & Profile */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Applications */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Recent Applications</CardTitle>
                    <CardDescription className="mt-1">Track your latest job applications</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/candidate/applications')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No applications yet</p>
                    <p className="text-slate-400 text-sm mt-1">Start applying to jobs to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
                        onClick={() => router.push(`/candidate/applications`)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {app.job_title.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {app.job_title}
                            </h4>
                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                              <Building className="w-3 h-3" />
                              {app.company_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn("border", getStatusColor(app.status))}>
                            {app.status}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Recommended for You
                    </CardTitle>
                    <CardDescription className="mt-1">Jobs matching your profile</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recommendedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No recommendations yet</p>
                    <p className="text-slate-400 text-sm mt-1">Complete your profile to get personalized job matches</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => router.push('/candidate/find-jobs')}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                              {job.job_title}
                            </h4>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <Building className="w-3 h-3" />
                              {job.company_name}
                            </p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            {job.match_score}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {job.salary_range}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {job.job_type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Interviews */}
          <div className="space-y-8">

            {/* Profile Strength */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white/90">Profile Strength</h3>
                  <Target className="w-5 h-5 text-white/80" />
                </div>
                <div className="mb-4">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold">{strengthPercentage}%</span>
                    <span className="text-white/80 mb-1">Complete</span>
                  </div>
                  <Progress value={strengthPercentage} className="h-2 bg-white/20" />
                </div>
                <div className="space-y-2 mb-4">
                  <ProfileStrengthItem completed={profileStrength.has_resume} label="Resume uploaded" />
                  <ProfileStrengthItem completed={profileStrength.has_experience} label="Experience added" />
                  <ProfileStrengthItem completed={profileStrength.has_education} label="Education added" />
                  <ProfileStrengthItem completed={profileStrength.has_skills} label="Skills added" />
                </div>
                <Button
                  onClick={() => router.push('/candidate/profile')}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Upcoming Interviews</CardTitle>
                    <CardDescription className="mt-1 text-sm">Your scheduled meetings</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/candidate/interviews')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {interviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No interviews scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interviews.slice(0, 3).map((interview) => (
                      <div
                        key={interview.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
                        onClick={() => router.push('/candidate/interviews')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm">{interview.job_title}</h4>
                          <Video className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{interview.company_name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(interview.scheduled_at).toLocaleDateString()}
                          <Clock className="w-3 h-3 ml-2" />
                          {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-2">
                  <QuickActionButton
                    icon={Upload}
                    label="Upload Resume"
                    onClick={() => router.push('/candidate/resume')}
                  />
                  <QuickActionButton
                    icon={Search}
                    label="Browse Jobs"
                    onClick={() => router.push('/candidate/find-jobs')}
                  />
                  <QuickActionButton
                    icon={User}
                    label="Edit Profile"
                    onClick={() => router.push('/candidate/profile')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, label, value, trend, trendUp, color }: {
  icon: any;
  label: string;
  value: number;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden group hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
            colorClasses[color]
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <Badge className={cn(
            "border-0",
            trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}>
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-sm text-slate-600 font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileStrengthItem({ completed, label }: { completed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-white" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-white/40" />
      )}
      <span className={cn(
        "text-sm",
        completed ? "text-white" : "text-white/60"
      )}>
        {label}
      </span>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-blue-600 transition-colors" />
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-8">
            <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
