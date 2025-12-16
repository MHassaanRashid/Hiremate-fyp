import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Job } from "@/lib/api/jobs"

interface ApplicationDialogProps {
    job: Job
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (note?: string) => Promise<void>
}

export function ApplicationDialog({
    job,
    open,
    onOpenChange,
    onConfirm,
}: ApplicationDialogProps) {
    const [note, setNote] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            await onConfirm(note)
            setNote("")
            onOpenChange(false)
        } catch (error) {
            // Error handled by parent
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Apply to {job.job_title}</DialogTitle>
                    <DialogDescription>
                        You are applying to {job.company_name}. You can add an optional note to your application.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="note">Cover Letter / Note (Optional)</Label>
                        <Textarea
                            id="note"
                            placeholder="Why are you a good fit for this role?"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-32"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Application"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
