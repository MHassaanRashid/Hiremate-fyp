"use client"
import React from 'react';
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building2,
  UserCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target
} from "lucide-react"

const AccessAccount = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative flex-grow flex items-center justify-center px-4 py-24">
        <div className="max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="bg-blue-500/10 border-blue-400/30 text-blue-600 px-6 py-3 text-lg backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Choose Your Path
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Access Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">HireMate</span> Account
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select your role to access the intelligent hiring platform
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Interviewer */}
            <Card className="group bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 px-4 py-2 mb-4"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Grow Your Career
                </Badge>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Become an Interviewer</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Join HireMate's network of expert interviewers. Conduct AI-assisted interviews,
                  leverage your expertise, and work with leading companies on your schedule.
                </p>
                <Link href="/auth/interviewer">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Interviewer Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Company */}
            <Card className="group bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 px-4 py-2 mb-4"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Hire Smarter
                </Badge>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">For Companies</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Transform your recruitment with HireMate's AI-powered platform. Automated screening,
                  intelligent interviews, and data-driven candidate rankings—all in one place.
                </p>
                <Link href="/auth/company">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Company Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Candidate */}
            <Card className="group bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <UserCheck className="h-10 w-10 text-white" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 px-4 py-2 mb-4"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ace Your Interview
                </Badge>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">For Candidates</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Prepare for success with HireMate's AI interview practice. Get expert feedback,
                  improve your skills, and showcase your talent to top hiring companies.
                </p>
                <Link href="/auth/candidate">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Candidate Login
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccessAccount;
