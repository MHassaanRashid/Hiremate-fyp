"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Search,
    Users,
    MapPinned,
    Mail,
    ArrowUpRight,
    ChevronRight,
    Sparkles,
    Brain,
    CheckCircle2,
    SearchX,
    FileText,
    CalendarCheck,
    X,
    Briefcase,
    Globe,
    Zap,
    Trophy,
    Layers,
    Cpu,
    Monitor,
    Database
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Candidate {
    id: string;
    name: string;
    email: string;
    location: string;
    summary: string;
    skills: any;
    avatar: string;
    title: string;
    has_resume: boolean;
    has_quiz: boolean;
    has_interview: boolean;
    quiz_count: number;
    interview_count: number;
}

const DOMAINS = [
    { value: "all", label: "All Domains", icon: Layers },
    { value: "frontend", label: "Frontend", icon: Monitor },
    { value: "backend", label: "Backend", icon: Database },
    { value: "ai", label: "AI / ML", icon: Cpu },
    { value: "fullstack", label: "Fullstack", icon: Zap },
    { value: "mobile", label: "Mobile Dev", icon: Globe },
];

export default function TalentPoolPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [domain, setDomain] = useState("all");
    const [filterResume, setFilterResume] = useState(false);
    const [filterQuiz, setFilterQuiz] = useState(false);
    const [filterInterview, setFilterInterview] = useState(false);

    useEffect(() => {
        fetchTalentPool();
    }, []);

    const filteredCandidates = useMemo(() => {
        let result = [...candidates];

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                (c.skills && JSON.stringify(c.skills).toLowerCase().includes(q)) ||
                c.title?.toLowerCase().includes(q)
            );
        }

        // Domain Filter
        if (domain !== "all") {
            const d = domain.toLowerCase();
            result = result.filter(c =>
                c.title?.toLowerCase().includes(d) ||
                c.summary?.toLowerCase().includes(d) ||
                (c.skills && JSON.stringify(c.skills).toLowerCase().includes(d))
            );
        }

        if (filterResume) result = result.filter(c => c.has_resume);
        if (filterQuiz) result = result.filter(c => c.has_quiz);
        if (filterInterview) result = result.filter(c => c.has_interview);

        // Recommendation Sorting Logic
        result.sort((a, b) => {
            const getScore = (c: Candidate) => {
                let score = 0;
                if (c.has_interview) score += 1000;
                if (c.has_quiz) score += 500;
                if (c.has_resume) score += 100;
                score += (c.quiz_count || 0) * 10;
                score += (c.interview_count || 0) * 50;
                return score;
            };
            return getScore(b) - getScore(a);
        });

        return result;
    }, [candidates, searchQuery, domain, filterResume, filterQuiz, filterInterview]);

    const fetchTalentPool = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("access_token");
            const res = await fetch("/api/jobs/company/talent-pool", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch talent pool");
            const data = await res.json();
            setCandidates(data);
        } catch (err) {
            console.error(err);
            toast.error("Could not load talent pool");
        } finally {
            setIsLoading(false);
        }
    };

    const getSkillName = (s: any) => {
        if (typeof s === 'string') return s;
        return s.name || s.title || s.label || "";
    };

    const resetFilters = () => {
        setSearchQuery("");
        setDomain("all");
        setFilterResume(false);
        setFilterQuiz(false);
        setFilterInterview(false);
    };

    return (
        <div className="min-h-screen relative p-4 md:p-8 font-sans text-slate-900 overflow-hidden bg-slate-50/30">
            <AnimatedBackground />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">

                {/* Impact Header Group */}
                <div className="text-center space-y-4 pt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-xs font-black uppercase tracking-widest shadow-sm">
                        <Trophy className="w-4 h-4" />
                        HireMate Certified Talent
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight italic">
                        The <span className="text-blue-600">Global</span> Reserve
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        Access our pre-vetted network of engineers, designers, and innovators. Built for speed, verified for excellence.
                    </p>
                </div>

                {/* Horizontal Glass Filter Bar */}
                <div className="sticky top-8 z-50">
                    <Card className="border-0 shadow-2xl shadow-blue-500/10 rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/40 overflow-hidden">
                        <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4">
                            {/* Global Search Component */}
                            <div className="relative flex-1 w-full lg:w-auto">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Search by name, tech stack, or expertise..."
                                    className="pl-14 pr-6 border-0 bg-white/50 focus-visible:ring-blue-600 h-16 text-lg font-bold rounded-[24px] shadow-sm placeholder:text-slate-400 placeholder:italic"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                {/* Domain Selector */}
                                <Select value={domain} onValueChange={setDomain}>
                                    <SelectTrigger className="w-full sm:w-[200px] h-16 rounded-[24px] border-0 bg-white shadow-sm font-black text-slate-700 italic px-6 focus:ring-blue-600">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-blue-500" />
                                            <SelectValue placeholder="Domain" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                        {DOMAINS.map((item) => (
                                            <SelectItem key={item.value} value={item.value} className="font-bold py-3 rounded-xl focus:bg-blue-50 focus:text-blue-600">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="w-4 h-4" />
                                                    {item.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Verification Pills */}
                                <div className="flex items-center gap-2 bg-slate-900/5 p-2 rounded-[24px] backdrop-blur-xl">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setFilterResume(!filterResume)}
                                        className={cn(
                                            "rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                                            filterResume ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-white text-slate-400"
                                        )}
                                    >
                                        Resume Ready
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setFilterQuiz(!filterQuiz)}
                                        className={cn(
                                            "rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                                            filterQuiz ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "hover:bg-white text-slate-400"
                                        )}
                                    >
                                        AI Vetting
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setFilterInterview(!filterInterview)}
                                        className={cn(
                                            "rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                                            filterInterview ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "hover:bg-white text-slate-400"
                                        )}
                                    >
                                        Interviewed
                                    </Button>
                                </div>

                                {/* Clear Filters */}
                                {(searchQuery || domain !== "all" || filterResume || filterQuiz || filterInterview) && (
                                    <Button
                                        variant="outline"
                                        onClick={resetFilters}
                                        className="h-16 w-16 rounded-[24px] border-0 bg-rose-50 hover:bg-rose-100 text-rose-600 shadow-sm"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Candidate Grid Section */}
                <div className="space-y-8 pb-32">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-600" />
                            <h2 className="text-2xl font-black text-slate-900 italic">Matching Candidates</h2>
                        </div>
                        <p className="text-slate-400 font-bold text-sm bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-100">
                            Found <span className="text-blue-600 font-black">{filteredCandidates.length}</span> Results
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="h-96 rounded-[40px]" />
                            ))}
                        </div>
                    ) : filteredCandidates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCandidates.map((cand) => {
                                const skills = Array.isArray(cand.skills) ? cand.skills : [];

                                return (
                                    <Link key={cand.id} href={`/company/talent-pool/${cand.id}`} className="group relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-[42px] blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                                        <Card className="relative h-full border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 rounded-[40px] overflow-hidden bg-white">
                                            {/* Top Status Gradient */}
                                            <div className={cn(
                                                "h-1.5 w-full",
                                                cand.has_quiz && cand.has_interview ? "bg-gradient-to-r from-emerald-500 to-blue-600" :
                                                    cand.has_quiz ? "bg-emerald-500" : "bg-slate-100"
                                            )} />

                                            <CardContent className="p-10 space-y-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative group/avatar">
                                                            <Avatar className="h-20 w-20 rounded-[28px] border-4 border-slate-50 shadow-2xl transition-all duration-500 group-hover/avatar:scale-110">
                                                                <AvatarImage src={cand.avatar} className="object-cover" />
                                                                <AvatarFallback className="bg-gradient-to-br from-slate-900 to-slate-700 text-white font-black text-3xl italic">
                                                                    {cand.name?.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {cand.has_quiz && (
                                                                <div className="absolute -top-2 -right-2 bg-emerald-500 p-2 rounded-xl text-white shadow-xl ring-4 ring-white">
                                                                    <Sparkles className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h3 className="text-2xl font-black text-slate-900 leading-none italic group-hover:text-blue-600 transition-colors">
                                                                {cand.name}
                                                            </h3>
                                                            <div className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                                                                <Briefcase className="w-3 h-3" />
                                                                {cand.title}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-slate-500 font-medium leading-relaxed italic line-clamp-2 h-12 text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {cand.summary || "Strategically curated profile representing deep technical expertise and professional growth."}
                                                </p>

                                                {/* Verification Micro-Dashboard */}
                                                <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 flex items-center justify-between">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <FileText className={cn("w-5 h-5", cand.has_resume ? "text-blue-500" : "text-slate-300")} />
                                                        <span className="text-[8px] font-black uppercase text-slate-400">Resume</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-200" />
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Brain className={cn("w-5 h-5", cand.has_quiz ? "text-emerald-500" : "text-slate-300")} />
                                                        <span className="text-[8px] font-black uppercase text-slate-400">Quizzes</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-200" />
                                                    <div className="flex flex-col items-center gap-1">
                                                        <CalendarCheck className={cn("w-5 h-5", cand.has_interview ? "text-amber-500" : "text-slate-300")} />
                                                        <span className="text-[8px] font-black uppercase text-slate-400">Interview</span>
                                                    </div>
                                                </div>

                                                {/* Skill Stack */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                                        <span>Tech Stack</span>
                                                        {skills.length > 3 && <span>+{skills.length - 3} Expertise</span>}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {skills.length > 0 ? skills.slice(0, 3).map((s: any, idx: number) => (
                                                            <Badge key={idx} variant="outline" className="bg-white border-slate-100 text-slate-600 font-bold text-[10px] py-1.5 px-3.5 rounded-xl transition-colors group-hover:border-blue-200 group-hover:bg-blue-50/50">
                                                                {getSkillName(s)}
                                                            </Badge>
                                                        )) : (
                                                            <p className="text-[10px] text-slate-300 italic">Self-taught specialist</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                                        <MapPinned className="w-3.5 h-3.5 text-blue-500" />
                                                        {cand.location}
                                                    </div>
                                                    <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center translate-x-4 group-hover:translate-x-0 transition-all duration-500 shadow-xl group-hover:bg-blue-600 opacity-0 group-hover:opacity-100">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border-2 border-dashed border-slate-200 p-24 text-center animate-in fade-in zoom-in duration-700 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                            <SearchX className="w-24 h-24 text-slate-200 mx-auto mb-8 animate-pulse" />
                            <h3 className="text-4xl font-black text-slate-900 mb-4 italic tracking-tight">Zero Network Hits</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-12 text-lg leading-relaxed">
                                Our global filters are quite precise. Try widening your search or domain parameters to discover fresh talent.
                            </p>
                            <Button
                                onClick={resetFilters}
                                className="bg-slate-900 hover:bg-blue-600 text-white font-black px-12 h-16 rounded-[24px] shadow-2xl transition-all hover:-translate-y-1 active:scale-95 border-0"
                            >
                                Reset Infrastructure
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
