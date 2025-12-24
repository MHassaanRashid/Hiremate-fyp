"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Building2, Globe, FileText, Loader2, Save, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react"

export default function CompanySettingsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        company_name: "",
        company_logo: "",
        company_description: "",
        website: "",
        full_name: "",
        email: ""
    })

    useEffect(() => {
        if (user) {
            fetchProfile()
        }
    }, [user])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const res = await fetch(`${backend}/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            })

            if (!res.ok) throw new Error("Failed to load profile")

            const data = await res.json()
            const profile = data.profile

            // Get company name from profile response (preferred) or metadata
            const metaCompanyName = profile.company_name || user?.user_metadata?.company_name || user?.user_metadata?.cname || ""

            setFormData({
                company_name: metaCompanyName,
                company_logo: profile.company_logo || "",
                company_description: profile.company_description || "",
                website: profile.website || "",
                full_name: profile.full_name || "",
                email: profile.email || ""
            })
        } catch (err) {
            console.error(err)
            setError("Failed to load profile data")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"

            const payload = {
                company_logo: formData.company_logo,
                company_description: formData.company_description,
                website: formData.website,
                full_name: formData.full_name,
                company_name: formData.company_name
            }

            const res = await fetch(`${backend}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to update profile")

            setSuccess(true)

            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)

        } catch (err: any) {
            setError(err.message || "Failed to update profile")
        } finally {
            setSubmitting(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-blue-50/30">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Company Settings</h1>
                    <p className="text-slate-500 mt-2">Manage your company branding and public profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800">Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-200 bg-green-50 text-green-900">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success</AlertTitle>
                            <AlertDescription>Your profile has been updated successfully.</AlertDescription>
                        </Alert>
                    )}

                    <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg font-semibold">Company Details</CardTitle>
                            </div>
                            <CardDescription>This information will be displayed on your job posts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name</Label>
                                    <Input
                                        id="company_name"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        placeholder="Enter your company name"
                                    />
                                    <p className="text-xs text-slate-400">This will be displayed on your job posts.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="website"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="pl-9"
                                            placeholder="https://acme.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_logo">Company Logo URL</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="company_logo"
                                        name="company_logo"
                                        value={formData.company_logo}
                                        onChange={handleChange}
                                        className="pl-9"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Provide a direct link to your logo image.</p>
                                {formData.company_logo && (
                                    <div className="mt-2 p-2 border border-slate-100 rounded-lg inline-block bg-slate-50">
                                        <img src={formData.company_logo} alt="Logo Preview" className="h-12 object-contain" onError={(e) => (e.currentTarget.src = "/placeholder.svg")} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_description">About Company</Label>
                                <Textarea
                                    id="company_description"
                                    name="company_description"
                                    value={formData.company_description}
                                    onChange={handleChange}
                                    className="min-h-[120px] resize-y"
                                    placeholder="Tell candidates about your mission, culture, and what verifies you..."
                                />
                            </div>

                        </CardContent>
                    </Card>


                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[140px]" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    )
}
