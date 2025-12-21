"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import CandidateLayout from "@/layouts/CandidateLayout";
import {
  getApplications,
  bulkWithdrawApplications,
  bulkArchiveApplications,
  exportApplications,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/lib/api/applications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  X,
  Briefcase,
  Building2,
  Clock,
  ArrowUpRight,
  FileDown,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Mail,
  Trash2,
  Sparkles,
  ArrowRight,
  Target,
  Trophy,
  Eye,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

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
      return cn(base, "bg-blue-100 text-blue-700 border-blue-200");
    case "viewed":
    case "reviewing":
      return cn(base, "bg-indigo-100 text-indigo-700 border-indigo-200");
    case "shortlisted":
      return cn(base, "bg-emerald-100 text-emerald-700 border-emerald-200");
    case "interview":
      return cn(base, "bg-purple-100 text-purple-700 border-purple-200");
    case "offer":
      return cn(base, "bg-amber-100 text-amber-700 border-amber-200");
    case "accepted":
      return cn(base, "bg-green-100 text-green-700 border-green-200");
    case "withdrawn":
    case "archived":
      return cn(base, "bg-slate-100 text-slate-600 border-slate-200");
    case "rejected":
    default:
      return cn(base, "bg-rose-100 text-rose-700 border-rose-200");
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
  return `${days}d ago`;
}

export default function CandidateApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchApplications = async () => {
    if (authLoading || !user) return;
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
        page_size: pageSize,
        sort_by: sort === "newest" ? "created_at" : "created_at",
        sort_order: sort === "newest" ? "desc" : "asc",
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeStatus !== "all") params.status = activeStatus;

      const data = await getApplications(token, params);
      setApplications(data.applications || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setStatusCounts(data.status_counts || {});
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.message || "Failed to load applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, pageSize, debouncedSearch, activeStatus, sort, authLoading, user]);

  const stats = useMemo(() => {
    const totalApps = statusCounts.all || 0;
    const inProgress = (statusCounts.applied || 0) + (statusCounts.viewed || 0) + (statusCounts.shortlisted || 0);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              My Applications
            </h1>
            <p className="text-slate-600 text-lg">
              Track and manage your job applications
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={Briefcase}
              label="Total Applications"
              value={stats.totalApps}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="In Progress"
              value={stats.inProgress}
              color="amber"
            />
            <StatCard
              icon={CheckCircle2}
              label="Accepted"
              value={stats.accepted}
              color="emerald"
            />
            <StatCard
              icon={AlertCircle}
              label="Rejected"
              value={stats.rejected}
              color="rose"
            />
          </div>

          {/* Filters & Actions */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Search by job title or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-slate-200"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-12 border-slate-200">
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
                    onClick={handleExport}
                    className="h-12 border-slate-200"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {selectedIds.size > 0 && (
                <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedIds.size} application(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds(new Set())}
                      className="border-blue-200"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkWithdraw}
                      disabled={isBulkLoading}
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
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Applications</h3>
                <p className="text-slate-600">{error}</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-12 text-center">
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
            <div className="space-y-4">
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
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} applications
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
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
            colorClasses[color]
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-sm text-slate-600 font-medium">{label}</p>
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
    <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(application.id)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
            {application.job_title?.charAt(0) || 'J'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                  {application.job_title}
                </h3>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {application.company_name}
                </p>
              </div>
              <Badge className={getStatusBadgeClasses(application.status)}>
                {application.status}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied {formatRelativeDate(application.applied_at)}
              </span>
              {application.last_updated && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {formatRelativeDate(application.last_updated)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
