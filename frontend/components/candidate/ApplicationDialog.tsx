"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Job } from "@/lib/api/jobs"
import { Loader2 } from "lucide-react"

interface ApplicationDialogProps {
    job: Job | null
    isOpen: boolean
    onClose: () => void
    onConfirm: (jobId: string, notes: string) => Promise<void>
}

export function ApplicationDialog({ job, isOpen, onClose, onConfirm }: ApplicationDialogProps) {
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!job) return

        try {
            setIsSubmitting(true)
            await onConfirm(job.id, notes)
            setNotes("") // Reset
            onClose()
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!job) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Apply for {job.job_title}</DialogTitle>
                    <DialogDescription>
                        You are applying to <span className="font-semibold text-foreground">{job.company_name}</span>.
                        Review your details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="notes">Why are you a good fit? (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Briefly describe your relevant experience or add a note to the hiring manager..."
                            className="resize-none h-32"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                        <p>Your profile and resume will be shared with the employer.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
