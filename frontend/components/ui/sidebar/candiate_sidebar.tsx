// frontend/components/ui/sidebar/candiate_sidebar.tsx
import * as React from "react"
import {
  FileText,
  Video,
  TrendingUp,
  LogOut,
  Settings,
  Bell,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const sidebarItems = [
  { icon: FileText, label: "Resume", path: "/candidate/resume" },
  { icon: Video, label: "Interviews", path: "/ai-interview" },
  { icon: TrendingUp, label: "Rankings", path: "/candidates" },
  { icon: Settings, label: "Settings", path: "/candidate-profile" },
]

// Custom component for the sidebar content to properly use useSidebar hook
function AppSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { state, openMobile, setOpenMobile } = useSidebar()
  const isExpanded = state === "expanded"
  
  // Find active section based on current path
  const activeSection = sidebarItems.find(item => item.path === pathname)?.label || ""

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/auth")
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
      className="bg-white/80 backdrop-blur-xl border-r border-blue-200/50 shadow-lg shadow-blue-500/10 transition-all duration-300"
      collapsible="icon"
    >
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-blue-200/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <span className="text-white font-bold text-lg">HM</span>
            </div>
            {/* Text only shown when expanded */}
            {isExpanded && (
              <span className="ml-2 text-xl font-bold text-gray-800 whitespace-nowrap">
                HireMate
              </span>
            )}
          </div>
          <SidebarTrigger className="text-gray-600 hover:text-gray-800 flex-shrink-0" />
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full justify-start text-left py-3 px-4 rounded-xl transition-all duration-200 flex items-center ${
                      item.label === activeSection
                        ? "bg-gradient-to-r from-blue-100 to-cyan-50 text-blue-700 border border-blue-300/50"
                        : "text-gray-600 hover:text-gray-800 hover:bg-blue-50/50"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isExpanded && (
                      <span className="ml-3 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Logout */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full justify-start text-left py-3 px-4 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-red-50/50"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="ml-3 whitespace-nowrap">
                      Logout
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer (User Profile) */}
      {user && (
        <SidebarFooter className="border-t border-blue-200/50">
          <div className="p-4">
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4 overflow-hidden">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(user.full_name || user.email || "U")}
                  </AvatarFallback>
                </Avatar>
                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user.full_name || "User"}
                    </p>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-600 truncate mr-2">
                        {user.email}
                      </p>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {user.role || "job-seeker"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

interface CandidateLayoutProps {
  children: React.ReactNode
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  const { user } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10">
        <SidebarProvider>
          <AppSidebar />
          
          {/* Main Content Area */}
          <SidebarInset className="flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-blue-200/50 px-4 sm:px-6 py-4 shadow-sm shadow-blue-500/10 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                      Welcome back,{" "}
                      {user?.full_name ||
                        user?.email?.split("@")[0] ||
                        "User"}
                      !
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                      Here's your job search progress
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                  {user && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {getInitials(user.full_name || user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}