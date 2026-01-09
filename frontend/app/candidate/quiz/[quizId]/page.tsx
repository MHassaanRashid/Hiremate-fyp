"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { uploadProctoringProof } from "@/lib/api/storage"
import {
    Clock,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Lock,
    ShieldAlert
} from "lucide-react"
import { getQuiz, submitQuizAnswer, completeQuiz, terminateQuiz } from "@/lib/api/quiz"
import { supabase } from "@/lib/supabaseClient"
import { cleanupGlobalModels } from "@/hooks/proctoring-models-singleton"
import toast from "react-hot-toast"
import { Progress } from "@/components/ui/progress"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { cn } from "@/lib/utils"
import { QuizExecutionSkeleton } from "@/components/candidate/QuizExecutionSkeleton"
import { CodeSpace } from "@/components/ui/CodeSpace"
import { parseQuestionContent } from "@/lib/quiz-utils"
import { useProctoring } from "@/hooks/use-proctoring"
import { ProctoringWarning } from "@/components/candidate/ProctoringWarning"


export default function QuizExecutionPage() {
    const router = useRouter()
    const params = useParams()
    const quizId = params.quizId as string

    const [quiz, setQuiz] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)
    const [isTerminated, setIsTerminated] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const [isFullscreen, setIsFullscreen] = useState(true)
    const [isDevMode, setIsDevMode] = useState(false)

    // Fullscreen status monitoring
    useEffect(() => {
        setIsFullscreen(!!document.fullscreenElement)
    }, [])

    const handleCopyPaste = useCallback((e: React.ClipboardEvent | React.MouseEvent | React.UIEvent) => {
        if (isDevMode) return;
        e.preventDefault();
        toast.error("Interaction is restricted during the assessment.", { id: 'interaction-restricted' });
    }, [isDevMode]);


    // Proctoring State
    const [warningMsg, setWarningMsg] = useState("")
    const [violationCounts, setViolationCounts] = useState({
        phone: 0,
        focus: 0,
        'multi-face': 0,
        'no-face': 0,
        'tab-blur': 0,
        'head-pose': 0
    });

    const processViolationLogs = async (logs: any[]) => {
        const processedLogs = [];
        for (const log of logs) {
            if (log.proof && log.proof.startsWith('data:image')) {
                try {
                    const url = await uploadProctoringProof(log.proof, quizId, log.type);
                    processedLogs.push({ ...log, proof: url });
                } catch (err) {
                    console.error("Failed to upload individual violation proof:", err);
                    processedLogs.push(log); // Keep base64 if upload fails (though it might hit body limits)
                }
            } else {
                processedLogs.push(log);
            }
        }
        return processedLogs;
    };

    const terminationThresholds = {
        phone: 2,
        focus: 10,
        'multi-face': 2,
        'no-face': 5,
        'tab-blur': 5,
        'head-pose': 10
    };


    const handleProctoringTermination = useCallback(async (reason: string, proof: string, logs: any[] = []) => {
        setIsTerminated(true)
        setSubmitting(true)

        // Ensure camera is off
        stopCamera()

        try {
            const token = localStorage.getItem('access_token')
            if (token) {
                let proofUrl = proof;
                let processedLogs = logs;

                toast.loading("Uploading evidence artifacts...", { id: "uploading-evidence" });
                try {
                    // Upload termination proof
                    if (proof && proof.startsWith('data:image')) {
                        proofUrl = await uploadProctoringProof(proof, quizId, "termination");
                    }
                    // Upload individual violation logs
                    processedLogs = await processViolationLogs(logs);

                    toast.success("Evidence uploaded", { id: "uploading-evidence" });
                } catch (uploadErr) {
                    console.error("Evidence upload failed:", uploadErr);
                    toast.error("Some snapshots failed to upload", { id: "uploading-evidence" });
                }

                await terminateQuiz(token, quizId, reason, proofUrl, processedLogs)
            } else {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    let proofUrl = proof;
                    let processedLogs = logs;

                    toast.loading("Uploading evidence artifacts...", { id: "uploading-evidence" });
                    try {
                        // Upload termination proof
                        if (proof && proof.startsWith('data:image')) {
                            proofUrl = await uploadProctoringProof(proof, quizId, "termination");
                        }
                        // Upload individual violation logs
                        processedLogs = await processViolationLogs(logs);

                        toast.success("Evidence uploaded", { id: "uploading-evidence" });
                    } catch (uploadErr) {
                        console.error("Evidence upload failed:", uploadErr);
                        toast.error("Some snapshots failed to upload", { id: "uploading-evidence" });
                    }

                    await terminateQuiz(session.access_token, quizId, reason, proofUrl, processedLogs)
                }
            }
            toast.error("Assessment Terminated due to proctoring violation.")
            router.push(`/candidate/quiz/${quizId}/report`)
        } catch (error) {
            console.error("Termination failed:", error)
        } finally {
            setSubmitting(false)
        }
    }, [quizId, router])

    const handleProctoringWarning = useCallback((count: number, reason: string, type: any) => {
        const typeStr = (type || 'focus') as keyof typeof violationCounts;

        setViolationCounts(prev => {
            const newCounts = { ...prev, [typeStr]: prev[typeStr] + 1 };
            const currentCount = newCounts[typeStr];
            const threshold = terminationThresholds[typeStr as keyof typeof terminationThresholds];

            // Set message for header display
            setWarningMsg(`${reason} (${currentCount}/${threshold})`);

            // Clear warning after 5 seconds
            setTimeout(() => {
                setWarningMsg(prev => prev.includes(reason) ? "" : prev);
            }, 5000);

            return newCounts;
        });
    }, []);

    // Initialize Proctoring Hook (active immediately since preparation is complete)
    const isProctoringActive = !isCompleting && !isTerminated && !loading

    const handleWarningWrapper = useCallback((count: number, reason: string, type: any) => {
        handleProctoringWarning(count, reason, type)

        // Manual termination check if hook doesn't do it
        setViolationCounts(prev => {
            const typeStr = (type || 'focus') as keyof typeof violationCounts;
            const threshold = terminationThresholds[typeStr as keyof typeof terminationThresholds];
            if (prev[typeStr] + 1 >= threshold) {
                // We'll let the hook's violationLogs be captured via handleTerminateWrapper
            }
            return prev;
        });
    }, [handleProctoringWarning]);

    const {
        warningCount,
        status: proctoringStatus,
        irisMetrics,
        isModelReady,
        isCalibrated,
        diagnostics,
        violationLogs,
        captureProof
    } = useProctoring({
        videoRef,
        isActive: isProctoringActive,
        onWarning: handleWarningWrapper,
        onTerminate: (reason, proof) => {
            // violationLogs will be available via closure when this executes
            handleProctoringTermination(reason, proof, violationLogs)
        }
    })

    // Update the threshold check to use violationLogs
    useEffect(() => {
        const typeKeys = Object.keys(violationCounts) as (keyof typeof violationCounts)[];
        for (const type of typeKeys) {
            if (violationCounts[type] >= terminationThresholds[type]) {
                const proof = captureProof();
                handleProctoringTermination(`Excessive ${type} violations: ${violationCounts[type]}/${terminationThresholds[type]}`, proof, violationLogs);
                break;
            }
        }
    }, [violationCounts, handleProctoringTermination, violationLogs, captureProof]);

    // Fullscreen Exit Enforcement & Anti-Cheat
    useEffect(() => {
        const handleFullscreenChange = async () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);

            if (isFull) {
                setWarningMsg(prev => prev.includes("FULLSCREEN EXITED") ? "" : prev);
                // Experimental: Attempt to lock the Escape key (Chromium only)
                if ('keyboard' in navigator && (navigator as any).keyboard.lock) {
                    try {
                        await (navigator as any).keyboard.lock(['Escape']);
                    } catch (e) {
                        console.warn("Keyboard lock failed:", e);
                    }
                }
            } else if (!isCompleting && !isTerminated && !loading && !isDevMode) {
                setWarningMsg("⚠️ FULLSCREEN EXITED! Please re-enter fullscreen immediately.");
                toast.error("Fullscreen exited! This behavior is being logged.", { duration: 6000 });
                // Unlock keyboard if exited
                if ('keyboard' in navigator && (navigator as any).keyboard.unlock) {
                    (navigator as any).keyboard.unlock();
                }
            }
        };

        // Initialize on mount
        handleFullscreenChange();

        const handleAutoReenter = () => {
            if (isDevMode) return;
            if (!document.fullscreenElement && !isCompleting && !isTerminated && !loading) {
                document.documentElement.requestFullscreen().catch(() => { });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('click', handleAutoReenter);

        // Blocking keys that exit fullscreen or allow navigating away
        const handleKeyDown = (e: KeyboardEvent) => {
            // Dev Mode Toggle: Ctrl + Shift + Alt + D
            if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'D') {
                e.preventDefault();
                setIsDevMode(prev => {
                    const next = !prev;
                    toast.success(`Developer Mode ${next ? 'ENABLED - Safety guards off' : 'DISABLED - Safety guards on'}`, { icon: '🛠️' });
                    return next;
                });
                return;
            }

            if (isDevMode) return;

            const blockedKeys = ['Escape', 'F11', 'PrintScreen', 'F12'];
            if (blockedKeys.includes(e.key)) {
                e.preventDefault();
                toast.error(`${e.key} key is disabled during the assessment.`, { id: 'key-blocked' });
                // If they pressed escape, they likely exited fullscreen - try to re-engage immediately
                if (e.key === 'Escape') setTimeout(handleAutoReenter, 100);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Prevent back/forward/reload
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isCompleting && !isTerminated && !loading && !isDevMode) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('click', handleAutoReenter);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if ('keyboard' in navigator && (navigator as any).keyboard.unlock) {
                (navigator as any).keyboard.unlock();
            }
        };
    }, [isCompleting, isTerminated, loading, isDevMode]);

    // Anti-Copy/Paste and Right Click Protection

    // Fullscreen is already active from prepare page

    useEffect(() => {
        if (quizId) fetchQuizData()
    }, [quizId])

    useEffect(() => {
        // Start timer after loading completes
        if (timeLeft > 0 && !loading) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleCompleteQuiz()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, loading])


    const fetchQuizData = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (token) {
                const data = await getQuiz(token, quizId)
                setQuiz(data.quiz)
                setQuestions(data.questions)
                setTimeLeft(data.quiz.duration_minutes * 60)
            } else {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    const data = await getQuiz(session.access_token, quizId)
                    setQuiz(data.quiz)
                    setQuestions(data.questions)
                    setTimeLeft(data.quiz.duration_minutes * 60)
                } else {
                    router.push('/auth/candidate')
                    return
                }
            }
        } catch (error) {
            console.error("Error fetching quiz:", error)
            toast.error("Failed to load assessment")
            router.push('/candidate/quiz')
        } finally {
            setLoading(false)
        }
    }

    const handleOptionSelect = (value: string) => {
        setSelectedOption(parseInt(value))
    }

    const handleNextQuestion = async () => {
        if (selectedOption === null) {
            toast.error("Please select an answer")
            return
        }

        setSubmitting(true)
        try {
            const token = localStorage.getItem('access_token')
            if (token) {
                await submitQuizAnswer(token, quizId, {
                    question_id: questions[currentIndex].id,
                    selected_option: selectedOption
                })
            } else {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                await submitQuizAnswer(session.access_token, quizId, {
                    question_id: questions[currentIndex].id,
                    selected_option: selectedOption
                })
            }

            // Reset selection for NEXT question
            setSelectedOption(null)

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1)
            } else {
                handleCompleteQuiz()
            }
        } catch (error) {
            console.error("Error submitting answer:", error)
            toast.error("Failed to save answer")
        } finally {
            setSubmitting(false)
        }
    }

    function stopCamera() {
        console.log("Proctoring: stopCamera called");
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => {
                track.stop();
                console.log(`Proctoring: Stopped track: ${track.label}`);
            });
            videoRef.current.srcObject = null
        }
        cleanupGlobalModels();
    }

    const handleCompleteQuiz = async () => {
        setSubmitting(true)
        setIsCompleting(true) // Start the full screen loader

        // Stop camera immediately as we transition to "analyzing" state
        stopCamera()

        try {
            const token = localStorage.getItem('access_token')
            if (token) {
                let processedLogs = violationLogs;
                if (violationLogs.length > 0) {
                    toast.loading("Uploading session logs...", { id: "upload-logs" });
                    processedLogs = await processViolationLogs(violationLogs);
                    toast.success("Logs uploaded", { id: "upload-logs" });
                }

                await completeQuiz(token, quizId, processedLogs)
            } else {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                let processedLogs = violationLogs;
                if (violationLogs.length > 0) {
                    toast.loading("Uploading session logs...", { id: "upload-logs" });
                    processedLogs = await processViolationLogs(violationLogs);
                    toast.success("Logs uploaded", { id: "upload-logs" });
                }

                await completeQuiz(session.access_token, quizId, processedLogs)
            }
            // Delay slightly to let the animation play/user perceive the "analysis"
            await new Promise(resolve => setTimeout(resolve, 2000))

            toast.success("Assessment Completed!")
            router.push(`/candidate/quiz/${quizId}/report`)
        } catch (error) {
            console.error("Error completing quiz:", error)
            toast.error("Failed to submit assessment")
            setIsCompleting(false) // Only turn off if error
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100

    // Block quiz until basic data is loaded
    if (loading || !quiz) {
        return <QuizExecutionSkeleton />
    }


    // NEW: Full Screen Completion Loader
    if (isCompleting) {
        return (
            <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white -z-10" />

                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin" />
                        <ShieldCheck className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    Finalizing Assessment
                </h2>

                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8 animate-pulse">
                    Analyzing your answers and proctoring data...
                </p>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-slate-50 relative select-none"
            onCopy={handleCopyPaste}
            onPaste={handleCopyPaste}
            onCut={handleCopyPaste}
            onContextMenu={handleCopyPaste}
            onDragStart={handleCopyPaste}
        >
            {/* Fullscreen Enforcement Overlay */}
            {!isFullscreen && !isCompleting && !isTerminated && !loading && !isDevMode && (
                <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <ShieldAlert className="w-10 h-10 text-red-600 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fullscreen Required</h2>
                            <p className="text-slate-500 font-medium">
                                To ensure academic integrity, this assessment must be completed in fullscreen mode.
                            </p>
                        </div>
                        <Button
                            onClick={() => document.documentElement.requestFullscreen()}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all text-lg"
                        >
                            Re-enter Fullscreen
                        </Button>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            This event has been logged for review
                        </p>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            {/* Focused Header */}
            <div className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 md:px-8 py-3 transition-opacity duration-500 opacity-100`}>
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-300",
                            proctoringStatus === 'warning' ? "bg-amber-500 shadow-amber-500/20 animate-pulse" : "bg-blue-600 shadow-blue-600/20"
                        )}>
                            {proctoringStatus === 'warning' ? (
                                <ShieldAlert className="w-5 h-5 text-white" />
                            ) : (
                                <ShieldCheck className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1">CheckMate AI</h2>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Secure Session</p>
                        </div>
                    </div>

                    {/* Centered Warning Message */}
                    {warningMsg && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in slide-in-from-top-4 duration-300 z-[60]">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none mb-0.5">
                                    Security Alert
                                </span>
                                <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                                    {warningMsg}
                                </span>
                            </div>
                            {warningMsg.includes("FULLSCREEN EXITED") && (
                                <Button
                                    size="sm"
                                    className="h-8 px-4 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-xl ml-2"
                                    onClick={() => document.documentElement.requestFullscreen()}
                                >
                                    RE-ENTER
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border transition-all duration-300 ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                            }`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-lg font-bold tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
                        </div>

                        {/* Camera Preview */}
                        <div className="relative w-28 h-20 bg-black rounded-lg overflow-hidden border-2 border-slate-200 shadow-md hidden sm:block">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            {!isModelReady && (
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                </div>
                            )}
                            <div className="absolute top-1 right-1 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.8)]",
                                    (isModelReady && isCalibrated) ? "bg-red-500 animate-pulse" : "bg-slate-500"
                                )} />
                                <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                                    {(isModelReady && isCalibrated) ? "Live" : "Calibrating"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`max-w-3xl mx-auto px-4 md:px-6 py-8 relative z-10 min-h-[calc(100vh-80px)] flex flex-col justify-center transition-all duration-500 blur-0 scale-100 opacity-100`}>
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
                            </div>
                            <span className="text-xs font-bold text-blue-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <Card key={currentIndex} className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm ring-1 ring-slate-100">
                        <CardHeader className="p-6 md:p-8 pb-4">
                            {currentQuestion && (() => {
                                const { narrative, code, language } = parseQuestionContent(currentQuestion.question_text)

                                return (
                                    <div className="space-y-4">
                                        <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            Single Choice
                                        </Badge>
                                        <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 leading-normal">
                                            {narrative}
                                        </CardTitle>

                                        {code && (
                                            <CodeSpace
                                                code={code}
                                                language={language}
                                                className="border-slate-200 shadow-md"
                                            />
                                        )}
                                    </div>
                                )
                            })()}
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 pt-2">
                            <RadioGroup
                                key={`q-${currentIndex}`}
                                value={selectedOption?.toString() ?? ""}
                                onValueChange={handleOptionSelect}
                                className="grid grid-cols-1 gap-3"
                            >
                                {currentQuestion?.options?.map((option: string, index: number) => (
                                    <Label
                                        key={index}
                                        htmlFor={`option-${index}`}
                                        className={cn(
                                            "relative flex items-center gap-4 p-4 md:p-5 rounded-xl border-2 transition-all cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 group",
                                            selectedOption === index
                                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <RadioGroupItem
                                            value={index.toString()}
                                            id={`option-${index}`}
                                            className="w-5 h-5 border-2 border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:text-blue-600 transition-all"
                                        />
                                        <span className={cn(
                                            "text-base font-medium transition-colors",
                                            selectedOption === index ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                                        )}>
                                            {option}
                                        </span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </CardContent>
                        <CardFooter className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Answer Locked after Submit</span>
                            </div>

                            <Button
                                onClick={handleNextQuestion}
                                disabled={selectedOption === null || submitting}
                                className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <>
                                        {currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                                        <ChevronRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Simple Footer/Pagination */}
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            HireMate Secure Assessment Environment &bull; Session ID: {quizId?.slice(0, 8)}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    )
}
