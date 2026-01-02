"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    CheckCircle2,
    FileText,
    Award,
    Video,
    ArrowRight,
    Sparkles,
    TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeModalProps {
    isOpen: boolean
    onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    const phases = [
        {
            title: "Phase 1: Resume & Profile",
            description: "Complete your profile and upload your resume to get enrolled.",
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Phase 2: AI Quiz",
            description: "Clear the AI-powered technical quiz with a score of 80% or higher.",
            icon: Award,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            title: "Phase 3: Live Interview",
            description: "Once you clear the quiz, you'll be eligible for a live interview with recruiters.",
            icon: Video,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <Sparkles className="w-12 h-12 text-blue-200 mb-4 animate-pulse" />
                    <DialogHeader className="text-left space-y-2">
                        <DialogTitle className="text-3xl font-bold tracking-tight text-white">
                            Welcome to HireMate!
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 text-lg">
                            Let's get you ready for your dream job.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        {phases.map((phase, index) => (
                            <div key={index} className="flex gap-4 p-4 rounded-2xl border-2 border-slate-50 hover:border-slate-100 transition-colors group">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", phase.bgColor, phase.color)}>
                                    <phase.icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-900">{phase.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {phase.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-4 flex gap-3 items-center border border-emerald-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-emerald-800 leading-tight">
                            Completing these phases will significantly improve your ranking and help you get hired faster!
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-0 bg-white">
                    <Button
                        onClick={onClose}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
