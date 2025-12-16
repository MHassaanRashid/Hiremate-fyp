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
  MapPin,
  Sparkles
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
      <CandidateLayout>
        <div className="min-h-screen bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-card border border-border shadow-sm p-5 flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              ))}
            </section>

            <ApplicationsSkeleton />
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
              <p className="mt-1 text-muted-foreground">
                Track your job applications, stay on top of next steps, and manage your pipeline.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                  <Briefcase className="w-4 h-4 mr-1.5" />
                  {total} applications
                </span>
              </div>
              <Link href="/homepage" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto gap-2 shadow-sm">
                  Find New Jobs
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </header>

          {/* Stats overview */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-card border border-border shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Applications</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">In Progress</p>
                <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{inProgressCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Accepted</p>
                  <p className="text-base font-bold text-green-600 dark:text-green-400">{acceptedCount}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Rejected</p>
                  <p className="text-base font-bold text-red-600 dark:text-red-400">{rejectedCount}</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="w-6 h-6 text-muted-foreground" />
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
                  className="h-9 w-full rounded-md border border-input bg-background/50 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  aria-label="Sort applications"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-1 rounded-md border border-border">
                  <span className="pl-1">Applied:</span>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="h-7 w-28 border-border bg-background text-xs"
                  />
                  <span>to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="h-7 w-28 border-border bg-background text-xs"
                  />
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear text
                  </Button>
                )}
              </div>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setActiveStatus(f.value);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 hover:shadow-sm",
                    activeStatus === f.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                      : f.color || "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:border-primary/20"
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
              <div className="space-y-4">
                {applications.map((app) => {
                  const pipelineIndex = PIPELINE_STAGES.findIndex(
                    (s) => s.key === app.pipelineStage
                  );
                  return (
                    <article
                      key={app.id}
                      className="rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      <div className="flex flex-col gap-4 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex flex-1 gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {app.company?.charAt(0) || "?"}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
                                <span>{app.jobTitle}</span>
                                <Badge className={getStatusBadgeClasses(app.status)}>
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </Badge>
                              </h2>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Building2 className="w-3.5 h-3.5" />
                                {app.company}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground pt-1">
                                <span className="inline-flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                                  Applied {formatDate(app.appliedDate)}
                                </span>
                                {app.lastUpdatedAt && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 opacity-70" />
                                    Updated {formatRelativeDate(app.lastUpdatedAt)}
                                  </span>
                                )}
                                {app.location && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 opacity-70" />
                                    {app.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 md:gap-4 pl-12 md:pl-0">
                            <label className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
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
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full"
                              aria-expanded={expandedId === app.id}
                            >
                              Details
                              <ChevronDown
                                className={cn(
                                  "w-3.5 h-3.5 transition-transform duration-200",
                                  expandedId === app.id && "rotate-180"
                                )}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Pipeline visualization */}
                        <div className="mt-2 pl-0 md:pl-16">
                          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {PIPELINE_STAGES.map((stage, index) => {
                              const isPast = pipelineIndex > -1 && index <= pipelineIndex;
                              const isCurrent = pipelineIndex === index;
                              return (
                                <div key={stage.key} className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex flex-col items-center min-w-[72px]">
                                    <div
                                      className={cn(
                                        "h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-colors",
                                        isPast
                                          ? "bg-primary border-primary text-primary-foreground"
                                          : "bg-muted border-border text-muted-foreground"
                                      )}
                                      aria-label={`Stage ${stage.label}`}
                                    >
                                      {index + 1}
                                    </div>
                                    <span className={cn(
                                      "mt-1.5 text-[10px] whitespace-nowrap font-medium transition-colors",
                                      isPast ? "text-primary" : "text-muted-foreground"
                                    )}>
                                      {stage.label}
                                    </span>
                                  </div>
                                  {index < PIPELINE_STAGES.length - 1 && (
                                    <div
                                      className={cn(
                                        "h-0.5 w-8 rounded-full transition-colors",
                                        index < pipelineIndex
                                          ? "bg-primary"
                                          : "bg-border"
                                      )}
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {app.nextStep && (
                            <p className="mt-2 text-xs font-medium text-primary bg-primary/10 inline-flex px-3 py-1 rounded-full items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              Next step: {app.nextStep}
                            </p>
                          )}
                        </div>

                        {/* Expanded details */}
                        {expandedId === app.id && (
                          <div className="mt-3 border-t border-border pt-4 text-sm grid gap-6 md:grid-cols-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="md:col-span-2 space-y-3">
                              <p className="font-semibold text-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Application Timeline
                              </p>
                              <ul className="space-y-4 relative pl-2 ml-1 border-l border-border/50">
                                <li className="flex items-start gap-3 relative">
                                  <div className="absolute -left-[13px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                                  <div>
                                    <p className="font-medium text-foreground text-sm">Application Received</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {formatDate(app.appliedDate)}
                                    </p>
                                  </div>
                                </li>
                                {app.lastUpdatedAt && (
                                  <li className="flex items-start gap-3 relative">
                                    <div className="absolute -left-[13px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                                    <div>
                                      <p className="font-medium text-foreground text-sm">
                                        Status updated to <span className="capitalize">{app.status}</span>
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatDate(app.lastUpdatedAt)} ({formatRelativeDate(app.lastUpdatedAt)})
                                      </p>
                                    </div>
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <p className="font-semibold text-foreground flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-primary" />
                                Actions
                              </p>
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-between border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                  onClick={() => {
                                    setSelectedIds(new Set([app.id]));
                                    performBulkAction("withdraw");
                                  }}
                                >
                                  Withdraw application
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-between"
                                  onClick={() => {
                                    setSelectedIds(new Set([app.id]));
                                    performBulkAction("archive");
                                  }}
                                >
                                  Archive
                                  <ChevronDown className="w-3.5 h-3.5" />
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
            <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                <span>
                  Page {page} of {totalPages}
                </span>
                <span className="hidden sm:inline w-px h-4 bg-border mx-1" />
                <span className="hidden sm:inline">
                  Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, total)} of {total} applications
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                  <span>Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    className="h-9 w-9"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
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
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="rounded-xl bg-card border border-border p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 w-full">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 w-full max-w-md">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function EmptyApplicationsState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
      <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
        <Briefcase className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">No applications yet</h2>
      <p className="mt-2 max-w-md text-muted-foreground leading-relaxed">
        Start applying to jobs that match your profile. Track your applications and pipeline stages here.
      </p>
      <Link href="/homepage" className="mt-8">
        <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
          Browse Open Positions
          <ArrowUpRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Tip: Complete your profile to get matched with better opportunities.</span>
      </div>
    </div>
  );
}
