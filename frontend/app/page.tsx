"use client"
import { useState } from "react"
import {
  ArrowRight,
  FileText,
  Video,
  Star,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Users,
  Target,
  BarChart3,
  CheckCircle2,
  Clock,
  Brain,
  Rocket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const features = [
  {
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "AI-powered resume screening that identifies top candidates in seconds, analyzing skills, experience, and cultural fit with advanced machine learning.",
    color: "from-blue-500 to-cyan-500",
    glowColor: "shadow-blue-500/30",
  },
  {
    icon: Video,
    title: "AI Interview",
    description:
      "Automated video interviews with intelligent question generation, real-time candidate assessment, and behavioral analysis.",
    color: "from-blue-600 to-indigo-600",
    glowColor: "shadow-blue-600/30",
  },
  {
    icon: Shield,
    title: "Dishonesty Detection",
    description:
      "Advanced behavioral analysis and micro-expression detection to identify inconsistencies and ensure authentic responses.",
    color: "from-indigo-500 to-purple-500",
    glowColor: "shadow-indigo-500/30",
  },
  {
    icon: TrendingUp,
    title: "Candidate Ranking",
    description:
      "Intelligent scoring system that ranks candidates based on skills, experience, cultural fit, and performance metrics.",
    color: "from-cyan-500 to-blue-500",
    glowColor: "shadow-cyan-500/30",
  },
]

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Candidates Screened",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Clock,
    value: "60%",
    label: "Faster Hiring",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: BarChart3,
    value: "95%",
    label: "Accuracy Rate",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: CheckCircle2,
    value: "500+",
    label: "Companies Trust Us",
    color: "from-blue-600 to-indigo-600",
  },
]

const howItWorks = [
  {
    step: "01",
    title: "Upload Resume",
    description:
      "Candidates submit their resumes through our intelligent platform for instant AI-powered analysis.",
    icon: FileText,
  },
  {
    step: "02",
    title: "AI Screening",
    description:
      "Our advanced AI analyzes resumes, matching skills and experience with your job requirements.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Smart Interview",
    description:
      "Qualified candidates participate in AI-conducted video interviews with adaptive questioning.",
    icon: Video,
  },
  {
    step: "04",
    title: "Get Top Talent",
    description:
      "Receive ranked candidates with detailed insights, ready for your final decision.",
    icon: Rocket,
  },
]

const testimonials = [
  {
    name: "Hassan Rashid",
    role: "HR Director",
    company: "Systems Limited",
    content:
      "HireMate transformed our hiring process completely. We reduced time-to-hire by 60% while improving candidate quality significantly. The AI insights are incredible.",
    rating: 5,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Ahsan Faraz",
    role: "Talent Acquisition Manager",
    company: "TechLogix",
    content:
      "The AI interview feature is revolutionary. It helps us identify the best candidates even before the first human interaction. Our hiring accuracy has improved dramatically.",
    rating: 5,
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Zaigham Abbas",
    role: "Recruiting Lead",
    company: "NetSol Technologies",
    content:
      "Finally, a platform that understands both technical skills and cultural fit. Our team satisfaction has never been higher, and onboarding is smoother than ever.",
    rating: 5,
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

const faqs = [
  {
    question: "How accurate is the AI resume analysis?",
    answer:
      "Our AI achieves 95%+ accuracy in candidate screening by analyzing over 200 data points including skills, experience, education, and cultural fit indicators.",
  },
  {
    question: "Can candidates cheat during AI interviews?",
    answer:
      "Our advanced dishonesty detection system monitors micro-expressions, speech patterns, and behavioral cues to identify inconsistencies and ensure authentic responses.",
  },
  {
    question: "How long does the AI interview process take?",
    answer:
      "Typically 15-30 minutes per candidate, depending on the role complexity. The AI adapts question difficulty based on responses for optimal assessment.",
  },
  {
    question: "Is the platform suitable for all industries?",
    answer:
      "Yes, HireMate is designed to work across all industries with customizable assessment criteria, question banks, and evaluation metrics for different roles.",
  },
]

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/80 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-500/80 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-cyan-400/80 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Header Component */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge
              variant="outline"
              className="bg-blue-500/10 border-blue-400/30 text-blue-600 px-6 py-3 text-lg backdrop-blur-sm mb-8 animate-fade-in"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              AI-Powered Recruitment Excellence
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8 leading-tight animate-fade-in-up">
              Find Top Talent with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                AI Precision
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Streamline your hiring with intelligent resume screening, AI-driven interviews, and data-backed candidate rankings.
              Hire smarter, faster, and with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-7 text-xl font-semibold shadow-2xl shadow-blue-500/30 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Rocket className="mr-3 h-6 w-6" />
                Start Hiring Smarter
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200/50 shadow-2xl">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-6 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Empowering Smarter Hiring</h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                <span className="font-semibold text-blue-600">HireMate</span> eliminates bias and inefficiency in recruitment through
                advanced artificial intelligence. We provide organizations with intelligent tools to identify, assess, and hire
                exceptional talent — ensuring fair evaluation, faster decisions, and better team fit. Our platform transforms
                hiring from guesswork into a data-driven science.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Proven Results</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform delivers measurable impact for companies worldwide
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="group bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our streamlined process makes hiring intelligent, efficient, and effortless
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 hover:shadow-2xl transition-all duration-500 shadow-lg h-full">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold text-blue-600/20 mb-4">{step.step}</div>
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Powerful AI-Driven Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive suite of AI tools revolutionizes every step of your hiring process with unprecedented
              accuracy and efficiency.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg ${feature.glowColor}`}
                  >
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Trusted by Leading Organizations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how companies are transforming their hiring with HireMate's AI-powered platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 shadow-lg"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-8 italic leading-relaxed text-lg">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4 border-2 border-blue-400/30"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                      <p className="text-blue-600 font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our AI-powered recruitment platform.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-xl border-blue-200/50 hover:border-blue-300/30 transition-all duration-300 shadow-lg"
              >
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-blue-50/50 transition-colors duration-200"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="text-gray-800 font-semibold text-lg">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Hire Smarter?</h2>
              <p className="text-xl text-blue-50 mb-10 leading-relaxed max-w-2xl mx-auto">
                Join hundreds of forward-thinking companies using AI to build exceptional teams.
                Experience the future of recruitment today.
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-7 text-xl font-semibold shadow-2xl rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Rocket className="mr-3 h-6 w-6" />
                Begin Your Journey
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}
