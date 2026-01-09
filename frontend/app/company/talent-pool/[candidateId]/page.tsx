"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    MapPin,
    FileText,
    Brain,
    Video,
    Calendar,
    Star,
    ExternalLink,
    MapPinned,
    Phone,
    Briefcase,
    GraduationCap,
    Award,
    Code2,
    CheckCircle2,
    Sparkles,
    Download,
    Eye,
    Github,
    Linkedin,
    Globe,
    SearchX,
    Clock,
    UserCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { cn } from "@/lib/utils";
import toast from 'react-hot-toast';

export default function CandidateProfilePage() {
    const { candidateId } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * UNIVERSAL DEEP EXTRACTOR
     */
    const deepExtract = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) {
            let results: any[] = [];
            data.forEach(item => {
                results = results.concat(deepExtract(item));
            });
            return results;
        }
        if (typeof data === 'object' && data !== null && data.items) {
            return deepExtract(data.items);
        }
        if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            if (keys.length === 1 && keys[0] === 'items') return [];
            return [data];
        }
        return [data];
    };

    const getSkillName = (s: any) => {
        if (typeof s === 'string') return s;
        return s?.name || s?.title || "";
    };

    const fetchCandidateDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("access_token");
            const res = await fetch(`/api/jobs/company/candidates/${candidateId}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch candidate details");
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
            toast.error("Could not load candidate profile");
        } finally {
            setIsLoading(false);
        }
    }, [candidateId]);

    useEffect(() => {
        if (candidateId) {
            fetchCandidateDetails();
        }
    }, [candidateId, fetchCandidateDetails]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-10 space-y-8 animate-in fade-in duration-500">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Skeleton className="h-[400px] w-full rounded-[40px]" />
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-[600px] w-full rounded-[40px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!data?.profile) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-4">
                    <SearchX className="h-10 w-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 italic">Candidate not found</h2>
                <Button onClick={() => router.back()} variant="outline" className="rounded-xl">Go Back</Button>
            </div>
        );
    }

    const { profile, resume, quizzes, applications } = data;

    const experiences = deepExtract(resume?.experience_json);
    const education = deepExtract(resume?.education_json);
    const skills = deepExtract(resume?.skills_json || profile?.skills);
    const projects = deepExtract(resume?.projects_json);
    const certificates = deepExtract(resume?.certificates_json);

    return (
        <div className="min-h-screen relative p-6 md:p-10 font-sans text-slate-900">
            <AnimatedBackground />
            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-2 hover:bg-white/50 text-slate-500 font-bold transition-all rounded-2xl px-4"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Pool
                    </Button>
                    <div className="flex items-center gap-3">
                        {resume && (
                            <Button
                                variant="outline"
                                className="rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm font-bold px-6 h-12 shadow-sm"
                                onClick={() => window.open(`/candidate/resume/view/${profile.id}`, '_blank')}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download CV
                            </Button>
                        )}
                        <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-black px-8 h-12 shadow-xl shadow-blue-500/20 active:scale-95 transition-transform">
                            Contact {profile.full_name?.split(' ')[0]}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Essential Info */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Profile Summary Card */}
                        <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white/90 backdrop-blur-xl border border-white/40">
                            <CardContent className="p-10 text-center space-y-8">
                                <div className="relative inline-block group">
                                    <Avatar className="h-40 w-40 rounded-[40px] border-8 border-white shadow-2xl mx-auto transform transition-transform duration-500 group-hover:scale-105">
                                        <AvatarImage src={profile.avatar_url} className="object-cover" />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white font-black text-5xl italic">
                                            {profile.full_name?.charAt(0) || "C"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-2xl border-4 border-white shadow-lg ring-8 ring-green-500/10" />
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic">{profile.full_name}</h1>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                        {experiences[0]?.position || "Modern Talent"} • {experiences[0]?.company || "HireMate Network"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-3xl bg-blue-50/50 border border-blue-100/50">
                                        <p className="text-blue-600 font-black text-xl leading-none mb-1">{profile.ai_score || 0}%</p>
                                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none">AI Match</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-emerald-50/50 border border-emerald-100/50">
                                        <p className="text-emerald-600 font-black text-xl leading-none mb-1">{quizzes?.length || 0}</p>
                                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest leading-none">AI Tests</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-50 text-left">
                                    <div className="flex items-center gap-4 text-slate-500 font-medium group cursor-pointer hover:text-blue-600 transition-colors">
                                        <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50">
                                            <Mail className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <span className="truncate text-sm">{profile.email}</span>
                                    </div>
                                    {profile.location && (
                                        <div className="flex items-center gap-4 text-slate-500 font-medium">
                                            <div className="p-2.5 rounded-xl bg-slate-50">
                                                <MapPinned className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <span className="text-sm">{profile.location}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Application History Check */}
                        {applications && applications.length > 0 && (
                            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-8">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2 italic">
                                        <Clock className="w-5 h-5 text-blue-500" />
                                        Internal Engagement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {applications.map((app: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black text-slate-900 truncate italic">{app.jobs?.job_title || app.job_title}</p>
                                                <Badge className={cn(
                                                    "text-[8px] font-black tracking-widest border-0 p-1",
                                                    app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                                                        app.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                                )}>
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(app.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Detailed Tabs */}
                    <div className="lg:col-span-8">
                        <Tabs defaultValue="overview" className="space-y-8">
                            <TabsList className="bg-slate-100/50 p-1.5 rounded-[24px] h-auto border border-slate-200/50 shadow-inner w-full sm:w-auto">
                                <TabsTrigger value="overview" className="rounded-2xl px-8 py-3.5 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all uppercase tracking-wider flex-1 sm:flex-none">
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="assessments" className="rounded-2xl px-8 py-3.5 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all uppercase tracking-wider flex-1 sm:flex-none">
                                    Assessments
                                </TabsTrigger>
                                <TabsTrigger value="resume" className="rounded-2xl px-8 py-3.5 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all uppercase tracking-wider flex-1 sm:flex-none">
                                    Full Resume
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500 outline-none">
                                {/* Professional Summary */}
                                <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-10">
                                    <CardHeader className="p-0 mb-6 border-b border-slate-50 pb-6">
                                        <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
                                            <Sparkles className="w-6 h-6 text-blue-500" />
                                            Executive Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <p className="text-slate-600 text-lg font-medium leading-relaxed italic opacity-90">
                                            {profile.summary || "This candidate chose to let their professional work and assessments speak for themselves, currently focusing on pure technical excellence."}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Skills Grid */}
                                {skills.length > 0 && (
                                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-10">
                                        <CardHeader className="p-0 mb-8">
                                            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                Verified Core Competencies
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="flex flex-wrap gap-3">
                                                {skills.map((s: any, idx: number) => {
                                                    const name = getSkillName(s);
                                                    if (!name) return null;
                                                    return (
                                                        <Badge key={idx} variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-100 text-sm py-2 px-4 rounded-xl font-bold transition-all hover:bg-emerald-100 hover:scale-105 shadow-sm">
                                                            {name}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="assessments" className="space-y-8 animate-in fade-in duration-500 outline-none">
                                {quizzes && quizzes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {quizzes.map((quiz: any, idx: number) => (
                                            <Card key={idx} className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white overflow-hidden group hover:-translate-y-1 transition-all duration-500">
                                                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                                                <CardContent className="p-8 space-y-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic">{quiz.language || quiz.test_type}</h4>
                                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{new Date(quiz.completed_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-black text-blue-600 italic leading-none">{Math.round(quiz.score_percentage || 0)}%</span>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Score</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-5">
                                                        {quiz.ai_feedback && (
                                                            <p className="text-xs text-slate-600 italic bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 line-clamp-2">
                                                                "{quiz.ai_feedback}"
                                                            </p>
                                                        )}

                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { label: "Stability", val: quiz.ai_code_quality_score, color: "text-blue-600" },
                                                                { label: "Complexity", val: quiz.ai_problem_solving_score, color: "text-purple-600" },
                                                                { label: "Velocity", val: quiz.ai_efficiency_score, color: "text-emerald-600" }
                                                            ].map((m, i) => (
                                                                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center transition-colors group-hover:bg-white">
                                                                    <p className="text-[8px] text-slate-400 font-black uppercase mb-1">{m.label}</p>
                                                                    <p className={cn("text-base font-black", m.color)}>{m.val || 0}<span className="text-[10px] opacity-30 text-slate-500">/5</span></p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-2xl border-slate-200 font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all h-12 shadow-sm"
                                                        onClick={() => window.open(`/company/assessments/${quiz.id}/report`, '_blank')}
                                                    >
                                                        Mastery Report
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-20 text-center space-y-6">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto rotate-6">
                                            <Brain className="w-12 h-12 text-slate-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-slate-900 italic">Technical Verification Missing</h3>
                                            <p className="text-slate-500 font-medium">This candidate hasn't undergone AI-verified technical assessments yet.</p>
                                        </div>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="resume" className="space-y-8 animate-in fade-in duration-500 outline-none">
                                <div className="space-y-8">
                                    {/* Experience section */}
                                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-10">
                                        <CardHeader className="p-0 mb-8">
                                            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
                                                <Briefcase className="w-6 h-6 text-amber-500" />
                                                Professional History
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 space-y-10">
                                            {experiences.length > 0 ? experiences.map((exp: any, idx: number) => (
                                                <div key={idx} className="flex gap-6 relative">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                                            <Briefcase className="w-6 h-6" />
                                                        </div>
                                                        {idx !== experiences.length - 1 && (
                                                            <div className="w-0.5 h-full bg-slate-100 absolute top-12 left-6" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-3 pb-4 flex-1">
                                                        <div className="space-y-1">
                                                            <h4 className="text-lg font-black text-slate-900 italic leading-none">{exp.position || exp.title}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-amber-600 font-bold text-sm tracking-tight">{exp.company || exp.organization}</p>
                                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">
                                                                    {exp.startDate || exp.from || exp.duration} - {exp.endDate || exp.to || (exp.current ? 'Present' : '')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {exp.description && (
                                                            <p className="text-slate-500 font-medium leading-relaxed max-w-2xl text-sm italic">{exp.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-slate-400 italic font-medium">Profile lacks detailed experience history.</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Education section */}
                                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-10">
                                        <CardHeader className="p-0 mb-8">
                                            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
                                                <GraduationCap className="w-6 h-6 text-purple-500" />
                                                Academic Qualifications
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 space-y-10">
                                            {education.length > 0 ? education.map((edu: any, idx: number) => (
                                                <div key={idx} className="flex gap-6 relative">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                                            <GraduationCap className="w-6 h-6" />
                                                        </div>
                                                        {idx !== education.length - 1 && (
                                                            <div className="w-0.5 h-full bg-slate-100 absolute top-12 left-6" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 pb-8 flex-1">
                                                        <h4 className="text-lg font-black text-slate-900 italic leading-none">{edu.degree || edu.qualification || edu.title}</h4>
                                                        <p className="text-purple-600 font-bold text-sm tracking-tight leading-none mb-2">{edu.school || edu.institution || edu.university}</p>
                                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">{edu.graduationYear || edu.year || edu.date || (edu.startYear && edu.endYear ? edu.startYear + ' - ' + edu.endYear : '')}</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-slate-400 italic font-medium">Academic background details not specified.</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Projects & Certificates in 2 columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Projects */}
                                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-8">
                                            <CardHeader className="p-0 mb-6">
                                                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                                                    <Globe className="w-6 h-6 text-blue-500" />
                                                    Active Projects
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0 space-y-6">
                                                {projects.length > 0 ? projects.map((proj: any, idx: number) => (
                                                    <div key={idx} className="space-y-3 p-5 rounded-3xl bg-blue-50/30 border border-blue-100/50 group/proj">
                                                        <h4 className="font-black text-slate-900 italic text-sm group-hover/proj:text-blue-600 transition-colors">{proj.name || proj.title}</h4>
                                                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">{proj.description}</p>
                                                        {(proj.technologies || proj.tech) && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {(proj.technologies || proj.tech).map((t: string, i: number) => (
                                                                    <Badge key={i} variant="outline" className="text-[9px] py-0 border-blue-100 text-blue-500 bg-white font-bold">{t}</Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) : (
                                                    <p className="text-slate-400 italic text-sm">No specific projects highlighted.</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Certificates */}
                                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[40px] bg-white p-8">
                                            <CardHeader className="p-0 mb-6">
                                                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                                                    <Award className="w-6 h-6 text-rose-500" />
                                                    Certifications
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0 space-y-4">
                                                {certificates.length > 0 ? certificates.map((cert: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-4 p-5 rounded-3xl bg-rose-50/30 border border-rose-100/50 hover:bg-white transition-colors cursor-default">
                                                        <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                                                            <Award className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-900 italic text-sm leading-tight">{cert.name || cert.title}</h4>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{cert.issuer || cert.organization} • {cert.date || cert.year}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="text-slate-400 italic text-sm p-4">No certifications on record.</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div >
    );
}
