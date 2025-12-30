"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function AdminLoginPage() {
    const { loginWithEmail, isLoading } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    useEffect(() => {
        router.prefetch("/admin/dashboard")
    }, [router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await loginWithEmail(formData.email, formData.password, "admin")
            toast.success("Welcome back, Admin")
        } catch (error: any) {
            toast.error(error.message || "Failed to login")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <AnimatedBackground />

            <div className="relative z-10 w-full max-w-sm px-4">
                <div className="mb-6 text-center">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-md mb-4 border border-slate-100">
                        <span className="text-blue-600 font-bold italic font-mono text-xl">HM</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
                    <p className="text-slate-500 text-sm mt-1">Please sign in to continue</p>
                </div>

                <Card className="w-full shadow-lg border-slate-100 bg-white">
                    <CardHeader className="space-y-1 pb-4 pt-6">
                        <div className="flex justify-center mb-2">
                            <div className="p-2 bg-blue-50 rounded-full">
                                <ShieldCheck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-lg font-semibold text-center text-slate-900">Authenticate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-600 text-xs uppercase font-bold tracking-wider">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@hiremate.com"
                                        className="pl-9 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-600 text-xs uppercase font-bold tracking-wider">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-all mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Checking Credentials..." : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-400 text-xs mt-6">
                    © 2024 HireMate Inc. Secure System.
                </p>
            </div>
        </div>
    )
}
