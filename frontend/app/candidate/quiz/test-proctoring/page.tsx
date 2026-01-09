"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useProctoring } from "@/hooks/use-proctoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ShieldCheck,
    ShieldAlert,
    Activity,
    Target,
    Maximize2,
    Keyboard,
    Copy,
    AlertCircle,
    Info
} from "lucide-react"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

export default function ProctoringVerificationPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isActive, setIsActive] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isDevMode, setIsDevMode] = useState(false)
    const [logs, setLogs] = useState<{ time: string, action: string, type: 'info' | 'warning' | 'error' | 'success' }[]>([])

    const addLog = useCallback((action: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
        setLogs(prev => [{
            time: new Date().toLocaleTimeString(),
            action,
            type
        }, ...prev].slice(0, 50))
    }, [])

    const handleWarning = useCallback((count: number, reason: string) => {
        addLog(`Violation: ${reason} (#${count})`, 'warning')
    }, [addLog])

    const handleTerminate = useCallback((reason: string) => {
        addLog(`TERMINATION Simulation: ${reason}`, 'error')
    }, [addLog])

    const {
        status,
        rawMetrics,
        isModelReady,
        detectedObjects
    } = useProctoring({
        videoRef,
        isActive,
        onWarning: handleWarning,
        onTerminate: handleTerminate
    })

    const handleAutoReenter = useCallback(() => {
        if (isDevMode) return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
    }, [isDevMode]);

    // Verification Effect
    useEffect(() => {
        const handleFullscreenChange = async () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            addLog(isFull ? "Entered Fullscreen" : "Exited Fullscreen", isFull ? 'success' : 'warning');

            if (isFull) {
                if ('keyboard' in navigator && (navigator as any).keyboard.lock) {
                    try {
                        await (navigator as any).keyboard.lock(['Escape']);
                        addLog("Keyboard Lock Active (Esc)", 'success');
                    } catch (e) {
                        console.warn("Keyboard lock failed:", e);
                    }
                }
            } else {
                if ('keyboard' in navigator && (navigator as any).keyboard.unlock) {
                    (navigator as any).keyboard.unlock();
                }
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Dev Mode Toggle: Ctrl + Shift + Alt + D
            if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'D') {
                e.preventDefault();
                setIsDevMode(prev => {
                    const next = !prev;
                    addLog(`Developer Mode ${next ? 'ENABLED' : 'DISABLED'}`, 'info');
                    toast.success(`Developer Mode ${next ? 'ENABLED' : 'DISABLED'}`, { icon: '🛠️' });
                    return next;
                });
                return;
            }

            if (isDevMode) return;

            const blockedKeys = ['Escape', 'F11', 'F12', 'PrintScreen'];
            if (blockedKeys.includes(e.key)) {
                e.preventDefault();
                addLog(`Blocked Key: ${e.key}`, 'error');
                toast.error(`${e.key} key blocked!`, { id: 'key-blocked' });
                if (e.key === 'Escape') {
                    // Force re-entry effort
                    setTimeout(handleAutoReenter, 100);
                }
            }
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            addLog("Blocked Copy Attempt", 'error');
            toast.error("Copying is disabled!", { id: 'copy-blocked' });
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            addLog("Blocked Paste Attempt", 'error');
            toast.error("Pasting is disabled!", { id: 'paste-blocked' });
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            addLog("Blocked Right Click", 'error');
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleAutoReenter);
        window.addEventListener('copy', handleCopy);
        window.addEventListener('paste', handlePaste);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', handleAutoReenter);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('paste', handlePaste);
            window.removeEventListener('contextmenu', handleContextMenu);
            if ('keyboard' in navigator && (navigator as any).keyboard.unlock) {
                (navigator as any).keyboard.unlock();
            }
        };
    }, [addLog, isDevMode, handleAutoReenter]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                addLog(`Fullscreen Error: ${err.message}`, 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    return (
        <div
            className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans transition-colors duration-500 overflow-hidden flex flex-col relative"
            onCopy={(e) => !isDevMode && e.preventDefault()}
            onPaste={(e) => !isDevMode && e.preventDefault()}
            onContextMenu={(e) => !isDevMode && e.preventDefault()}
        >
            {/* Fullscreen Enforcement Overlay (Demo) */}
            {!isFullscreen && !isDevMode && (
                <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <ShieldAlert className="w-10 h-10 text-red-600 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fullscreen Required</h2>
                            <p className="text-slate-500 font-medium text-sm">
                                The system has detected a fullscreen exit. To continue the verification, you must re-enter fullscreen.
                            </p>
                            {isDevMode && <p className="text-xs text-blue-600 font-bold">Dev Mode active - overlay should be hidden.</p>}
                        </div>
                        <Button
                            onClick={() => document.documentElement.requestFullscreen()}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all text-lg"
                        >
                            Re-enter Fullscreen
                        </Button>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <main className="max-w-7xl mx-auto w-full relative z-10 flex-1 flex flex-col gap-6">
                <header className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/20">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">Proctoring Verification</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Security Engine Test Suite</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        <Button
                            onClick={toggleFullscreen}
                            variant={isFullscreen ? "default" : "outline"}
                            className={cn(
                                "rounded-xl font-bold h-10 px-6 transition-all",
                                isFullscreen ? "bg-green-600 hover:bg-green-700 text-white" : "border-slate-200 text-slate-600"
                            )}
                        >
                            <Maximize2 className="w-4 h-4 mr-2" />
                            {isFullscreen ? "Fullscreen Active" : "Enter Fullscreen"}
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    {/* Left Panel: Camera & Verification */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Camera Monitor */}
                        <Card className="bg-white/90 border-slate-200/60 backdrop-blur-xl overflow-hidden shadow-2xl flex-1 flex flex-col border-2 relative rounded-3xl ring-1 ring-slate-100 min-h-[400px]">
                            <div className="relative flex-1 bg-slate-950 overflow-hidden group">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1] opacity-90"
                                />

                                {isModelReady && rawMetrics && (
                                    <div
                                        className="absolute w-12 h-12 pointer-events-none transition-all duration-150 ease-out z-20"
                                        style={{
                                            left: `${(1 - rawMetrics.x) * 100}%`,
                                            top: `${rawMetrics.y * 100}%`,
                                            transform: "translate(-50%, -50%)"
                                        }}
                                    >
                                        <div className="relative w-full h-full">
                                            <div className="absolute top-1/2 left-0 w-full h-px bg-blue-400/80" />
                                            <div className="absolute left-1/2 top-0 w-px h-full bg-blue-400/80" />
                                            <div className="absolute inset-0 border border-blue-400/40 rounded-full animate-ping opacity-30" />
                                            <div className="absolute inset-[25%] border-2 border-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-6 left-6 flex flex-col gap-3">
                                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Live Analysis</span>
                                    </div>
                                    <div className="px-3 py-1.5 bg-blue-600/80 backdrop-blur-md rounded-xl border border-blue-400/30 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                                            {status === 'active' ? "Status: Secure" : "Status: Warning"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-6 bg-white border-t border-slate-100">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Object Detection</p>
                                        <div className="flex flex-wrap gap-1">
                                            {detectedObjects.length > 0 ? (
                                                detectedObjects.map((obj, i) => (
                                                    <Badge key={i} className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-bold">
                                                        {obj}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-500 font-medium italic">Scanning...</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Iris Vector X</p>
                                        <p className="font-mono font-bold text-slate-700">{rawMetrics?.x.toFixed(4) || '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Iris Vector Y</p>
                                        <p className="font-mono font-bold text-slate-700">{rawMetrics?.y.toFixed(4) || '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Blink Logic</p>
                                        <p className="font-mono font-bold text-slate-700">{rawMetrics?.blink.toFixed(2) || '---'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <VerificationTestCard
                                icon={<Maximize2 className="w-5 h-5 text-indigo-600" />}
                                title="Fullscreen Escape"
                                description="Try pressing 'Esc' to exit fullscreen. The system should detect and log it."
                                status={isFullscreen ? 'success' : 'warning'}
                            />
                            <VerificationTestCard
                                icon={<Keyboard className="w-5 h-5 text-amber-600" />}
                                title="Key Blocking"
                                description="Test F11, F12, or PrintScreen. They should be intercepted and logged."
                                status='info'
                            />
                            <VerificationTestCard
                                icon={<Copy className="w-5 h-5 text-red-600" />}
                                title="Content Protection"
                                description="Try to copy this text or right-click. Action should be blocked."
                                status='info'
                            />
                            <VerificationTestCard
                                icon={<AlertCircle className="w-5 h-5 text-blue-600" />}
                                title="Object Detection"
                                description="Show your phone to the camera to test real-time object detection speed."
                                status={detectedObjects.some(o => o.toLowerCase().includes('phone')) ? 'error' : 'info'}
                            />
                        </div>
                    </div>

                    {/* Right Panel: Action Log */}
                    <Card className="lg:col-span-4 bg-white/95 border-slate-200 border shadow-2xl rounded-3xl ring-1 ring-slate-100 flex flex-col max-h-[calc(100vh-160px)]">
                        <CardHeader className="p-6 border-b border-slate-100">
                            <CardTitle className="text-lg font-black tracking-tight flex items-center justify-between">
                                Action Monitor
                                <Badge className="bg-slate-900 text-white text-[10px]">{logs.length} Events</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto overflow-x-hidden">
                            <div className="divide-y divide-slate-50">
                                {logs.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Info className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-400">No actions detected yet</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Start interacting to see logs</p>
                                    </div>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap mt-0.5">{log.time}</span>
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "text-xs font-bold leading-tight",
                                                    log.type === 'error' ? "text-red-600" :
                                                        log.type === 'warning' ? "text-amber-600" :
                                                            log.type === 'success' ? "text-green-600" : "text-slate-700"
                                                )}>
                                                    {log.action}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

function VerificationTestCard({ icon, title, description, status }: { icon: React.ReactNode, title: string, description: string, status: 'success' | 'warning' | 'error' | 'info' }) {
    return (
        <Card className="bg-white/80 border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
                <div className="p-3 bg-slate-50 rounded-xl h-fit">
                    {icon}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            status === 'success' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                status === 'warning' ? "bg-amber-500 animate-pulse" :
                                    status === 'error' ? "bg-red-500 animate-pulse" : "bg-slate-200"
                        )} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
                </div>
            </div>
        </Card>
    )
}
