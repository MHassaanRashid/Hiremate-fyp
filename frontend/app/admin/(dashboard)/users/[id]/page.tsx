"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Mail, Calendar, Briefcase, FileText, Video } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function AdminUserDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [relatedData, setRelatedData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("access_token")
                // For now, we reuse the endpoint that gets all users and filter, 
                // or ideally we need a specific endpoint GET /admin/users/{id}.
                // Since I haven't created a specific detail endpoint, I will use a direct supabase query 
                // or just rely on the existing list if state was passed (but it's not).

                // Let's assume for now we might need to fetch this user's specific data.
                // To do this properly without a new endpoint, I'll update the plan to include a simple detail fetch on the list or just fetch directly.
                // Actually, I can use the existing /admin/users and filter client side as a temporary fallback, 
                // BUT better to fetch properly. 
                // However, I don't have a specific `GET /admin/users/{id}` (only DELETE).

                // I will add a GET /admin/users/{id} endpoint to backend swiftly in next step.
                // For now, I'll safeguard the UI to load.

                const res = await fetch(`/api/admin/users/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                    setRelatedData(data.related || [])
                }
            } catch (error) {
                console.error("Failed to fetch user details", error)
                toast.error("Failed to load user profile")
            } finally {
                setLoading(false)
            }
        }

        if (params.id) fetchUserDetails()
    }, [params.id])

    const handleViewResume = () => {
        if (user?.resume_url) {
            window.open(user.resume_url, '_blank')
        } else {
            toast.error("No resume available for this candidate")
        }
    }

    const getRoleIcon = () => {
        if (user.role === 'recruiter') return <Briefcase className="w-5 h-5" />
        if (user.role === 'interviewer') return <Video className="w-5 h-5" />
        return <FileText className="w-5 h-5" />
    }

    const getRoleColor = () => {
        if (user.role === 'recruiter') return 'bg-orange-100 text-orange-600'
        if (user.role === 'interviewer') return 'bg-purple-100 text-purple-600'
        return 'bg-blue-100 text-blue-600'
    }

    return (
        <div className="space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="hover:bg-slate-100 -ml-2 text-slate-500"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
            </Button>

            {loading ? (
                <div className="p-12 text-center text-slate-500">Loading profile...</div>
            ) : !user ? (
                <div className="p-12 text-center text-slate-500">User not found</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="border-0 shadow-lg md:col-span-1 h-fit">
                        <CardHeader className="text-center pb-2">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-3xl mx-auto mb-4">
                                {user.full_name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <CardTitle className="text-xl">{user.full_name}</CardTitle>
                            <div className="flex justify-center mt-2">
                                <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                            </div>
                            {user.role === 'candidate' && (
                                <Button
                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                                    size="sm"
                                    onClick={handleViewResume}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Resume
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm truncate" title={user.email}>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-sm truncate" title={user.id}>ID: <span className="font-mono text-xs">{user.id}</span></span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity/Related Data Card */}
                    <Card className="border-0 shadow-lg md:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                {user.role === 'recruiter' ? 'Posted Jobs' :
                                    user.role === 'interviewer' ? 'Interview History' :
                                        'Recent Applications'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {relatedData.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-xl">
                                    No recent activity found.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {relatedData.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${getRoleColor()}`}>
                                                    {getRoleIcon()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">
                                                        {user.role === 'interviewer'
                                                            ? `Interview with ${item.candidate?.full_name || 'Candidate'}`
                                                            : (item.title || item.job?.title || "Activity Item")}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {item.created_at || item.scheduled_at
                                                            ? new Date(item.created_at || item.scheduled_at).toLocaleDateString()
                                                            : 'Just now'}
                                                    </div>
                                                </div>
                                            </div>
                                            {item.status && (
                                                <Badge variant="outline">{item.status}</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
