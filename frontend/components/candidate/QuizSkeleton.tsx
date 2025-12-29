import { Skeleton } from "@/components/ui/skeleton"

import CandidateLayout from "@/layouts/CandidateLayout"

export function QuizSkeleton() {
    return (
        <CandidateLayout>
            <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                    {/* Header Skeleton */}
                    <div className="text-center space-y-6 pt-8 flex flex-col items-center">
                        <Skeleton className="h-8 w-48 rounded-full" />
                        <div className="space-y-2 flex flex-col items-center">
                            <Skeleton className="h-16 w-3/4 md:w-1/2" />
                            <Skeleton className="h-16 w-2/3 md:w-1/3" />
                        </div>
                        <Skeleton className="h-6 w-full max-w-lg" />
                    </div>

                    {/* Rules Bar Skeleton */}
                    <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex flex-col items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technology Grid Skeleton */}
                    <div className="space-y-6">
                        <div className="text-center flex flex-col items-center gap-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-40" />
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-8 md:gap-12 py-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                <div key={i} className="flex flex-col items-center gap-4">
                                    <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-3xl" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </CandidateLayout>
    )
}
