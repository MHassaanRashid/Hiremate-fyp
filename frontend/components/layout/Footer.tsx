import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-white/80 backdrop-blur-xl border-t border-blue-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-3">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-800">HireMate</span>
            </div>
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
              Revolutionizing recruitment with AI-powered solutions that help you find, assess, and hire the best
              talent for your organization with unprecedented accuracy and efficiency.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Register
                </a>
              </li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-3 text-blue-600" />
                hello@hiremate.pk
              </li>
              <li className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-3 text-blue-600" />
                +92 21 3456 7890
              </li>
              <li className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                Karachi, Pakistan
              </li>
            </ul>
          </div>
        </div>
       <div className="border-t border-blue-200/50 mt-3 pt-3 text-center">
  <p className="text-gray-600">
    © {new Date().getFullYear()} HireMate. All rights reserved. | Privacy Policy | Terms of Service
  </p>
</div>

      </div>
    </footer>
  )
}