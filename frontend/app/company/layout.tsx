"use client"

import CompanySidebar from "@/components/company/CompanySidebar"
import { useState } from "react"

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50/50">
            <CompanySidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-y-auto h-screen">
                {children}
            </div>
        </div>
    )
}
