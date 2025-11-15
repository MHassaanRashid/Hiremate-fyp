"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-2xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Link href="/auth">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-800">Terms and Conditions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By creating an account with HireMate, you agree to be bound by these Terms and Conditions. 
            If you do not agree to these terms, please do not use our service.
          </p>
          
          <h2 className="text-xl font-semibold">2. Description of Service</h2>
          <p>
            HireMate is an AI-powered recruitment platform that connects job seekers with recruiters. 
            Our service includes features such as resume analysis, AI interviews, and job matching.
          </p>
          
          <h2 className="text-xl font-semibold">3. User Responsibilities</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their account information and 
            for all activities that occur under their account. Users agree to provide accurate and 
            complete information when creating an account.
          </p>
          
          <h2 className="text-xl font-semibold">4. Prohibited Activities</h2>
          <p>
            Users may not use the service for any illegal purposes or to solicit others to perform 
            or participate in any unlawful acts. Users may not use the service to post or transmit 
            any material that violates the rights of others.
          </p>
          
          <h2 className="text-xl font-semibold">5. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Our Privacy Policy, which is incorporated into these 
            Terms and Conditions, describes how we collect, use, and protect your personal information.
          </p>
          
          <h2 className="text-xl font-semibold">6. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account immediately, without prior 
            notice or liability, for any reason whatsoever, including without limitation if you 
            breach the Terms and Conditions.
          </p>
          
          <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
          <p>
            HireMate shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of the service.
          </p>
          
          <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms and 
            Conditions at any time. If a revision is material, we will try to provide at least 
            30 days notice prior to any new terms taking effect.
          </p>
          
          <h2 className="text-xl font-semibold">9. Contact Us</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at 
            support@hiremate.com.
          </p>
          
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}