"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Briefcase, Users, Calendar, Settings, LayoutDashboard, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/company" },
  { icon: Briefcase, label: "My Jobs", path: "/company/jobs" },
  { icon: Users, label: "Candidates", path: "/company/candidates" },
  { icon: Calendar, label: "Interviews", path: "/company/interviews" },
  { icon: Settings, label: "Settings", path: "/company/settings" },
  { icon: LogOut, label: "Logout", path: "/logout" },
]

export default function CompanySidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("Dashboard")

  const getInitials = (name: string) =>
    name.split(" ").map((part) => part[0].toUpperCase()).join("").substring(0, 2)

  return (
    <div
      className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-blue-200/50 shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-blue-200/50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="ml-2 text-xl font-bold text-gray-800">HireMate</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon
            const isActive = item.label === activeSection

            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-left py-3 px-4 rounded-xl transition-all duration-200 gap-3 ${isActive
                  ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300"
                  : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
                  }`}
                onClick={() => {
                  if (item.label === "Logout") {
                    logout()
                  } else {
                    setActiveSection(item.label)
                    router.push(item.path)
                  }
                }}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </Button>
            )
          })}
        </div>
      </nav>

      {/* User Profile in Sidebar */}
      <div
        className="absolute bottom-6 left-4 right-4 cursor-pointer"
        onClick={() => router.push("/company/profile")}
      >
        <Card className="bg-blue-50/50 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(user?.full_name || user?.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.full_name || "User"}
                </p>
                <div className="flex items-center">
                  <p className="text-xs text-gray-600 truncate mr-2">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {user?.role || "recruiter"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}