"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import CandidateLayout from "@/layouts/CandidateLayout";
import {
  getApplications,
  bulkWithdrawApplications,
  exportApplications,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/lib/api/applications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  Briefcase,
  Building2,
  Clock,
  FileDown,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Eye,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All Applications", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Viewed", value: "viewed" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Interview", value: "interview" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
];

function getStatusBadgeClasses(status: ApplicationStatus): string {
  const base = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border capitalize";
  switch (status) {
    case "applied":
    case "pending":
      return cn(base, "bg-blue-50 text-blue-700 border-blue-200");
    case "viewed":
    case "reviewing":
      return cn(base, "bg-indigo-50 text-indigo-700 border-indigo-200");
    case "shortlisted":
      return cn(base, "bg-emerald-50 text-emerald-700 border-emerald-200");
    case "interview":
      return cn(base, "bg-purple-50 text-purple-700 border-purple-200");
    case "offer":
      return cn(base, "bg-amber-50 text-amber-700 border-amber-200");
    case "accepted":
      return cn(base, "bg-green-50 text-green-700 border-green-200");
    case "withdrawn":
    case "archived":
      return cn(base, "bg-slate-50 text-slate-600 border-slate-200");
    case "rejected":
    default:
      return cn(base, "bg-rose-50 text-rose-700 border-rose-200");
  }
}

function formatRelativeDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CandidateApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [sort] = useState<"newest" | "oldest">("newest");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchApplications = async () => {
    if (authLoading || !user || !isMounted.current) return;
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please sign in to view your applications.");
        return;
      }

      const params: any = {
        page,
        pageSize,
        sort,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeStatus !== "all") params.status = [activeStatus];

      console.log("Fetching applications with params:", params);
      const data = await getApplications(token, params);
      console.log("Applications response:", data);
      console.log("Applications array:", data.items);
      console.log("Applications length:", data.items?.length);
      console.log("First application:", data.items?.[0]);

      if (isMounted.current) {
        setApplications(data.items || []);
        setTotal(data.meta?.total || 0);
        setTotalPages(data.meta?.totalPages || 1);
        setStatusCounts(data.meta?.statusCounts || {});

        console.log("State updated - applications count:", data.items?.length || 0);
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      if (isMounted.current) {
        setError(err.message || "Failed to load applications.");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, pageSize, debouncedSearch, activeStatus, sort, authLoading, user]);

  const stats = useMemo(() => {
    // Calculate total from all status counts (not filtered total)
    const totalApps = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const inProgress = (statusCounts.pending || 0) + (statusCounts.applied || 0) + (statusCounts.viewed || 0) + (statusCounts.shortlisted || 0) + (statusCounts.interview || 0);
    const accepted = statusCounts.accepted || 0;
    const rejected = statusCounts.rejected || 0;
    return { totalApps, inProgress, accepted, rejected };
  }, [statusCounts]);

  const handleBulkWithdraw = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      await bulkWithdrawApplications(token, Array.from(selectedIds));
      toast.success(`Withdrew ${selectedIds.size} application(s)`);
      setSelectedIds(new Set());
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw applications");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      const csvText = await exportApplications(token);
      const blob = new Blob([csvText], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Applications exported successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to export applications");
    }
  };

  if (authLoading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8 relative">
        <AnimatedBackground />
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">

          {/* Professional Header Card */}
          <Card className="border-0 shadow-xl bg-white overflow-hidden">
            <CardContent className="p-0">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      My Applications
                    </h1>
                    <p className="text-blue-100">
                      Track and manage all your job applications in one place
                    </p>
                  </div>
                  <Button
                    onClick={handleExport}
                    className="bg-white hover:bg-blue-50 text-blue-600 h-11 px-6 rounded-xl shadow-lg font-semibold self-start md:self-center"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-100">
                {/* Total Applications */}
                <div className="p-6 border-r border-b md:border-b-0 border-slate-100 hover:bg-gradient-to-br hover:from-blue-50 hover:to-transparent transition-all group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalApps}</p>
                      <p className="text-sm text-slate-600 font-semibold">Total</p>
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="p-6 border-r md:border-r-0 lg:border-r border-slate-100 hover:bg-gradient-to-br hover:from-amber-50 hover:to-transparent transition-all group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{stats.inProgress}</p>
                      <p className="text-sm text-slate-600 font-semibold">In Progress</p>
                    </div>
                  </div>
                </div>

                {/* Accepted */}
                <div className="p-6 border-r border-slate-100 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-transparent transition-all group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{stats.accepted}</p>
                      <p className="text-sm text-slate-600 font-semibold">Accepted</p>
                    </div>
                  </div>
                </div>

                {/* Rejected */}
                <div className="p-6 hover:bg-gradient-to-br hover:from-rose-50 hover:to-transparent transition-all group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{stats.rejected}</p>
                      <p className="text-sm text-slate-600 font-semibold">Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search & Filters */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by job title or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 border-slate-200 rounded-lg">
                        <Filter className="w-4 h-4 mr-2" />
                        {STATUS_FILTERS.find(f => f.value === activeStatus)?.label || "Filter"}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {STATUS_FILTERS.map((filter) => (
                        <DropdownMenuItem
                          key={filter.value}
                          onClick={() => setActiveStatus(filter.value)}
                          className={cn(
                            "cursor-pointer",
                            activeStatus === filter.value && "bg-blue-50 text-blue-700"
                          )}
                        >
                          {filter.label}
                          {statusCounts[filter.value] !== undefined && (
                            <span className="ml-auto text-xs text-slate-500">
                              {statusCounts[filter.value]}
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="h-10 border-slate-200"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {selectedIds.size > 0 && (
                <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedIds.size} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds(new Set())}
                      className="border-blue-200 h-8"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkWithdraw}
                      disabled={isBulkLoading}
                      className="h-8"
                    >
                      {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Withdraw"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Applications</h3>
                <p className="text-slate-600">{error}</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-16 text-center">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
                <p className="text-slate-500 mb-6">Start applying to jobs to see them here</p>
                <Button
                  onClick={() => window.location.href = '/candidate/find-jobs'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Browse Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  isSelected={selectedIds.has(app.id)}
                  onToggleSelect={(id) => {
                    const newSet = new Set(selectedIds);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    setSelectedIds(newSet);
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="flex items-center px-4 text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </CandidateLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number;
  color: 'blue' | 'amber' | 'emerald' | 'rose';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose: 'from-rose-500 to-rose-600',
  };

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm flex-shrink-0",
            colorClasses[color]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-600 font-medium">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationCard({ application, isSelected, onToggleSelect }: {
  application: ApplicationListItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all group bg-white">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(application.id)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
            {application.jobTitle?.charAt(0) || 'J'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                  {application.jobTitle}
                </h3>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {application.company}
                </p>
              </div>
              <Badge className={getStatusBadgeClasses(application.status)}>
                {application.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Applied {formatRelativeDate(application.appliedDate)}
              </span>
              {application.lastUpdatedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Updated {formatRelativeDate(application.lastUpdatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
