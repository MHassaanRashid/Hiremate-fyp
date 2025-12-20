// Reusable component for displaying interview status badges
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'evaluated' | 'pending'
    className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const variants = {
        scheduled: {
            bg: "bg-blue-50 border-blue-300 text-blue-700",
            label: "Scheduled"
        },
        'in-progress': {
            bg: "bg-amber-50 border-amber-300 text-amber-700",
            label: "In Progress"
        },
        completed: {
            bg: "bg-emerald-50 border-emerald-300 text-emerald-700",
            label: "Completed"
        },
        cancelled: {
            bg: "bg-rose-50 border-rose-300 text-rose-700",
            label: "Cancelled"
        },
        evaluated: {
            bg: "bg-purple-50 border-purple-300 text-purple-700",
            label: "Evaluated"
        },
        pending: {
            bg: "bg-slate-50 border-slate-300 text-slate-700",
            label: "Pending"
        }
    }

    const variant = variants[status] || variants.pending

    return (
        <Badge
            variant="outline"
            className={cn(variant.bg, "font-medium", className)}
        >
            {variant.label}
        </Badge>
    )
}
