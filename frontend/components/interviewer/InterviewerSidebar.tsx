// frontend/components/interviewer/InterviewerSidebar.tsx
"use client"

import * as React from "react"
import {
    Home,
    Video,
    History,
    User,
    LogOut,
    ChevronLeft,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import toast from "react-hot-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
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
    { icon: Home, label: "Dashboard", path: "/interviewer" },
    { icon: Video, label: "Interviews", path: "/interviewer/interviews" },
    { icon: History, label: "History", path: "/interviewer/history" },
    { icon: User, label: "Profile", path: "/interviewer/profile" },
]

function AppSidebar() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { state, openMobile, setOpenMobile, toggleSidebar } = useSidebar()
    const isExpanded = state === "expanded"

    const isActive = (path: string) => {
        if (path === "/interviewer") {
            return pathname === "/interviewer"
        }
        return pathname.startsWith(path)
    }

    const handleLogout = async () => {
        try {
            await logout()
            toast.success("Logged out successfully")
            router.push("/auth/interviewer")
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
                                <span className="text-xs text-slate-500">Interviewer Portal</span>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "absolute -right-3 top-20 z-50 w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-blue-700",
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
                                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                                !isExpanded && "justify-center px-3"
                                            )}
                                            title={!isExpanded ? item.label : undefined}
                                        >
                                            <item.icon className={cn(
                                                "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                                                active ? "scale-110" : "group-hover:scale-110"
                                            )} />

                                            {isExpanded && (
                                                <span className="font-medium">
                                                    {item.label}
                                                </span>
                                            )}
                                        </button>
                                    </SidebarMenuItem>
                                )
                            })}

                            {/* Divider */}
                            <div className="my-3 border-t border-slate-200" />

                            {/* Logout */}
                            <SidebarMenuItem>
                                <button
                                    onClick={handleLogout}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden text-rose-600 hover:bg-rose-50 hover:text-rose-700",
                                        !isExpanded && "justify-center px-3"
                                    )}
                                    title={!isExpanded ? "Logout" : undefined}
                                >
                                    <LogOut className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />

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
                <SidebarFooter className="border-t border-slate-200 p-3">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-2.5 transition-all duration-200 group"
                        onClick={() => handleNavigation("/interviewer/profile")}
                    >
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10 border-2 border-blue-100 group-hover:border-blue-200 transition-all duration-200">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                    {getInitials(user.full_name || user.email || "U")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>
                        {isExpanded && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {user.full_name || "Interviewer"}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
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

interface InterviewerSidebarLayoutProps {
    children: React.ReactNode
}

export default function InterviewerSidebarLayout({ children }: InterviewerSidebarLayoutProps) {
    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset className="flex flex-col min-h-screen bg-transparent relative z-10">
                    <main className="flex-1 w-full">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
