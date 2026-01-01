import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-blue-50 to-white border-t border-blue-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold italic font-mono text-xl">HM</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-800">HireMate</span>
            </Link>
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
              Transform your recruitment with AI-powered solutions. Find, assess, and hire exceptional talent
              with intelligent automation and data-driven insights.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Features</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#testimonials"
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Testimonials</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/access-account"
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Get Started</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-gray-600 group">
                <Mail className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="mailto:hello@hiremate.pk" className="hover:text-blue-600 transition-colors">
                  hello@hiremate.pk
                </a>
              </li>
              <li className="flex items-start text-gray-600 group">
                <Phone className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="tel:+922134567890" className="hover:text-blue-600 transition-colors">
                  +92 21 3456 7890
                </a>
              </li>
              <li className="flex items-start text-gray-600 group">
                <MapPin className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>Karachi, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-200/50 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-600 text-sm text-center md:text-left">
            © {new Date().getFullYear()} HireMate. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link
              href="/terms"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}