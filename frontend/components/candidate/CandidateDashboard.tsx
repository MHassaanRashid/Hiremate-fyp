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
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

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

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  trend?: string; // Optional trend indicator
  color?: 'default' | 'success' | 'warning' | 'info';
}

function StatCard({ icon: Icon, label, value, trend, color = 'default' }: StatCardProps) {
  const colorStyles = {
    default: "bg-primary/10 text-primary ring-primary/20",
    success: "bg-emerald-50 text-emerald-600 ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-600 ring-amber-600/20 dark:bg-amber-950/30 dark:text-amber-400",
    info: "bg-sky-50 text-sky-600 ring-sky-600/20 dark:bg-sky-950/30 dark:text-sky-400"
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between h-full group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
        </div>
        <div className={cn(
          "p-2.5 rounded-lg ring-1 transition-colors",
          colorStyles[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className="text-emerald-600 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </span>
          <span className="text-muted-foreground ml-1.5">vs last month</span>
        </div>
      )}
    </div>
  );
}

// Profile Item Component
interface ProfileItemProps {
  label: string;
  completed: boolean;
  icon: React.ElementType;
}

function ProfileItem({ label, completed, icon: Icon }: ProfileItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", completed ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("text-sm", completed ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
      </div>
      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-500" />
      )}
    </div>
  );
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

  // Helper function to format trend values
  const formatTrend = (trend?: number): string => {
    if (trend === undefined || trend === null) return '';
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8 relative">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">


        {/* Unified Header Card */}
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            {/* Top Section - Welcome & Action */}
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Welcome back, {profile.full_name?.split(' ')[0] || profile.name?.split(' ')[0] || 'there'}! 👋
                  </h1>
                  <p className="text-blue-50 text-base md:text-lg">
                    Here's what's happening with your job search today
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/candidate/find-jobs')}
                  className="bg-white hover:bg-blue-50 text-blue-600 h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold self-start md:self-center"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Jobs
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Applications */}
              <div className="p-6 md:p-8 border-r border-b sm:border-b-0 border-slate-100 hover:bg-gradient-to-br hover:from-blue-50 hover:to-transparent transition-all group">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stats.applicationsSubmitted}</p>
                    <p className="text-sm text-slate-600 font-semibold">Applications</p>
                    {formatTrend(stats.applicationsTrend) && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                          stats.applicationsTrend !== undefined && stats.applicationsTrend >= 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}>
                          {stats.applicationsTrend !== undefined && stats.applicationsTrend >= 0 ? "↗" : "↘"}
                          {formatTrend(stats.applicationsTrend)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Views */}
              <div className="p-6 md:p-8 border-r border-b lg:border-b-0 border-slate-100 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-transparent transition-all group">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <Eye className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stats.profileViews}</p>
                    <p className="text-sm text-slate-600 font-semibold">Profile Views</p>
                    {formatTrend(stats.profileViewsTrend) && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                          stats.profileViewsTrend !== undefined && stats.profileViewsTrend >= 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}>
                          {stats.profileViewsTrend !== undefined && stats.profileViewsTrend >= 0 ? "↗" : "↘"}
                          {formatTrend(stats.profileViewsTrend)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interviews */}
              <div className="p-6 md:p-8 border-r sm:border-r-0 lg:border-r border-slate-100 hover:bg-gradient-to-br hover:from-purple-50 hover:to-transparent transition-all group">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stats.interviewsScheduled}</p>
                    <p className="text-sm text-slate-600 font-semibold">Interviews</p>
                    {formatTrend(stats.interviewsTrend) && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                          stats.interviewsTrend !== undefined && stats.interviewsTrend >= 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}>
                          {stats.interviewsTrend !== undefined && stats.interviewsTrend >= 0 ? "↗" : "↘"}
                          {formatTrend(stats.interviewsTrend)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Score */}
              <div className="p-6 md:p-8 hover:bg-gradient-to-br hover:from-amber-50 hover:to-transparent transition-all group">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    <Target className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stats.profileScore}</p>
                    <p className="text-sm text-slate-600 font-semibold">Profile Score</p>
                    {formatTrend(stats.profileScoreTrend) && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                          stats.profileScoreTrend !== undefined && stats.profileScoreTrend >= 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}>
                          {stats.profileScoreTrend !== undefined && stats.profileScoreTrend >= 0 ? "↗" : "↘"}
                          {formatTrend(stats.profileScoreTrend)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Applications & Profile */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Applications */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">Recent Applications</CardTitle>
                      <CardDescription className="mt-1">Track your latest job applications</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/candidate/applications')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 font-semibold"
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
                        className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all cursor-pointer group hover:shadow-md"
                        onClick={() => router.push(`/candidate/applications`)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                            {app.jobTitle.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {app.jobTitle}
                            </h4>
                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                              <Building className="w-3 h-3" />
                              {app.company}
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
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">Recommended for You</CardTitle>
                      <CardDescription className="mt-1">Jobs matching your profile</CardDescription>
                    </div>
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
                        className="p-6 rounded-2xl border-2 border-slate-100 hover:border-amber-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => router.push('/candidate/find-jobs')}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                              {job.title}
                            </h4>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <Building className="w-3 h-3" />
                              {job.company}
                            </p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            {job.matchPercentage}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Alerts */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">Job Alerts</CardTitle>
                      <CardDescription className="mt-1">Stay updated with new opportunities</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">5 new jobs match your profile</p>
                        <p className="text-xs text-slate-600">Software Engineer positions in your area</p>
                        <Button
                          variant="link"
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto mt-2 text-xs font-semibold"
                          onClick={() => router.push('/candidate/find-jobs')}
                        >
                          View Jobs →
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-transparent border-l-4 border-emerald-500">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Target className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Profile viewed by 3 companies</p>
                        <p className="text-xs text-slate-600">Increase visibility by completing your profile</p>
                        <Button
                          variant="link"
                          className="text-emerald-600 hover:text-emerald-700 p-0 h-auto mt-2 text-xs font-semibold"
                          onClick={() => router.push('/candidate/profile')}
                        >
                          Complete Profile →
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-transparent border-l-4 border-amber-500">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Improve your resume score</p>
                        <p className="text-xs text-slate-600">Get AI-powered suggestions to stand out</p>
                        <Button
                          variant="link"
                          className="text-amber-600 hover:text-amber-700 p-0 h-auto mt-2 text-xs font-semibold"
                          onClick={() => router.push('/candidate/resume/analyze')}
                        >
                          Analyze Resume →
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
                  <ProfileStrengthItem completed={profileStrength.resume} label="Resume uploaded" />
                  <ProfileStrengthItem completed={profileStrength.experience} label="Experience added" />
                  <ProfileStrengthItem completed={profileStrength.education} label="Education added" />
                  <ProfileStrengthItem completed={profileStrength.skills} label="Skills added" />
                  <ProfileStrengthItem completed={profileStrength.photo} label="Profile photo added" />
                  <ProfileStrengthItem completed={profileStrength.certifications} label="Certifications added" />
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
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50/50 border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">Upcoming Interviews</CardTitle>
                      <CardDescription className="mt-1 text-sm">Your scheduled meetings</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/candidate/interviews')}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 font-semibold"
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
                        className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-purple-50/50 to-transparent border-2 border-purple-100 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => router.push('/candidate/interviews')}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-purple-600 transition-colors flex-1">{interview.position}</h4>
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                            <Video className="w-4 h-4 text-purple-600" />
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mb-2">{interview.company}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(interview.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {interview.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50/50 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-2">
                  <QuickActionButton
                    icon={FileText}
                    label="Resume Builder"
                    onClick={() => router.push('/candidate/resume')}
                  />
                  <QuickActionButton
                    icon={Sparkles}
                    label="AI Resume Analyzer"
                    onClick={() => router.push('/candidate/resume/analyze')}
                  />
                  <QuickActionButton
                    icon={Award}
                    label="Take AI Quiz"
                    onClick={() => router.push('/candidate/quiz')}
                  />
                  <QuickActionButton
                    icon={Search}
                    label="Browse Jobs"
                    onClick={() => router.push('/candidate/find-jobs')}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8 relative">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
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
