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
  { icon: FileText, label: "Resume", path: "/candidate/resume" },
  { icon: Video, label: "AI Interviews", path: "/ai-interview" },
  { icon: Search, label: "Find Jobs", path: "/candidate/find-jobs" },
  { icon: Briefcase, label: "Applications", path: "/candidate/applications" },
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
      className="border-r border-sidebar-border shadow-sm"
      collapsible="icon"
    >
      {/* Sidebar Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden transition-all duration-300">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <span className="text-primary font-bold text-lg">H</span>
            </div>
            {isExpanded && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-xl font-bold text-sidebar-foreground whitespace-nowrap tracking-tight">
                  HireMate
                </span>
                <span className="text-xs text-sidebar-foreground/60 font-medium">Candidate Portal</span>
              </div>
            )}
          </div>
        </div>
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-8 z-50 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border shadow-md flex items-center justify-center transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/60",
            !isExpanded && "rotate-180"
          )}
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="px-2 py-4 gap-1">
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
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        active
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        !isExpanded && "justify-center px-2"
                      )}
                      title={!isExpanded ? item.label : undefined}
                    >
                      {/* Icon */}
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                        active ? "scale-105" : "group-hover:scale-110"
                      )} />

                      {/* Label */}
                      {isExpanded && (
                        <span className="truncate">
                          {item.label}
                        </span>
                      )}

                      {/* Active indicator (optional, maybe cleaner without) */}
                    </button>
                  </SidebarMenuItem>
                )
              })}

              {/* Divider */}
              <div className="my-4 px-2">
                <div className="h-px bg-sidebar-border/60" />
              </div>

              {/* Logout */}
              <SidebarMenuItem>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive",
                    !isExpanded && "justify-center px-2"
                  )}
                  title={!isExpanded ? "Logout" : undefined}
                >
                  <LogOut className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />

                  {isExpanded && (
                    <span className="font-medium">
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
        <SidebarFooter className="border-t border-sidebar-border/50 p-2">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-sidebar-accent rounded-lg p-2 transition-all duration-200 group"
            onClick={() => handleNavigation("/candidate/profile")}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="h-9 w-9 ring-1 ring-sidebar-border transition-all duration-200 group-hover:ring-sidebar-accent-foreground/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                  {getInitials(user.full_name || user.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-sidebar" />
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm font-semibold text-sidebar-foreground truncate leading-none mb-1">
                  {user.full_name || "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate leading-none">
                  {user.email}
                </p>
              </div>
            )}
            {isExpanded && (
              <Settings className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/80 transition-colors ml-auto" />
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
