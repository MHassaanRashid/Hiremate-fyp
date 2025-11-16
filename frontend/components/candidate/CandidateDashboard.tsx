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
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Calculate profile strength percentage
  const strengthItems = Object.values(profileStrength);
  const completedItems = strengthItems.filter(Boolean).length;
  const strengthPercentage = Math.round((completedItems / strengthItems.length) * 100);

  // Get status badge color
  const getStatusColor = (status: Application['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return colors[status];
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
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {profile.name}! 👋
              </h1>
              <p className="text-blue-100">
                Keep building your career - you're doing great!
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                <FileText className="w-4 h-4" />
                Complete Profile
              </button>
              <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors border border-blue-400">
                <Upload className="w-4 h-4" />
                Upload Resume
              </button>
            </div>
          </div>

          {/* Profile Completion Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-100">
                Profile Completion
              </span>
              <span className="text-sm font-bold">{profile.profileCompletion}%</span>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Statistics Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Briefcase}
            label="Applications Submitted"
            value={stats.applicationsSubmitted}
            color="blue"
          />
          <StatCard
            icon={Calendar}
            label="Interviews Scheduled"
            value={stats.interviewsScheduled}
            color="green"
          />
          <StatCard
            icon={Eye}
            label="Profile Views"
            value={stats.profileViews}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Profile Score"
            value={`${stats.profileScore}%`}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Applications Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Applications
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.slice(0, 5).map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {app.jobTitle}
                          </div>
                          <div className="text-sm text-gray-500 md:hidden">
                            {app.company}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {app.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {new Date(app.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                              getStatusColor(app.status)
                            )}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommended Jobs Carousel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Recommended Jobs
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedJobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className={cn(
                      'border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer',
                      selectedJob === job.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    )}
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-500">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-bold">{job.matchPercentage}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {job.type}
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      Quick Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Interviews Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Interviews
              </h2>
              <div className="space-y-4">
                {interviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No upcoming interviews scheduled</p>
                  </div>
                ) : (
                  interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {interview.position}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {interview.company}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(interview.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {interview.time}
                            </div>
                            <div className="flex items-center gap-1">
                              {interview.type === 'online' ? (
                                <Video className="w-3 h-3" />
                              ) : (
                                <MapPin className="w-3 h-3" />
                              )}
                              {interview.type.charAt(0).toUpperCase() +
                                interview.type.slice(1)}
                            </div>
                          </div>
                        </div>
                        {interview.type === 'online' && interview.meetingLink && (
                          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Video className="w-4 h-4" />
                            Join Interview
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Strength Widget */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Profile Strength
              </h2>
              <div className="mb-6">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#3B82F6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 56 * (1 - strengthPercentage / 100)
                      }`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {strengthPercentage}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <ProfileItem
                  label="Resume Uploaded"
                  completed={profileStrength.resume}
                  icon={FileText}
                />
                <ProfileItem
                  label="Skills Added"
                  completed={profileStrength.skills}
                  icon={Award}
                />
                <ProfileItem
                  label="Profile Photo"
                  completed={profileStrength.photo}
                  icon={User}
                />
                <ProfileItem
                  label="Work Experience"
                  completed={profileStrength.experience}
                  icon={Briefcase}
                />
                <ProfileItem
                  label="Education"
                  completed={profileStrength.education}
                  icon={Award}
                />
                <ProfileItem
                  label="Certifications"
                  completed={profileStrength.certifications}
                  icon={Award}
                />
              </div>
              {strengthPercentage < 100 && (
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Improve Profile
                </button>
              )}
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {activity.slice(0, 5).map((item) => {
                  const Icon = getActivityIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 mb-1">{item.message}</p>
                        <p className="text-xs text-gray-500">{item.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-1 transition-colors">
                View All Activity
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
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
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300" />
      )}
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gray-300 rounded-lg h-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-300 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-300 rounded-lg h-96 animate-pulse" />
          </div>
          <div>
            <div className="bg-gray-300 rounded-lg h-96 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
