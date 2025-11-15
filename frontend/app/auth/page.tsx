"use client"

import { Suspense } from "react"
import AuthPageInner from "./AuthPageInner"

export default function AuthPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AuthPageInner role="candidate" />
    </Suspense>
  )
}
