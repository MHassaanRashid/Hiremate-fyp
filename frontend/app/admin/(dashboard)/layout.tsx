"use client"

import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <SidebarProvider defaultOpen={true}>
                <AdminSidebar />
                <SidebarInset className="flex flex-col min-h-screen bg-transparent relative z-10">
                    <main className="flex-1 w-full p-4 md:p-6 lg:p-8">
                        <SidebarTrigger className="md:hidden mb-4" />
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
