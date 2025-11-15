// frontend/layouts/CandidateLayout.tsx
import CandidateLayoutComponent from "@/components/ui/sidebar/candiate_sidebar";

interface CandidateLayoutProps {
  children: React.ReactNode;
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  return <CandidateLayoutComponent>{children}</CandidateLayoutComponent>;
}