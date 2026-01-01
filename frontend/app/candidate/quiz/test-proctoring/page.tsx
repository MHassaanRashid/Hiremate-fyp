"use client"

import { useRef, useState, useCallback } from "react"
import { useProctoring } from "@/hooks/use-proctoring"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Activity, Target } from "lucide-react"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function GazeTestPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isActive, setIsActive] = useState(true)

    const handleWarning = useCallback((count: number, reason: string) => {
        console.warn(`[GazeTest] Warning ${count}: ${reason}`)
    }, [])

    const handleTerminate = useCallback((reason: string, proof: string) => {
        console.error(`[GazeTest] Termination: ${reason}`)
    }, [])

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

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans transition-colors duration-500 overflow-hidden flex flex-col relative">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <main className="max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col">
                <header className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Advanced Proctoring</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Real-time Recognition Test</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-2">
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border shadow-sm",
                                status === 'warning' ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status === 'warning' ? "bg-red-500" : "bg-green-500")} />
                                {status === 'active' ? "System Secure" : "Violation Detected"}
                            </div>
                        </div>
                        <Badge variant="outline" className={cn(
                            "px-4 py-1.5 text-xs font-bold border-2 transition-all duration-500 bg-white",
                            isModelReady ? "border-blue-100 text-blue-600 shadow-sm" : "border-amber-100 text-amber-600 animate-pulse"
                        )}>
                            {isModelReady ? "AI Model Online" : "Loading AI Engine..."}
                        </Badge>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    {/* Main Camera Feed */}
                    <div className="lg:col-span-8 flex flex-col">
                        <Card className="bg-white/80 border-slate-200/60 backdrop-blur-xl overflow-hidden shadow-xl shadow-slate-200/50 flex-1 flex flex-col border-2 relative rounded-2xl ring-1 ring-slate-100">
                            <div className="relative flex-1 bg-slate-900 overflow-hidden group">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1] opacity-90"
                                />

                                {/* Scanning Overlay Effect */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-20 w-full animate-scan" style={{ top: '-100%' }} />

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

                                {/* UI Labels on Camera */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-white" />
                                        <span className="text-[10px] font-mono text-white">Live Stream</span>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-4 bg-white border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Environment Scan</span>
                                            <div className="flex gap-1.5">
                                                {detectedObjects.length > 0 ? (
                                                    detectedObjects.map((obj: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-bold uppercase tracking-tight">
                                                            {obj.split(' ')[0]}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic font-medium">Monitoring surroundings...</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="h-8 w-px bg-slate-100" />
                                        <div className="text-right">
                                            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Violation Score</p>
                                            <p className={cn("text-lg font-black", status === 'warning' ? "text-red-600" : "text-slate-800")}>
                                                SECURE
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Monitor Panel */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Eye Pupil Monitors */}
                        <Card className="bg-white/80 border-slate-200/60 backdrop-blur-xl border shadow-xl shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 tracking-tight">
                                        <Target className="w-4 h-4 text-blue-600" />
                                        Pupil Tracking
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full">Active</span>
                                </div>

                                {/* X-Axis Monitor */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                        <span>Left</span>
                                        <span className="text-blue-600 font-mono text-[10px]">{rawMetrics?.x.toFixed(3) || '0.500'}</span>
                                        <span>Right</span>
                                    </div>
                                    <div className="relative h-6 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex items-center shadow-inner">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="h-full w-px bg-slate-200" />
                                        </div>
                                        <div
                                            className="absolute h-full w-2 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-100 ease-out z-10"
                                            style={{ left: `${(rawMetrics?.x || 0.5) * 100}%`, transform: 'translateX(-50%)' }}
                                        />
                                    </div>
                                    <p className="text-[8px] text-slate-400 text-center font-bold tracking-widest uppercase">Horizontal Vector</p>
                                </div>

                                {/* Y-Axis Monitor */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                        <span>Upper</span>
                                        <span className="text-blue-600 font-mono text-[10px]">{rawMetrics?.y.toFixed(3) || '0.500'}</span>
                                        <span>Lower</span>
                                    </div>
                                    <div className="relative h-6 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex items-center shadow-inner">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="h-full w-px bg-slate-200" />
                                        </div>
                                        <div
                                            className="absolute h-full w-2 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-100 ease-out z-10"
                                            style={{ left: `${(rawMetrics?.y || 0.5) * 100}%`, transform: 'translateX(-50%)' }}
                                        />
                                    </div>
                                    <p className="text-[8px] text-slate-400 text-center font-bold tracking-widest uppercase">Vertical Vector</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Status */}
                        <Card className="bg-white/80 border-slate-200/60 backdrop-blur-xl border shadow-xl shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Security Status</span>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase text-green-600 border-green-200 bg-green-50 shadow-sm">
                                            Optimal
                                        </Badge>
                                    </div>

                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
                                        <div className="flex flex-col gap-3">
                                            <StatusItem
                                                label="Quadrant Focus"
                                                isActive={rawMetrics && (Math.abs(rawMetrics.x - 0.5) > 0.12 || Math.abs(rawMetrics.y - 0.5) > 0.12)}
                                            />
                                            <StatusItem
                                                label="Eye Closure"
                                                isActive={rawMetrics && (rawMetrics.blink > 3.2)}
                                            />
                                            <StatusItem
                                                label="Phone Detection"
                                                isActive={detectedObjects.some((o: string) => ['phone', 'cell phone', 'mobile'].some(kw => o.toLowerCase().includes(kw)))}
                                            />
                                            <StatusItem
                                                label="Environment"
                                                isActive={detectedObjects.length > 3}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calibration Confidence</span>
                                            <span className="text-[10px] font-mono font-bold text-blue-600">99.2%</span>
                                        </div>
                                        <Progress value={99.2} className="h-1 bg-slate-100" indicatorClassName="bg-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Minimalist Background Decoration */}
            <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-20">
                <Target className="w-32 h-32 text-blue-500" />
            </div>
        </div>
    )
}

function StatusItem({ label, isActive }: { label: string, isActive: any }) {
    return (
        <div className="flex items-center justify-between">
            <span className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", isActive ? "text-red-600" : "text-slate-400")}>
                {label}
            </span>
            <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                isActive ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" : "bg-slate-200"
            )} />
        </div>
    )
}
