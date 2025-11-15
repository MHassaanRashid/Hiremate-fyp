import AuthPageInner from "../AuthPageInner"

interface AuthPageProps {
  params: {
    role: "candidate" | "company" | "interviewer"
  }
}

export default function AuthPage({ params }: AuthPageProps) {
  return <AuthPageInner role={params.role} />
}
