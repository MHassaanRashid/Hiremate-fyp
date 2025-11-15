"use client"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/40 backdrop-blur-xl border-b border-blue-200/50 shadow-sm" 
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold italic font-mono text-xl">HM</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-800">HireMate</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                href="/" 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/#features" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/#testimonials" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Testimonials
              </Link>
              <Link 
                href="/access-account" 
                className="text-gray-600 hover:text-blue-600 transition-colors border border-blue-600 px-4 py-2 rounded-md"
              >
                Login
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-xl border-t border-blue-200/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className="block px-3 py-2 text-blue-600 font-medium"
            >
              Home
            </Link>
            <Link 
              href="/#features" 
              className="block px-3 py-2 text-gray-600 hover:text-blue-600"
            >
              Features
            </Link>
            <Link 
              href="/#testimonials" 
              className="block px-3 py-2 text-gray-600 hover:text-blue-600"
            >
              Testimonials
            </Link>
            <Link 
              href="/access-account" 
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 border border-blue-600 rounded-md mx-3"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}