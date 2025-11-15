"use client"

import { Button } from "@/components/ui/button"

interface SocialLoginProps {
  mode: "login" | "signup"
  handleOAuthLogin: (provider: "google") => Promise<void>
}

export default function SocialLogin({ mode, handleOAuthLogin }: SocialLoginProps) {
  return (
    <div>
      <div className="mt-1">
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin("google")}
          className="w-full bg-blue-50/50 border-blue-200 text-gray-600 hover:bg-blue-100/50 hover:border-blue-300 rounded-xl h-12 flex items-center justify-center gap-2"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>
            {mode === "login" ? "Login with Google" : "Sign up with Google"}
          </span>
        </Button>
      </div>

      <div className="relative py-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-blue-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/80 text-black-500">OR</span>
        </div>
      </div>
    </div>
  )
}
