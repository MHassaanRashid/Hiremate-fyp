'use client';

import React, { useState } from 'react';
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
import { useRouter } from 'next/navigation';

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
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const router = useRouter();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'viewed': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
      case 'shortlisted': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'interview': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'view':
      case 'profile_viewed':
        return Eye;
      case 'status_change':
      case 'application_viewed':
      case 'application_shortlisted':
        return AlertCircle;
      case 'message':
        return MessageSquare;
      case 'recommendation':
      case 'job_recommended':
        return Sparkles;
      case 'interview_scheduled':
        return Calendar;
      case 'application_submitted':
        return FileText;
      default:
        return Bell;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Welcome Section with Pattern */}
      <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Welcome back, {profile.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-primary-foreground/90 text-lg font-medium leading-relaxed">
                You've got <span className="underline decoration-wavy decoration-white/30 underline-offset-4">{stats.interviewsScheduled} interviews</span> coming up. Keep the momentum going!
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => router.push('/candidate/resume')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm"
              >
                <FileText className="w-4 h-4" />
                Update Resume
              </button>
              <button
                onClick={() => router.push('/homepage')}
                className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-black/5 hover:bg-gray-50 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                Find Jobs
              </button>
            </div>
          </div>

          {/* Profile Completion Circle */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 w-full md:w-auto min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white/90">Profile Strength</span>
              <span className="text-lg font-bold">{profile.profileCompletion}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {profile.profileCompletion < 100 ? "Complete your profile to rank higher" : "Profile fully optimized!"}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Applications"
          value={stats.applicationsSubmitted}
          color="default"
          trend="+12%"
        />
        <StatCard
          icon={Calendar}
          label="Interviews"
          value={stats.interviewsScheduled}
          color="warning"
        />
        <StatCard
          icon={Eye}
          label="Profile Views"
          value={stats.profileViews}
          color="info"
          trend="+5%"
        />
        <StatCard
          icon={TrendingUp}
          label="Profile Score"
          value={`${stats.profileScore}%`}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Recent Applications */}
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Recent Applications</h2>
                <p className="text-sm text-muted-foreground">Track your job applications</p>
              </div>
              <button
                onClick={() => router.push('/candidate/applications')}
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left py-3 px-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-6 font-medium text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-left py-3 px-6 font-medium text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs uppercase">
                            {app.company.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{app.jobTitle}</p>
                            <p className="text-xs text-muted-foreground">{app.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold border",
                          getStatusColor(app.status)
                        )}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        <p>No applications yet. Start exploring jobs!</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Jobs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Recommended for You</h2>
                <p className="text-sm text-muted-foreground">Jobs that match your profile</p>
              </div>
              <div className="flex gap-2">
                {/* Navigation buttons for carousel could go here */}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className={cn(
                    'group bg-card hover:border-primary/50 text-card-foreground rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden',
                    selectedJob === job.id && 'ring-2 ring-primary border-primary'
                  )}
                  onClick={() => setSelectedJob(job.id)}
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {job.matchPercentage}% Match
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                      {job.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                    <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200 flex items-center gap-1">
                      Quick Apply <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-8">

          {/* Upcoming Interviews */}
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Interviews
            </h2>
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border border-dashed border-border">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No interviews scheduled yet.</p>
                  <button className="text-primary text-xs font-medium mt-1 hover:underline">Prepare for interviews</button>
                </div>
              ) : (
                interviews.map((interview) => (
                  <div key={interview.id} className="relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors py-1">
                    <div className="absolute -left-[5px] top-2.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <h3 className="font-semibold text-sm">{interview.position}</h3>
                    <p className="text-xs text-muted-foreground mb-1">with {interview.company}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                        {new Date(interview.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                      <span>
                        {new Date(interview.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {interview.time}
                      </span>
                    </div>
                    {interview.type === 'online' && (
                      <button className="mt-3 w-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold py-1.5 rounded transition-colors">
                        Join Meeting
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Profile Missing Items */}
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Action Items
              </h2>
              <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                {100 - profile.profileCompletion > 0 ? 'Pending' : 'Done'}
              </span>
            </div>

            <div className="space-y-3">
              <ProfileItem label="Resume Uploaded" completed={profileStrength.resume} icon={FileText} />
              <ProfileItem label="Skills Added" completed={profileStrength.skills} icon={Award} />
              <ProfileItem label="Profile Photo" completed={profileStrength.photo} icon={User} />
              <ProfileItem label="Work Experience" completed={profileStrength.experience} icon={Briefcase} />
              <ProfileItem label="Education" completed={profileStrength.education} icon={Award} />
            </div>

            {100 - profile.profileCompletion > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => router.push('/candidate/profile')}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Complete Profile
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activity.slice(0, 4).map((item, idx) => {
                const Icon = getActivityIcon(item.type);
                return (
                  <div key={item.id || idx} className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-full bg-muted mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-muted rounded-xl h-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted rounded-xl h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-muted rounded-xl h-96 animate-pulse" />
          </div>
          <div>
            <div className="bg-muted rounded-xl h-96 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
