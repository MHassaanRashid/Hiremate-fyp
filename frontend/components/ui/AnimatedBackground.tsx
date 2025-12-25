/**
 * AnimatedBackground Component
 * 
 * Provides a consistent animated background with pulsing gradient orbs,
 * grid pattern overlay, and floating particles for a premium visual experience.
 * 
 * Usage:
 * <AnimatedBackground />
 */

export function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Pulsing gradient orbs */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-sky-500/35 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-300"></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            {/* Floating particles */}
            <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/80 rounded-full animate-ping"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-blue-500/80 rounded-full animate-ping delay-1000"></div>
            <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-cyan-400/80 rounded-full animate-ping delay-500"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-sky-400/80 rounded-full animate-ping delay-700"></div>
        </div>
    );
}
