import { AlertTriangle, ShieldAlert } from "lucide-react"

interface ProctoringWarningProps {
    isVisible: boolean
    count: number
    message: string
}

export function ProctoringWarning({ isVisible, count, message }: ProctoringWarningProps) {
    if (!isVisible) return null

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className={`
                flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl border-2 backdrop-blur-md
                ${count >= 2 ? 'bg-red-500/90 border-red-400 text-white' : 'bg-amber-500/90 border-amber-400 text-white'}
            `}>
                <div className="p-2 bg-white/20 rounded-full animate-pulse">
                    {count >= 2 ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                    <h3 className="font-bold text-lg uppercase tracking-wide">
                        {count >= 2 ? 'Final Warning' : 'Proctoring Alert'}
                    </h3>
                    <p className="font-medium opacity-90 text-sm">
                        {message} ({count}/3)
                    </p>
                </div>
            </div>
        </div>
    )
}
