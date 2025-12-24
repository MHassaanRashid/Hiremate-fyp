// frontend/layouts/InterviewerLayout.tsx
import InterviewerSidebarLayout from "@/components/interviewer/InterviewerSidebar";

interface InterviewerLayoutProps {
    children: React.ReactNode;
}

export default function InterviewerLayout({ children }: InterviewerLayoutProps) {
    return <InterviewerSidebarLayout>{children}</InterviewerSidebarLayout>;
}
