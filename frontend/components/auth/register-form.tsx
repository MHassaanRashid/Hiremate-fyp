"use client"

import { useState } from "react"
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RegisterFormProps {
  formData: {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    role: string
    
  }
  handleInputChange: (field: string, value: string | boolean) => void
  handleRegister: (e: React.FormEvent) => void
  isLoading?: boolean
}

export default function RegisterForm({
  formData,
  handleInputChange,
  handleRegister,
  isLoading = false,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation
  const passwordsMatch = formData.password === formData.confirmPassword
  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.confirmPassword.trim() !== "" &&
    passwordsMatch

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {/* Full Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          id="register-name"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          className="pl-10 bg-blue-50/50 border-blue-200 text-gray-800 placeholder-gray-400 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl h-12"
          required
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          id="register-email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="pl-10 bg-blue-50/50 border-blue-200 text-gray-800 placeholder-gray-400 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl h-12"
          required
          disabled={isLoading}
        />
      </div>
      <p className="text-xs text-gray-500">Use a valid email (Gmail, Outlook, Yahoo, etc.)</p>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          id="register-password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          className="pl-10 pr-10 bg-blue-50/50 border-blue-200 text-gray-800 
            placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            rounded-xl h-12"
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          id="register-confirm-password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          className="pl-10 pr-10 bg-blue-50/50 border-blue-200 text-gray-800 
            placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            rounded-xl h-12"
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {!passwordsMatch && formData.confirmPassword && (
        <p className="text-red-500 text-sm">Passwords do not match</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
          text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all 
          duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          "Creating Account..."
        ) : (
          <>
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  )
}
