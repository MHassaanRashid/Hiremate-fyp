// frontend/layouts/CompanyLayout.tsx
import CompanySidebarLayout from "@/components/company/CompanySidebar";

interface CompanyLayoutProps {
    children: React.ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
    return <CompanySidebarLayout>{children}</CompanySidebarLayout>;
}
