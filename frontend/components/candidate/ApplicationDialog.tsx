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
import { Building, MapPin, Briefcase, DollarSign, Sparkles, Send, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white mb-2">
                            Apply for Position
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Submit your application to join the team
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Job Details Card */}
                <div className="px-6 pt-5 pb-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                                {job.company_name?.charAt(0) || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">
                                    {job.job_title}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Building className="w-4 h-4" />
                                    <span className="font-medium">{job.company_name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.location}
                            </Badge>
                            <Badge variant="outline" className="bg-white text-slate-700 border-slate-200">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {job.job_type}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="px-6 pb-5">
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="note" className="text-sm font-semibold text-slate-700 mb-2 block">
                                Cover Letter / Note <span className="text-slate-400 font-normal">(Optional)</span>
                            </Label>
                            <Textarea
                                id="note"
                                placeholder="Tell us why you're a great fit for this role..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="h-32 resize-none border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                {note.length} / 500 characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex-row gap-3 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 h-11 border-slate-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/30"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Application
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
