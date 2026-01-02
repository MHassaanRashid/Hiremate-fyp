"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getAvailableSlots, bookSlot } from "@/lib/api/interview-workflow"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, User, CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { format } from "date-fns"

export default function CandidateSchedulingPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const stackFromUrl = searchParams.get('stack')
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [booking, setBooking] = useState(false)
    const [techStack, setTechStack] = useState(stackFromUrl || "React") // Use URL param if available

    useEffect(() => {
        if (!authLoading && user) {
            fetchInitialData()
        }
    }, [user, authLoading])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error("No token found")

            // Fetch Profile to get tech stack
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"
            const profRes = await fetch(`${backend}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "69420"
                }
            })

            let currentTech = techStack
            if (profRes.ok) {
                const data = await profRes.json()
                if (data.profile?.last_test_language) {
                    currentTech = data.profile.last_test_language
                    setTechStack(currentTech)
                }
            }

            // Fetch Slots
            const data = await getAvailableSlots(token, currentTech)
            setSlots(data.slots || [])
        } catch (error: any) {
            console.error("Error fetching data:", error)
            toast.error(error.message || "Failed to fetch available slots")
        } finally {
            setLoading(false)
        }
    }

    const handleBookSlot = async () => {
        if (!selectedSlot) return

        try {
            setBooking(true)
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error("No token found")

            await bookSlot(token, {
                interviewer_id: selectedSlot.interviewer_id,
                scheduled_at: selectedSlot.scheduled_at,
                job_title: "Full Stack Developer", // In real case, fetch from application/test context
                company_name: "HireMate Tech"
            })

            toast.success("Interview scheduled successfully!")
            router.push('/candidate/interviews')
        } catch (error: any) {
            console.error("Error booking slot:", error)
            toast.error("Failed to schedule interview")
        } finally {
            setBooking(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-12 relative z-10">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles className="w-3 h-3" />
                        Next Step: Live Interview
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                        Schedule Your {techStack} Interview
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        Congratulations! Your performance in the AI Quiz and clean monitoring record have qualified you for the live interview phase. Choose a slot that works for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Filter / Info Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">Session Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Badge className="bg-blue-600 hover:bg-blue-700">Live Technical</Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span>60 Minutes</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Video className="w-4 h-4 text-blue-500" />
                                    <span>Zoom Meeting</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Preparation Tips
                            </h3>
                            <ul className="text-xs space-y-2 opacity-90 font-medium">
                                <li>• Ensure your camera and mic are working</li>
                                <li>• Have a stable internet connection</li>
                                <li>• Be ready for live coding exercises</li>
                                <li>• The AI monitoring will be active</li>
                            </ul>
                        </div>
                    </div>

                    {/* Slots Grid */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-slate-900">Available Time Slots</h2>
                            <Badge variant="outline" className="bg-white">{slots.length} Options</Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {slots.map((slot) => {
                                const isSelected = selectedSlot?.id === slot.id
                                const date = new Date(slot.scheduled_at)

                                return (
                                    <div
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                                            ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600/20'
                                            : 'border-white bg-white/70 hover:border-blue-200 hover:bg-white shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                <span className="text-[10px] uppercase font-black">{format(date, 'MMM')}</span>
                                                <span className="text-lg font-bold leading-none">{format(date, 'dd')}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{format(date, 'EEEE, h:mm a')}</p>
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Interviewer: {slot.interviewer_name}
                                                </p>
                                            </div>
                                        </div>

                                        {isSelected ? (
                                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-300 transition-colors" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8">
                            <Button
                                disabled={!selectedSlot || booking}
                                onClick={handleBookSlot}
                                className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 group"
                            >
                                {booking ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Confirm and Schedule
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
