import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

export function QuizExecutionSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 md:px-8 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-lg" />
                        <div className="hidden sm:block space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-24 rounded-lg" />
                        {/* Camera Preview Skeleton */}
                        <Skeleton className="w-28 h-20 rounded-lg hidden sm:block" />
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 relative z-10 min-h-[calc(100vh-80px)] flex flex-col justify-center">
                <div className="space-y-6">
                    {/* Progress Bar Skeleton */}
                    <div className="space-y-2">
                        <div className="flex justify-between px-1">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>

                    {/* Question Card Skeleton */}
                    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
                        <CardHeader className="p-6 md:p-8 pb-4 space-y-4">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-2/3" />
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 pt-2 space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </CardContent>

                        <CardFooter className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <Skeleton className="h-4 w-40 hidden sm:block" />
                            <Skeleton className="h-11 w-40 rounded-xl" />
                        </CardFooter>
                    </Card>

                    {/* Footer Skeleton */}
                    <div className="flex justify-center">
                        <Skeleton className="h-3 w-64" />
                    </div>
                </div>
            </div>
        </div>
    )
}
