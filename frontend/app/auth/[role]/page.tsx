import { Suspense } from "react"
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
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    }>
      <AuthPageInner role={roleParam as "candidate" | "company" | "interviewer"} />
    </Suspense>
  )
}
