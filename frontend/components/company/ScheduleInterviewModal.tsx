"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Link as LinkIcon, MapPin, Loader2, CalendarClock } from "lucide-react"

interface ScheduleInterviewModalProps {
    isOpen: boolean
    onClose: () => void
    candidateId: string
    candidateName: string
    jobId: string
    applicationId?: string
    onSuccess: () => void
}

export default function ScheduleInterviewModal({
    isOpen,
    onClose,
    candidateId,
    candidateName,
    jobId,
    applicationId,
    onSuccess
}: ScheduleInterviewModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Default values
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
        duration: "30",
        meeting_link: "",
        location: "",
        notes: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const backend = "/api"

            // Combine date and time
            const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString()

            const payload = {
                job_id: jobId,
                candidate_id: candidateId,
                application_id: applicationId,
                scheduled_at: scheduledAt,
                duration_minutes: parseInt(formData.duration),
                meeting_link: formData.meeting_link,
                location: formData.location,
                notes: formData.notes
            }

            const res = await fetch(`${backend}/interviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || "Failed to schedule interview")
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="bg-blue-600 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <CalendarClock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white">Schedule Interview</DialogTitle>
                            <DialogDescription className="text-blue-100 flex items-center gap-1">
                                with {candidateName}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-slate-700 font-medium">Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time" className="text-slate-700 font-medium">Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input
                                    id="time"
                                    name="time"
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-slate-700 font-medium">Duration (mins)</Label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                value={formData.duration}
                                onChange={handleChange}
                                className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-slate-700 font-medium">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Office, Remote"
                                    className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meeting_link" className="text-slate-700 font-medium">Meeting Link (Optional)</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                id="meeting_link"
                                name="meeting_link"
                                value={formData.meeting_link}
                                onChange={handleChange}
                                placeholder="https://zoom.us/..."
                                className="pl-9 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-slate-700 font-medium">Notes for Candidate</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Briefly describe what to prepare..."
                            className="min-h-[80px] border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                    </div>

                    <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-4 gap-2 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-600">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...
                                </>
                            ) : "Schedule"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
