import AuthPageInner from "../AuthPageInner"
import { redirect } from "next/navigation"

interface AuthPageProps {
  params: {
    role: "candidate" | "company" | "interviewer"
  }
}

export default function AuthPage({ params }: AuthPageProps) {
  const allowed = ["candidate", "company", "interviewer"]
  const roleParam = String(params.role).toLowerCase()
  if (!allowed.includes(roleParam)) {
    redirect("/auth/candidate")
  }
  return <AuthPageInner role={roleParam as "candidate" | "company" | "interviewer"} />
}
