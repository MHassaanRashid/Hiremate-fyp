// frontend/components/candidate/CandidateSidebar.tsx
"use client"

import * as React from "react"
import {
  Home,
  FileText,
  Video,
  Briefcase,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/candidate" },
  { icon: Search, label: "Find Jobs", path: "/candidate/find-jobs" },
  { icon: FileText, label: "Resume", path: "/candidate/resume" },
  { icon: Video, label: "AI Interviews", path: "/ai-interview" },
  { icon: Briefcase, label: "Applications", path: "/candidate/applications" },
  { icon: Calendar, label: "My Interviews", path: "/candidate/interviews" },
  { icon: User, label: "Profile", path: "/candidate/profile" },
  { icon: Settings, label: "Settings", path: "/candidate/settings" },
]

// AppSidebar Component using shadcn sidebar primitives
function AppSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { state, openMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const isExpanded = state === "expanded"

  // Find active section based on current path
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
    // Close mobile sidebar after navigation
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
      className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50"
      collapsible="icon"
    >
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0 ring-2 ring-blue-400/20">
              <span className="text-white font-bold text-lg">HM</span>
            </div>
            {isExpanded && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white whitespace-nowrap">
                  HireMate
                </span>
                <span className="text-xs text-slate-400">Candidate Portal</span>
              </div>
            )}
          </div>
        </div>
        {/* Toggle Button - Separate from header */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-slate-900 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30",
            !isExpanded && "rotate-180"
          )}
        >
          <ChevronLeft className="w-3 h-3 text-white" />
        </button>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {sidebarItems.map((item) => {
                const active = isActive(item.path)
                return (
                  <SidebarMenuItem key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        active
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                        !isExpanded && "justify-center px-3"
                      )}
                      title={!isExpanded ? item.label : undefined}
                    >
                      {/* Hover effect background */}
                      {!active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}

                      {/* Icon */}
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 relative z-10 transition-transform duration-200",
                        active ? "scale-110" : "group-hover:scale-110"
                      )} />

                      {/* Label */}
                      {isExpanded && (
                        <span className="relative z-10 font-medium">
                          {item.label}
                        </span>
                      )}

                      {/* Active indicator */}
                      {active && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                      )}
                    </button>
                  </SidebarMenuItem>
                )
              })}

              {/* Divider */}
              <div className="my-3 border-t border-slate-700/50" />

              {/* Logout */}
              <SidebarMenuItem>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden text-red-400 hover:bg-red-500/10 hover:text-red-300",
                    !isExpanded && "justify-center px-3"
                  )}
                  title={!isExpanded ? "Logout" : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <LogOut className="h-5 w-5 flex-shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-110" />

                  {isExpanded && (
                    <span className="relative z-10 font-medium">
                      Logout
                    </span>
                  )}
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer (User Profile) */}
      {user && (
        <SidebarFooter className="border-t border-slate-700/50 p-3">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 rounded-xl p-2.5 transition-all duration-200 group"
            onClick={() => handleNavigation("/candidate-profile")}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="h-10 w-10 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-200">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {getInitials(user.full_name || user.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
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
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col min-h-screen">
          {/* Page Content */}
          <main className="flex-1 w-full">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
