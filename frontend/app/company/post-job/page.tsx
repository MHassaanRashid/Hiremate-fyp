"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Loader2,
    Briefcase,
    MapPin,
    DollarSign,
    Building2,
    FileText,
    ListChecks,
    Sparkles,
    LayoutDashboard
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LocationInput } from "@/components/ui/location-input"

export default function PostJobPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        job_title: "",
        company_name: "",
        location: "Remote",
        job_type: "Full-time",
        salary_range: "",
        description: "",
        requirements: ""
    })

    useEffect(() => {
        if (user?.user_metadata?.cname || user?.user_metadata?.company_name) {
            setFormData(prev => ({
                ...prev,
                company_name: user.user_metadata.cname || user.user_metadata.company_name
            }))
        }
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"

            const payload = {
                ...formData,
                requirements: formData.requirements.split('\n').filter(line => line.trim() !== '')
            }

            const res = await fetch(`${backend}/jobs/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.detail || "Failed to create job")
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/company")
            }, 2000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth?tab=login")
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-blue-50/30">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen relative p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">

                {/* Improved Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/company")}
                    className="mb-8 hover:bg-white/50 text-slate-500 hover:text-slate-900 transition-all font-medium"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                {success ? (
                    <div className="max-w-md mx-auto mt-20 text-center animate-in zoom-in duration-500">
                        <div className="bg-emerald-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-8 shadow-xl ring-4 ring-emerald-50">
                            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">Job Posted!</h2>
                        <p className="text-slate-500 mb-8 font-medium">Your listing is now live and accepting applications.</p>
                        <Button onClick={() => router.push("/company")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-blue-200">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Return to Dashboard
                        </Button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                                <Sparkles className="w-3 h-3" /> New Opportunity
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">Create Job Listing</h1>
                            <p className="text-lg text-slate-500 max-w-xl mx-auto">Fill in the details below to attract top talent for your open position.</p>
                        </div>

                        {/* Form */}
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-slate-100 p-8 bg-white/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-800">
                                                Position Details
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 font-medium mt-1">Tell us about the role you're hiring for</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {error && (
                                            <Alert variant="destructive" className="animate-in slide-in-from-top-2 border-red-200 bg-red-50 text-red-900 rounded-xl">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <AlertTitle className="text-red-800 font-bold">Error</AlertTitle>
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Basic Info Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label htmlFor="job_title" className="text-slate-700 font-bold">Job Title <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="job_title"
                                                    name="job_title"
                                                    placeholder="e.g. Senior Product Designer"
                                                    value={formData.job_title}
                                                    onChange={handleChange}
                                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium rounded-xl"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="company_name" className="text-slate-700 font-bold">Company Name <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="company_name"
                                                    name="company_name"
                                                    placeholder="e.g. Acme Inc."
                                                    value={formData.company_name}
                                                    onChange={handleChange}
                                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium rounded-xl"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Location & Type */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <Label htmlFor="location" className="text-slate-700 font-bold">Location <span className="text-red-500">*</span></Label>
                                                <LocationInput
                                                    value={formData.location}
                                                    onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                                                    placeholder="e.g. Remote, NY"
                                                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-10 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="job_type" className="text-slate-700 font-bold">Type</Label>
                                                <Select
                                                    value={formData.job_type}
                                                    onValueChange={(val) => handleSelectChange("job_type", val)}
                                                >
                                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium rounded-xl">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                                        <SelectItem value="Contract">Contract</SelectItem>
                                                        <SelectItem value="Freelance">Freelance</SelectItem>
                                                        <SelectItem value="Internship">Internship</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="salary_range" className="text-slate-700 font-bold">Salary (Optional)</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="salary_range"
                                                        name="salary_range"
                                                        placeholder="e.g. $120k - $150k"
                                                        value={formData.salary_range}
                                                        onChange={handleChange}
                                                        className="pl-9 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="description" className="text-slate-700 font-bold">Job Description <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Tell us about the role, the team, and what makes it exciting..."
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="min-h-[200px] bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-4 leading-relaxed resize-y rounded-xl"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="requirements" className="text-slate-700 font-bold">Key Requirements</Label>
                                            <div className="relative">
                                                <ListChecks className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                                <Textarea
                                                    id="requirements"
                                                    name="requirements"
                                                    placeholder="- 5+ years of experience with React&#10;- Strong understanding of system design&#10;- Excellent communication skills"
                                                    value={formData.requirements}
                                                    onChange={handleChange}
                                                    className="pl-10 min-h-[150px] bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-4 leading-relaxed rounded-xl"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 ml-1 font-medium">Enter each requirement on a new line</p>
                                        </div>

                                        <div className="flex justify-end pt-8 border-t border-slate-100">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 rounded-xl font-bold shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-300"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Publishing...
                                                    </>
                                                ) : (
                                                    "Publish Job Listing"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
