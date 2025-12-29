import InterviewerSidebarLayout from "@/components/interviewer/InterviewerSidebar";

export default function InterviewerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <InterviewerSidebarLayout>{children}</InterviewerSidebarLayout>
}
