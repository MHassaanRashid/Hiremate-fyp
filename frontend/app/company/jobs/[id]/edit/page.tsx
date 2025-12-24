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
    ListChecks
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LocationInput } from "@/components/ui/location-input"

export default function EditJobPage({ params }: { params: { id: string } }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        job_title: "",
        company_name: "",
        location: "",
        job_type: "Full-time",
        salary_range: "",
        description: "",
        requirements: ""
    })

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/auth?tab=login")
                return
            }
            fetchJobDetails()
        }
    }, [user, isLoading, params.id])

    const fetchJobDetails = async () => {
        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const res = await fetch(`${backend}/jobs/${params.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            })
            if (!res.ok) throw new Error("Failed to fetch job")
            const data = await res.json()

            setFormData({
                job_title: data.job_title,
                company_name: data.company_name,
                location: data.location,
                job_type: data.job_type,
                salary_range: data.salary_range || "",
                description: data.description || "",
                requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : (data.requirements || "")
            })
        } catch (err) {
            setError("Failed to load job details")
        } finally {
            setLoading(false)
        }
    }

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

            const res = await fetch(`${backend}/jobs/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.detail || "Failed to update job")
            }

            router.push("/company/jobs")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 hover:bg-transparent hover:text-blue-600 pl-0"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-blue-100">
                    <CardHeader className="border-b border-blue-50/50 p-8 pb-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            Edit Job Details
                        </CardTitle>
                        <CardDescription className="text-slate-500">Update the information below.</CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 pt-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertTitle className="text-red-800">Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Basic Info Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="job_title" className="text-slate-700 font-medium">Job Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="job_title"
                                        name="job_title"
                                        value={formData.job_title}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="company_name" className="text-slate-700 font-medium">Company Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location & Type */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="location" className="text-slate-700 font-medium">Location <span className="text-red-500">*</span></Label>
                                    <LocationInput
                                        value={formData.location}
                                        onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                                        placeholder="e.g. Remote, NY"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-10"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="job_type" className="text-slate-700 font-medium">Type</Label>
                                    <Select
                                        value={formData.job_type}
                                        onValueChange={(val) => handleSelectChange("job_type", val)}
                                    >
                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700">
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

                                <div className="space-y-2.5">
                                    <Label htmlFor="salary_range" className="text-slate-700 font-medium">Salary (Optional)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="salary_range"
                                            name="salary_range"
                                            value={formData.salary_range}
                                            onChange={handleChange}
                                            className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="description" className="text-slate-700 font-medium">Job Description <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="min-h-[160px] bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-4 leading-relaxed resize-y"
                                    required
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="requirements" className="text-slate-700 font-medium">Key Requirements</Label>
                                <div className="relative">
                                    <ListChecks className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                    <Textarea
                                        id="requirements"
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleChange}
                                        className="pl-10 min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-4 leading-relaxed"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 ml-1">Enter each requirement on a new line</p>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-100 gap-4">
                                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
