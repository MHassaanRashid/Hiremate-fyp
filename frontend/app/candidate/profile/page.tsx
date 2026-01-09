"use client"

import { useEffect, useState } from "react"
import { GeoapifyPlacesInput } from "@/components/ui/GooglePlacesInput"
import {
  Mail,
  MapPin,
  Phone,
  Loader2,
  Save,
  Camera,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import CandidateLayout from "@/layouts/CandidateLayout"
import { supabase } from "@/lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import toast from "react-hot-toast"

export default function CandidateProfilePage() {
  const { user, isLoading: authLoading } = useAuth()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  // Comprehensive cities list for autocomplete
  const popularCities = [
    // USA
    "New York, NY, USA",
    "Los Angeles, CA, USA",
    "Chicago, IL, USA",
    "Houston, TX, USA",
    "Phoenix, AZ, USA",
    "Philadelphia, PA, USA",
    "San Antonio, TX, USA",
    "San Diego, CA, USA",
    "Dallas, TX, USA",
    "San Jose, CA, USA",
    "Austin, TX, USA",
    "Jacksonville, FL, USA",
    "Fort Worth, TX, USA",
    "Columbus, OH, USA",
    "San Francisco, CA, USA",
    "Charlotte, NC, USA",
    "Indianapolis, IN, USA",
    "Seattle, WA, USA",
    "Denver, CO, USA",
    "Boston, MA, USA",
    "Washington, DC, USA",
    "Nashville, TN, USA",
    "Detroit, MI, USA",
    "Portland, OR, USA",
    "Las Vegas, NV, USA",
    "Miami, FL, USA",
    "Atlanta, GA, USA",

    // UK
    "London, UK",
    "Manchester, UK",
    "Birmingham, UK",
    "Leeds, UK",
    "Glasgow, UK",
    "Edinburgh, UK",
    "Liverpool, UK",
    "Bristol, UK",

    // Canada
    "Toronto, ON, Canada",
    "Vancouver, BC, Canada",
    "Montreal, QC, Canada",
    "Calgary, AB, Canada",
    "Ottawa, ON, Canada",
    "Edmonton, AB, Canada",

    // Europe
    "Paris, France",
    "Berlin, Germany",
    "Madrid, Spain",
    "Rome, Italy",
    "Amsterdam, Netherlands",
    "Brussels, Belgium",
    "Vienna, Austria",
    "Stockholm, Sweden",
    "Copenhagen, Denmark",
    "Dublin, Ireland",
    "Zurich, Switzerland",
    "Barcelona, Spain",
    "Munich, Germany",
    "Milan, Italy",

    // Asia
    "Tokyo, Japan",
    "Singapore",
    "Hong Kong",
    "Seoul, South Korea",
    "Shanghai, China",
    "Beijing, China",
    "Dubai, UAE",
    "Mumbai, India",
    "Bangalore, India",
    "Delhi, India",
    "Bangkok, Thailand",
    "Kuala Lumpur, Malaysia",
    "Manila, Philippines",
    "Jakarta, Indonesia",

    // Australia & NZ
    "Sydney, Australia",
    "Melbourne, Australia",
    "Brisbane, Australia",
    "Perth, Australia",
    "Auckland, New Zealand",
    "Wellington, New Zealand",

    // Remote
    "Remote",
    "Remote - USA",
    "Remote - Europe",
    "Remote - Worldwide",
  ]

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Check if user signed in with Google
        let provider = null
        const token = localStorage.getItem("access_token")

        if (token) {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser(token)
          provider = supabaseUser?.app_metadata?.provider
        } else {
          const { data: { session } } = await supabase.auth.getSession()
          provider = session?.user?.app_metadata?.provider
        }
        setIsGoogleUser(provider === 'google')

        // Fetch profile from backend API
        if (token) {
          try {
            const response = await fetch("/api/candidate/settings/profile", {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            })

            if (response.ok) {
              const data = await response.json()
              setFullName(data.full_name || "")
              setEmail(data.email || "")
              setPhone(data.phone || "")
              setLocation(data.location || "")
            } else {
              // Fallback to user object
              setFullName(user.full_name || "")
              setEmail(user.email || "")
              setPhone(user.phone || "")
              setLocation(user.location || "")
            }
          } catch (err) {
            // Fallback to user object
            setFullName(user.full_name || "")
            setEmail(user.email || "")
            setPhone(user.phone || "")
            setLocation(user.location || "")
          }
        } else {
          // Fallback to user object
          setFullName(user.full_name || "")
          setEmail(user.email || "")
          setPhone(user.phone || "")
          setLocation(user.location || "")
        }

      } catch (error) {
        console.error("Error loading profile:", error)
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleLocationChange = (value: string) => {
    setLocation(value)

    if (value.length > 0) {
      const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      )
      setLocationSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectLocation = (city: string) => {
    setLocation(city)
    setShowSuggestions(false)
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Not authenticated")

      // Use the correct API endpoint with proper field names
      const response = await fetch("/api/candidate/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email, // Required by backend schema
          phone: phone,
          location: location,
          links: {
            portfolio: null,
            linkedin: null,
            github: null,
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to update profile")
      }

      // Reload profile to show updated values
      const updatedResponse = await fetch("/api/candidate/settings/profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (updatedResponse.ok) {
        const data = await updatedResponse.json()
        setFullName(data.full_name || "")
        setEmail(data.email || "")
        setPhone(data.phone || "")
        setLocation(data.location || "")
      }

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast.error(error.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      setChangingPassword(true)

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error.message || "Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  if (authLoading || !user || loading) {
    return (
      <CandidateLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8 relative">
          <AnimatedBackground />
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 md:p-8 relative">
        <AnimatedBackground />
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
            <p className="text-slate-600">Manage your account information and settings</p>
          </div>

          {/* Profile Information Card */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-blue-100 shadow-lg">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold">
                    {fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2" disabled>
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-slate-500">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="h-11 bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="h-11"
                />
              </div>

              {/* Location with Google Places Autocomplete */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <GeoapifyPlacesInput
                  value={location}
                  onChange={setLocation}
                  placeholder="City, Country"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 h-11 px-8"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {isGoogleUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    You signed in with Google. Password change is not available for Google accounts.
                  </p>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isGoogleUser}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={isGoogleUser}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={isGoogleUser}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isGoogleUser}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isGoogleUser}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isGoogleUser}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Change Password Button */}
              <div className="pt-4">
                <Button
                  onClick={handleChangePassword}
                  disabled={isGoogleUser || changingPassword || !newPassword || !confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700 h-11 px-8"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </CandidateLayout>
  )
}
