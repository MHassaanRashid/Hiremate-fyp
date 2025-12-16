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
} from "lucide-react";
import Link from "next/link";

const STATUS_FILTERS: { label: string; value: string; color: string }[] = [
  { label: "All", value: "all", color: "" },
  { label: "Applied", value: "applied", color: "bg-blue-50 text-blue-700" },
  { label: "Viewed", value: "viewed", color: "bg-indigo-50 text-indigo-700" },
  { label: "Shortlisted", value: "shortlisted", color: "bg-emerald-50 text-emerald-700" },
  { label: "Interview", value: "interview", color: "bg-purple-50 text-purple-700" },
  { label: "Accepted", value: "accepted", color: "bg-green-50 text-green-700" },
  { label: "Rejected", value: "rejected", color: "bg-red-50 text-red-700" },
];

const PIPELINE_STAGES: { key: string; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "viewed", label: "Viewed" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "accepted", label: "Accepted" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// Map backend status and pipelineStage into UI badge styles
function getStatusBadgeClasses(status: ApplicationStatus): string {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border";
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
      return cn(base, "bg-red-50 text-red-700 border-red-200");
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
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
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch applications whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        setError("Please login to view your applications.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const statusValues =
          activeStatus === "all" ? undefined : [activeStatus.toLowerCase()];

        const data = await getApplications(token, {
          page,
          pageSize,
          search: debouncedSearch || undefined,
          status: statusValues,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sort,
        });

        setApplications(data.items || []);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages || 1);
        setStatusCounts(data.meta.statusCounts || {});
        setSelectedIds(new Set());
      } catch (err: any) {
        console.error("Error loading applications", err);
        setError(err?.message || "Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading, page, pageSize, debouncedSearch, activeStatus, dateFrom, dateTo, sort]);

  const hasActiveFilters = useMemo(
    () => !!debouncedSearch || activeStatus !== "all" || !!dateFrom || !!dateTo || sort !== "newest",
    [debouncedSearch, activeStatus, dateFrom, dateTo, sort]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setActiveStatus("all");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const performBulkAction = async (type: "withdraw" | "archive") => {
    if (selectedIds.size === 0) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setError("Please login to manage your applications.");
      return;
    }

    try {
      setIsBulkLoading(true);
      const ids = Array.from(selectedIds);
      if (type === "withdraw") {
        await bulkWithdrawApplications(token, ids);
      } else {
        await bulkArchiveApplications(token, ids);
      }

      // Optimistically update UI
      setApplications((prev) =>
        prev.map((a) =>
          selectedIds.has(a.id)
            ? { ...a, status: type === "withdraw" ? "withdrawn" : "archived" }
            : a
        )
      );

      // Optionally refetch counts after bulk update
      setPage(1);
    } catch (err: any) {
      console.error("Bulk action failed", err);
      setError(err?.message || "Bulk action failed.");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const inProgressCount = useMemo(() => {
    const mapKeys = ["applied", "pending", "reviewing", "viewed", "shortlisted", "interview"];
    return mapKeys.reduce((acc, key) => acc + (statusCounts[key] || 0), 0);
  }, [statusCounts]);

  const acceptedCount = statusCounts["accepted"] || 0;
  const rejectedCount = statusCounts["rejected"] || 0;

  // Authentication guard
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track your job applications, stay on top of next steps, and manage your pipeline.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {total} applications
                </span>
              </div>
              <Link href="/homepage" className="w-full sm:w-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-500/30">
                  Find New Jobs
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </header>

          {/* Stats overview */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/90 border border-blue-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Total Applications</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="rounded-2xl bg-white/90 border border-emerald-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">In Progress</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">{inProgressCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="rounded-2xl bg-white/90 border border-slate-100 shadow-sm p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Accepted</p>
                  <p className="text-sm font-semibold text-green-600">{acceptedCount}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Rejected</p>
                  <p className="text-sm font-semibold text-red-600">{rejectedCount}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </section>

          {/* Filter + bulk actions bar */}
          <section className="space-y-3">
            {/* Search + filters */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by job title or company"
                    className="pl-9 bg-white/90 border-blue-100 focus-visible:ring-blue-500"
                    aria-label="Search applications by job title or company"
                  />
                </div>
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2 border-blue-100 text-gray-700"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as "newest" | "oldest");
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-blue-100 bg-white/90 px-3 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Sort applications"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>Applied from</span>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 w-32 border-blue-100 bg-white/90 text-xs"
                  />
                  <span>to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 w-32 border-blue-100 bg-white/90 text-xs"
                  />
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 text-xs text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setActiveStatus(f.value);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                    activeStatus === f.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30"
                      : f.color || "bg-white/80 text-gray-600 border-blue-100 hover:bg-blue-50"
                  )}
                  aria-pressed={activeStatus === f.value}
                >
                  {f.label}
                  {f.value !== "all" && statusCounts[f.value] != null && (
                    <span className="ml-1 text-[10px] opacity-80">{statusCounts[f.value] || 0}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    checked={applications.length > 0 && selectedIds.size === applications.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all applications on this page"
                  />
                  Select all
                </label>
                <span className="text-xs text-gray-500">
                  {selectedIds.size} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.size === 0 || isBulkLoading}
                  onClick={() => performBulkAction("withdraw")}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  {isBulkLoading ? (
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  ) : (
                    <X className="w-3 h-3 mr-2" />
                  )}
                  Withdraw selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.size === 0 || isBulkLoading}
                  onClick={() => performBulkAction("archive")}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Archive selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                  onClick={() => {
                    // export is handled by separate button; here we just show hint
                    document.getElementById("applications-export-trigger")?.click();
                  }}
                >
                  <FileDown className="w-3 h-3" />
                  Export
                </Button>
              </div>
            </div>
          </section>

          {/* Error banner */}
          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Applications list */}
          <section aria-live="polite" aria-busy={isLoading} className="space-y-4">
            {isLoading ? (
              <ApplicationsSkeleton />
            ) : applications.length === 0 ? (
              <EmptyApplicationsState />
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const pipelineIndex = PIPELINE_STAGES.findIndex(
                    (s) => s.key === app.pipelineStage
                  );
                  return (
                    <article
                      key={app.id}
                      className="rounded-2xl bg-white/95 border border-blue-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="flex flex-col gap-3 p-4 md:p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="flex flex-1 gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-semibold">
                                {app.company?.charAt(0) || "?"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <h2 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                                <span>{app.jobTitle}</span>
                                <Badge className={getStatusBadgeClasses(app.status)}>
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </Badge>
                              </h2>
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {app.company}
                              </p>
                              <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Applied {formatDate(app.appliedDate)}
                                </span>
                                {app.lastUpdatedAt && (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Updated {formatRelativeDate(app.lastUpdatedAt)}
                                  </span>
                                )}
                                {app.location && <span>{app.location}</span>}
                                {app.employmentType && <span>{app.employmentType}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 md:gap-4">
                            <label className="mt-1 inline-flex items-center gap-2 text-xs text-gray-500">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedIds.has(app.id)}
                                onChange={() => toggleSelectOne(app.id)}
                                aria-label={`Select application for ${app.jobTitle} at ${app.company}`}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId((prev) => (prev === app.id ? null : app.id))
                              }
                              className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900"
                              aria-expanded={expandedId === app.id}
                            >
                              View details
                              <ChevronDown
                                className={cn(
                                  "w-3 h-3 transition-transform",
                                  expandedId === app.id && "rotate-180"
                                )}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Pipeline visualization */}
                        <div className="mt-2">
                          <div className="flex items-center gap-2 overflow-x-auto">
                            {PIPELINE_STAGES.map((stage, index) => {
                              const isPast = pipelineIndex > -1 && index <= pipelineIndex;
                              const isCurrent = pipelineIndex === index;
                              return (
                                <div key={stage.key} className="flex items-center gap-2">
                                  <div className="flex flex-col items-center min-w-[72px]">
                                    <div
                                      className={cn(
                                        "h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-semibold",
                                        isPast
                                          ? "bg-blue-600 border-blue-600 text-white"
                                          : "bg-white border-blue-100 text-blue-500"
                                      )}
                                      aria-label={`Stage ${stage.label}`}
                                    >
                                      {index + 1}
                                    </div>
                                    <span className="mt-1 text-[10px] text-gray-600 whitespace-nowrap">
                                      {stage.label}
                                    </span>
                                  </div>
                                  {index < PIPELINE_STAGES.length - 1 && (
                                    <div
                                      className={cn(
                                        "h-0.5 w-8 rounded-full",
                                        index < pipelineIndex
                                          ? "bg-blue-500"
                                          : "bg-blue-100"
                                      )}
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {app.nextStep && (
                            <p className="mt-2 text-[11px] text-blue-800 bg-blue-50/70 inline-flex px-2 py-1 rounded-full">
                              Next step: {app.nextStep}
                            </p>
                          )}
                        </div>

                        {/* Expanded details */}
                        {expandedId === app.id && (
                          <div className="mt-3 border-t border-blue-50 pt-3 text-xs text-gray-700 grid gap-3 md:grid-cols-3">
                            <div className="md:col-span-2 space-y-2">
                              <p className="font-medium text-gray-900">Application timeline</p>
                              <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                  <div>
                                    <p className="text-xs text-gray-800">Applied</p>
                                    <p className="text-[11px] text-gray-500">
                                      {formatDate(app.appliedDate)}
                                    </p>
                                  </div>
                                </li>
                                {app.lastUpdatedAt && (
                                  <li className="flex items-start gap-2">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                                    <div>
                                      <p className="text-xs text-gray-800">
                                        Status updated to {app.status}
                                      </p>
                                      <p className="text-[11px] text-gray-500">
                                        {formatDate(app.lastUpdatedAt)} ({formatRelativeDate(app.lastUpdatedAt)})
                                      </p>
                                    </div>
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <p className="font-medium text-gray-900">Actions</p>
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-between border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedIds(new Set([app.id]));
                                    performBulkAction("withdraw");
                                  }}
                                >
                                  Withdraw application
                                  <X className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-between border-slate-200 text-slate-700 hover:bg-slate-50"
                                  onClick={() => {
                                    setSelectedIds(new Set([app.id]));
                                    performBulkAction("archive");
                                  }}
                                >
                                  Archive
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pagination */}
          {applications.length > 0 && (
            <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-2 border-t border-blue-50">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>
                  Page {page} of {totalPages}
                </span>
                <span className="hidden sm:inline">
                  Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, total)} of {total} applications
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span>Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-8 rounded-md border border-blue-100 bg-white/90 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="inline-flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-blue-100"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-blue-100"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Hidden export trigger used by the Export button */}
          <button
            id="applications-export-trigger"
            type="button"
            className="hidden"
            onClick={async () => {
              const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
              if (!token) {
                setError("Please login to export your applications.");
                return;
              }
              try {
                const csv = await exportApplications(token, "csv");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "applications.csv");
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
              } catch (err: any) {
                setError(err?.message || "Failed to export applications.");
              }
            }}
          />
        </div>
      </div>
    </CandidateLayout>
  );
}

function ApplicationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl bg-white/90 border border-blue-50 p-4 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyApplicationsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Briefcase className="w-10 h-10 text-blue-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">You haven&apos;t applied to any jobs yet</h2>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        Once you start applying through HireMate, all your applications will appear here so you can
        track their status in one place.
      </p>
      <Link href="/homepage" className="mt-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          Browse Jobs
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </Link>
      <div className="mt-4 max-w-md text-xs text-gray-500">
        Tip: Tailor your resume to each job and keep your profile up to date to increase your
        chances of getting shortlisted.
      </div>
    </div>
  );
}
