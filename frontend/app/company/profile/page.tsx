"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { User, Mail, Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react"

export default function RecruiterProfilePage() {
    const { user, isLoading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
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

            setFormData({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                full_name: formData.full_name,
                // Email is usually not updateable this way in simple setups without verification, 
                // but we include it if the backend supports it.
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-2">Manage your personal account details.</p>
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
                                <User className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            className="pl-9 bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">Email cannot be changed.</p>
                                </div>
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
