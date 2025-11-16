// frontend/layouts/CandidateLayout.tsx
import CandidateSidebarLayout from "@/components/candidate/CandidateSidebar";

interface CandidateLayoutProps {
  children: React.ReactNode;
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  return <CandidateSidebarLayout>{children}</CandidateSidebarLayout>;
}
