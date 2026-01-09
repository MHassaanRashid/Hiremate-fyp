import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Globe,
    FileText,
    Briefcase,
    GraduationCap,
    Download,
    CheckCircle2,
    XCircle,
    CalendarClock,
    Award,
    Sparkles,
    Brain,
    Eye
} from "lucide-react"
import ScheduleInterviewModal from "./ScheduleInterviewModal"

interface Candidate {
    user_id: string
    candidate_name?: string
    candidate_email?: string
    candidate_phone?: string
    candidate_location?: string
    candidate_summary?: string
    candidate_skills?: any
    candidate_experience?: any
    candidate_education?: any
    candidate_projects?: any
    candidate_certificates?: any
    resume_url?: string
    status: string
    application_id?: string
    ai_score?: number
}

interface CandidateProfileSheetProps {
    isOpen: boolean
    onClose: () => void
    candidate: Candidate | null
    onShortlist: (id: string) => void
    onReject: (id: string) => void
    jobId: string
}

export default function CandidateProfileSheet({
    isOpen,
    onClose,
    candidate: initialCandidate,
    onShortlist,
    onReject,
    jobId
}: CandidateProfileSheetProps) {
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [fullDetails, setFullDetails] = useState<any>(null)

    const fetchFullDetails = useCallback(async () => {
        if (!isOpen) return;
        if (!initialCandidate?.application_id && !initialCandidate?.user_id) return;

        try {
            setIsLoadingDetails(true)
            const token = localStorage.getItem("access_token")

            // Try application-specific details first, fallback to general profile
            const endpoint = initialCandidate.application_id
                ? `/api/jobs/applications/${initialCandidate.application_id}/details`
                : `/api/jobs/company/candidates/${initialCandidate.user_id}/profile`;

            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setFullDetails(data)
            }
        } catch (err) {
            console.error("Error fetching full candidate details:", err)
        } finally {
            setIsLoadingDetails(false)
        }
    }, [initialCandidate?.application_id, initialCandidate?.user_id, isOpen])

    useEffect(() => {
        if (isOpen && (initialCandidate?.application_id || initialCandidate?.user_id)) {
            fetchFullDetails()
        } else {
            setFullDetails(null)
        }
    }, [isOpen, initialCandidate?.application_id, initialCandidate?.user_id, fetchFullDetails])

    const candidate = fullDetails ? {
        ...initialCandidate,
        ...fullDetails.profile,
        // Map backend fields to frontend interface
        candidate_name: fullDetails.profile?.full_name,
        candidate_email: fullDetails.profile?.email,
        candidate_summary: fullDetails.profile?.summary,
        candidate_skills: fullDetails.profile?.skills,
        candidate_experience: fullDetails.profile?.experience,
        candidate_education: fullDetails.profile?.education,
        candidate_projects: fullDetails.profile?.projects,
        candidate_certificates: fullDetails.profile?.certificates,
        status: fullDetails.application?.status || initialCandidate?.status
    } : initialCandidate;

    if (!candidate) return null

    /**
     * UNIVERSAL DEEP EXTRACTOR
     * Digs through any number of { items: [...] } wrappers to find real data objects.
     */
    const deepExtract = (data: any): any[] => {
        if (!data) return [];

        // If it's an array, process each element
        if (Array.isArray(data)) {
            let results: any[] = [];
            data.forEach(item => {
                results = results.concat(deepExtract(item));
            });
            return results;
        }

        // If it's an object with an 'items' key, recurse into items
        if (typeof data === 'object' && data !== null && data.items) {
            return deepExtract(data.items);
        }

        // If it's a leaf data object (not a wrapper), return it as a single-item array
        if (typeof data === 'object' && data !== null) {
            // Check if it's a base object (has specific keys like name, title, company, etc.)
            const keys = Object.keys(data);
            if (keys.length === 1 && keys[0] === 'items') return [];
            return [data];
        }

        // If it's a primitive (like a string skill), wrap it
        return [data];
    };

    // Helper to extract a display string from various item types
    const getSkillName = (s: any) => {
        if (typeof s === 'string') return s;
        return s?.name || s?.title || "";
    };

    const experiences = deepExtract(candidate.candidate_experience);
    const education = deepExtract(candidate.candidate_education);
    const skills = deepExtract(candidate.candidate_skills);
    const projects = deepExtract(candidate.candidate_projects);
    const certificates = deepExtract(candidate.candidate_certificates);

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col bg-white">

                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                <AvatarFallback className="text-xl bg-blue-100 text-blue-700 font-bold">
                                    {candidate.candidate_name?.charAt(0) || "C"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <SheetTitle className="text-2xl font-bold text-slate-900">
                                        {candidate.candidate_name || "Unknown Candidate"}
                                    </SheetTitle>
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
                                        <Brain className="h-3 w-3" />
                                        AI Match: {candidate.ai_score || 0}%
                                    </Badge>
                                </div>
                                <SheetDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 font-medium">
                                    {candidate.candidate_location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" /> {candidate.candidate_location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5" /> {candidate.candidate_email}
                                    </span>
                                </SheetDescription>
                            </div>
                            <Badge variant={
                                candidate.status === 'shortlisted' ? 'default' :
                                    candidate.status === 'rejected' ? 'destructive' : 'secondary'
                            } className="capitalize px-3 py-1 font-semibold">
                                {candidate.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-8 print:p-0">

                            {/* AI Match Details (Full Report Element) */}
                            <section className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                                <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> AI Evaluation Report
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase text-blue-600 font-bold tracking-wider">Candidate Score</p>
                                        <p className="text-3xl font-black text-blue-800">{candidate.ai_score || 0}<span className="text-lg opacity-50">/100</span></p>
                                    </div>
                                    <div className="flex flex-col justify-center gap-2">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-blue-700 font-medium tracking-tight">Skill Match</span>
                                            <span className="text-blue-900 font-bold">{(candidate.ai_score || 0) + 5}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-blue-200/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, (candidate.ai_score || 0) + 5)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Summary */}
                            {candidate.candidate_summary && (
                                <section className="space-y-3">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <FileText className="h-4 w-4 text-blue-500" /> Professional Summary
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {candidate.candidate_summary}
                                    </p>
                                </section>
                            )}

                            {/* Skills */}
                            {skills.length > 0 && (
                                <section className="space-y-3">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Core Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((s, i) => {
                                            const name = getSkillName(s);
                                            if (!name) return null;
                                            return (
                                                <Badge key={i} variant="outline" className="bg-emerald-50/30 text-emerald-700 border-emerald-100 px-2 py-0.5">
                                                    {name}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Experience */}
                            {experiences.length > 0 && (
                                <section className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <Briefcase className="h-4 w-4 text-amber-500" /> Work Experience
                                    </h3>
                                    <div className="space-y-4">
                                        {experiences.map((exp: any, i: number) => (
                                            <div key={i} className="relative pl-4 border-l-2 border-slate-100 last:border-0 pb-1">
                                                <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                                                <h4 className="font-bold text-slate-900">{exp.position || exp.title || "Position"}</h4>
                                                <p className="text-sm text-slate-600 font-medium">
                                                    {exp.company || exp.organization} • <span className="text-slate-500">{exp.startDate || exp.duration || exp.from || ""} {exp.endDate || exp.to ? `- ${exp.endDate || exp.to}` : (exp.current ? '- Present' : '')}</span>
                                                </p>
                                                {exp.description && (
                                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed italic">{exp.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Education */}
                            {education.length > 0 && (
                                <section className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <GraduationCap className="h-4 w-4 text-purple-500" /> Academic Qualifications
                                    </h3>
                                    <div className="space-y-4">
                                        {education.map((edu: any, i: number) => (
                                            <div key={i} className="flex gap-4 p-3 rounded-lg border border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <GraduationCap className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900">{edu.degree || edu.qualification || edu.title || "Degree"}</h4>
                                                    <p className="text-sm text-slate-600 font-medium">
                                                        {edu.institution || edu.school || edu.university}
                                                    </p>
                                                    <p className="text-sm text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                                        {edu.graduationYear || edu.year || edu.date || 'Completed'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Projects */}
                            {projects.length > 0 && (
                                <section className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <Globe className="h-4 w-4 text-blue-500" /> Featured Projects
                                    </h3>
                                    <div className="space-y-4">
                                        {projects.map((proj: any, i: number) => (
                                            <div key={i} className="pl-4 border-l-2 border-blue-100 hover:border-blue-400 transition-colors">
                                                <h4 className="font-bold text-slate-900">{proj.name || proj.title}</h4>
                                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{proj.description}</p>
                                                {(proj.technologies || proj.tech) && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {(proj.technologies || proj.tech).map((tech: string, j: number) => (
                                                            <Badge key={j} variant="outline" className="text-[10px] py-0 bg-blue-50/30 text-blue-600 border-blue-100">{tech}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Certificates */}
                            {certificates.length > 0 && (
                                <section className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <Award className="h-4 w-4 text-rose-500" /> Certificates & Awards
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {certificates.map((cert: any, i: number) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                                                <Award className="h-5 w-5 text-rose-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">{cert.name || cert.title}</p>
                                                    <p className="text-[11px] text-slate-500 mt-1">{cert.issuer || cert.organization} • {cert.date || cert.year}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* AI Quiz Assessment History */}
                            {fullDetails?.quizzes?.length > 0 && (
                                <section className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <Brain className="h-4 w-4 text-indigo-500" /> AI Assessment History
                                    </h3>
                                    <div className="space-y-3">
                                        {fullDetails.quizzes.map((quiz: any, i: number) => (
                                            <div key={i} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-indigo-600 text-white border-0">{quiz.language}</Badge>
                                                        <span className="text-xs font-semibold text-slate-500">
                                                            {new Date(quiz.completed_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-black text-indigo-700">{Math.round(quiz.score_percentage)}%</span>
                                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Score</p>
                                                    </div>
                                                </div>
                                                {quiz.ai_feedback && (
                                                    <p className="text-xs text-slate-600 leading-relaxed bg-white/50 p-2 rounded-lg border border-indigo-50 italic">
                                                        "{quiz.ai_feedback}"
                                                    </p>
                                                )}
                                                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                                    <div className="p-2 rounded-lg bg-white/60">
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">Code Quality</p>
                                                        <p className="text-xs font-bold text-slate-700">{quiz.ai_code_quality_score || 0}/5</p>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-white/60">
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">Logic</p>
                                                        <p className="text-xs font-bold text-slate-700">{quiz.ai_problem_solving_score || 0}/5</p>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-white/60">
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">Efficiency</p>
                                                        <p className="text-xs font-bold text-slate-700">{quiz.ai_efficiency_score || 0}/5</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Interview Feedback */}
                            {fullDetails?.interviews?.length > 0 && (
                                <section className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-1">
                                        <CalendarClock className="h-4 w-4 text-emerald-500" /> Interview Evaluations
                                    </h3>
                                    <div className="space-y-4">
                                        {fullDetails.interviews.map((interview: any, i: number) => {
                                            let feedback = null;
                                            if (interview.feedback) {
                                                try {
                                                    feedback = JSON.parse(interview.feedback);
                                                } catch (e) {
                                                    feedback = interview.feedback;
                                                }
                                            }

                                            return (
                                                <div key={i} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-sm capitalize">{interview.interview_type} Interview</h4>
                                                            <p className="text-[10px] text-slate-500 font-medium">
                                                                {new Date(interview.scheduled_date).toLocaleDateString()} with {interview.interviewer_name || "Assigned Interviewer"}
                                                            </p>
                                                        </div>
                                                        <Badge className={cn(
                                                            "capitalize font-bold border-0",
                                                            interview.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                        )}>
                                                            {interview.status}
                                                        </Badge>
                                                    </div>

                                                    {feedback && typeof feedback === 'object' ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded-lg bg-white border border-emerald-100 flex flex-col items-center justify-center">
                                                                    <span className="text-sm font-black text-emerald-700">{feedback.overallRating || 0}</span>
                                                                    <span className="text-[8px] text-emerald-400 font-bold uppercase">Rating</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-bold text-slate-700">{feedback.recommendation?.replace('-', ' ').toUpperCase()}</p>
                                                                    <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-2">"{feedback.comments}"</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 pb-1">
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Strengths</p>
                                                                    <p className="text-[10px] text-slate-600">{feedback.strengths}</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Weaknesses</p>
                                                                    <p className="text-[10px] text-slate-600">{feedback.weaknesses}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : interview.notes ? (
                                                        <p className="text-xs text-slate-600 italic bg-white/50 p-2 rounded-lg">"{interview.notes}"</p>
                                                    ) : (
                                                        <p className="text-[10px] text-slate-400 italic">Evaluation pending completion</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Report & Resume Actions */}
                            <Separator className="mt-8" />
                            <div className="space-y-4 pt-4">
                                <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                            <Brain className="h-6 w-6" />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="font-bold text-slate-900 text-lg">Candidate Full Report</p>
                                            <p className="text-xs text-slate-500 font-medium tracking-tight whitespace-nowrap">Includes AI Match, Skills Verification & Social Insight</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button
                                            onClick={() => window.print()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                                            size="sm"
                                        >
                                            <Eye className="h-4 w-4 mr-2" /> View Report
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="font-bold text-slate-900">Original Resume.pdf</p>
                                            <p className="text-xs text-slate-500 font-medium">Verified document uploaded by candidate</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        {candidate.resume_url ? (
                                            <Button
                                                onClick={() => window.open(`/candidate/resume/view/${candidate.user_id}`, '_blank')}
                                                variant="outline"
                                                size="sm"
                                                className="border-slate-200 hover:bg-slate-50 flex-1"
                                            >
                                                <Download className="h-4 w-4 mr-2" /> Download Resume
                                            </Button>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-400">No Resume File</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                        <div className="flex gap-3 w-full">
                            <Button
                                onClick={() => onReject(candidate.application_id!)}
                                variant="outline"
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 font-bold"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button
                                onClick={() => onShortlist(candidate.application_id!)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Shortlist
                            </Button>
                        </div>
                        <Button
                            onClick={() => setIsInterviewModalOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold"
                        >
                            <CalendarClock className="mr-2 h-4 w-4" /> Schedule Interview
                        </Button>
                    </div>

                </SheetContent>
            </Sheet>

            <ScheduleInterviewModal
                isOpen={isInterviewModalOpen}
                onClose={() => setIsInterviewModalOpen(false)}
                candidateId={candidate.user_id}
                candidateName={candidate.candidate_name || "Candidate"}
                jobId={jobId}
                applicationId={candidate.application_id}
                onSuccess={() => { }}
            />
        </>
    )
}
