// Reusable component for score input with validation
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ScoreInputProps {
    label: string
    description?: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    className?: string
}

export default function ScoreInput({
    label,
    description,
    value,
    onChange,
    min = 1,
    max = 10,
    className
}: ScoreInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value) || min
        const clampedValue = Math.min(Math.max(newValue, min), max)
        onChange(clampedValue)
    }

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-emerald-600 border-emerald-300"
        if (score >= 6) return "text-amber-600 border-amber-300"
        return "text-rose-600 border-rose-300"
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <Label htmlFor={label} className="text-sm font-medium text-slate-700">
                    {label}
                </Label>
                <span className={cn("text-sm font-semibold", getScoreColor(value))}>
                    {value}/{max}
                </span>
            </div>
            {description && (
                <p className="text-xs text-slate-500">{description}</p>
            )}
            <div className="flex items-center gap-3">
                <Input
                    id={label}
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleChange}
                    className="flex-1 cursor-pointer"
                />
                <Input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleChange}
                    className={cn("w-16 text-center font-semibold", getScoreColor(value))}
                />
            </div>
        </div>
    )
}
