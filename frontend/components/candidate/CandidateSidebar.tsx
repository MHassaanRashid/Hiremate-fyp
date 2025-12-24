// frontend/components/candidate/CandidateSidebar.tsx
"use client"

import * as React from "react"
import {
  Home,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  Calendar,
  Search,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import toast from "react-hot-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/candidate" },
  { icon: Search, label: "Find Jobs", path: "/candidate/find-jobs" },
  { icon: Briefcase, label: "Applications", path: "/candidate/applications" },
  { icon: FileText, label: "Tests", path: "/candidate/tests" },
  { icon: Calendar, label: "Interviews", path: "/candidate/interviews" },
  { icon: User, label: "Profile", path: "/candidate/profile" },
  { icon: FileText, label: "Resume", path: "/candidate/resume" },
  { icon: Settings, label: "Settings", path: "/candidate/settings" },
]

function AppSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { state, openMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const isExpanded = state === "expanded"

  const isActive = (path: string) => {
    if (path === "/candidate") {
      return pathname === "/candidate"
    }
    return pathname.startsWith(path)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push("/auth/candidate")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    if (openMobile) {
      setOpenMobile(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)
  }

  return (
    <Sidebar
      side="left"
      className="border-r border-slate-200 bg-white"
      collapsible="icon"
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-blue-700",
          !isExpanded && "rotate-180"
        )}
      >
        <ChevronLeft className="w-3 h-3 text-white" />
      </button>

      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <span className="text-white font-bold text-lg">HM</span>
            </div>
            {isExpanded && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900">
                  HireMate
                </span>
                <span className="text-xs text-slate-500">Candidate Portal</span>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <SidebarMenuItem key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 flex-shrink-0")} />
                      {isExpanded && (
                        <span className="font-medium text-sm truncate">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      {user && (
        <SidebarFooter className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <Avatar className="w-9 h-9 border-2 border-white shadow-sm flex-shrink-0">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                {getInitials(user.full_name || user.email || "U")}
              </AvatarFallback>
            </Avatar>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

interface CandidateSidebarLayoutProps {
  children: React.ReactNode
}

export default function CandidateSidebarLayout({ children }: CandidateSidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <main className="flex-1 w-full">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
