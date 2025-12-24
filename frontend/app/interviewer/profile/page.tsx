"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import InterviewerLayout from "@/layouts/InterviewerLayout"
import { getInterviewerProfile, updateInterviewerProfile } from "@/lib/api/interviewer"
import type { InterviewerProfile, UpdateInterviewerProfileRequest } from "@/types/interviewer"
import { User, Save, AlertCircle, Briefcase, Calendar, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<InterviewerProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState<UpdateInterviewerProfileRequest>({
        name: "",
        expertise: [],
        skills: [],
        availability: {},
        preferredTimeSlots: [],
        bio: "",
        linkedIn: "",
    })

    const [newExpertise, setNewExpertise] = useState("")
    const [newSkill, setNewSkill] = useState("")

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return

            try {
                setIsLoading(true)
                const token = localStorage.getItem('access_token')
                if (!token) throw new Error('No access token')

                const data = await getInterviewerProfile(token)
                setProfile(data)
                setFormData({
                    name: data.name || "",
                    expertise: data.expertise || [],
                    skills: data.skills || [],
                    availability: data.availability || {},
                    preferredTimeSlots: data.preferredTimeSlots || [],
                    bio: data.bio || "",
                    linkedIn: data.linkedIn || "",
                })
            } catch (err: any) {
                console.error('Error fetching profile:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (!authLoading && user) {
            fetchProfile()
        }
    }, [user, authLoading])

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const token = localStorage.getItem('access_token')
            if (!token) throw new Error('No access token')

            await updateInterviewerProfile(token, formData)
            toast.success('Profile updated successfully')
        } catch (err: any) {
            toast.error('Failed to update profile')
            console.error('Error updating profile:', err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddExpertise = () => {
        if (newExpertise.trim() && !formData.expertise?.includes(newExpertise.trim())) {
            setFormData({
                ...formData,
                expertise: [...(formData.expertise || []), newExpertise.trim()],
            })
            setNewExpertise("")
        }
    }

    const handleRemoveExpertise = (item: string) => {
        setFormData({
            ...formData,
            expertise: formData.expertise?.filter(e => e !== item),
        })
    }

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...(formData.skills || []), newSkill.trim()],
            })
            setNewSkill("")
        }
    }

    const handleRemoveSkill = (item: string) => {
        setFormData({
            ...formData,
            skills: formData.skills?.filter(s => s !== item),
        })
    }

    const handleAvailabilityChange = (day: string, checked: boolean) => {
        setFormData({
            ...formData,
            availability: {
                ...formData.availability,
                [day]: checked,
            },
        })
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <InterviewerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <p className="text-rose-600 mb-4">{error || 'Profile not found'}</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </div>
            </InterviewerLayout>
        )
    }

    if (isLoading) {
        return (
            <InterviewerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 border-t-2 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </InterviewerLayout>
        )
    }

    return (
        <InterviewerLayout>
            <div className="p-6 space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                        <p className="text-slate-600 mt-1">Manage your interviewer profile and preferences</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Basic Information */}
                <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-600" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={profile.email} disabled className="bg-slate-50" />
                        </div>
                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label htmlFor="linkedin">LinkedIn Profile</Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    id="linkedin"
                                    value={formData.linkedIn}
                                    onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                                    placeholder="https://linkedin.com/in/your-profile"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Expertise */}
                <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                            Expertise
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={newExpertise}
                                onChange={(e) => setNewExpertise(e.target.value)}
                                placeholder="Add expertise area..."
                                onKeyPress={(e) => e.key === 'Enter' && handleAddExpertise()}
                            />
                            <Button onClick={handleAddExpertise} variant="outline">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.expertise?.map((item, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-indigo-50 border-indigo-300 text-indigo-700 px-3 py-1 cursor-pointer hover:bg-indigo-100"
                                    onClick={() => handleRemoveExpertise(item)}
                                >
                                    {item} ×
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                            Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add skill..."
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            />
                            <Button onClick={handleAddSkill} variant="outline">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills?.map((item, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-blue-50 border-blue-300 text-blue-700 px-3 py-1 cursor-pointer hover:bg-blue-100"
                                    onClick={() => handleRemoveSkill(item)}
                                >
                                    {item} ×
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Availability */}
                <Card className="bg-white/80 backdrop-blur-xl border-indigo-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                            Availability
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {days.map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={day}
                                        checked={formData.availability?.[day as keyof typeof formData.availability] || false}
                                        onCheckedChange={(checked) =>
                                            handleAvailabilityChange(day, checked as boolean)
                                        }
                                    />
                                    <Label
                                        htmlFor={day}
                                        className="text-sm font-medium capitalize cursor-pointer"
                                    >
                                        {day}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </InterviewerLayout>
    )
}
