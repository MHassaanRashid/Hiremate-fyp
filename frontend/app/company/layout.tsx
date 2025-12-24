"use client"

import CompanyLayout from "@/layouts/CompanyLayout"

export default function CompanyAppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <CompanyLayout>{children}</CompanyLayout>
}
