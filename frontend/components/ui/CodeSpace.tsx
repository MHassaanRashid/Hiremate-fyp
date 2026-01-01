"use client"

import React from "react"
import { Copy, Check, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface CodeSpaceProps {
    code: string
    language?: string | null
    className?: string
}

export function CodeSpace({ code, language = "text", className }: CodeSpaceProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = () => {
        if (!code) return
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Split code into lines for numbering
    const lines = (code || "").split("\n")

    return (
        <div className={cn(
            "rounded-xl overflow-hidden border border-slate-200 bg-[#1e1e1e] shadow-lg my-6 group",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-400 font-mono uppercase tracking-wider">
                        CODE
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                    onClick={handleCopy}
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
            </div>

            {/* Code Content */}
            <div className="relative">
                <ScrollArea className="w-full">
                    <div className="flex min-w-full">
                        {/* Line Numbers */}
                        <div className="flex-none w-10 py-4 text-xs text-right text-slate-600 bg-[#1e1e1e] border-r border-[#333] select-none font-mono">
                            {lines.map((_, i) => (
                                <div key={i} className="px-3 leading-6">
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Code Text */}
                        <div className="flex-1 p-4 overflow-x-auto">
                            <pre className="font-mono text-sm leading-6 text-slate-200 tab-4">
                                <code>{code}</code>
                            </pre>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
