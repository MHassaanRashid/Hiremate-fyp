import React from 'react';
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

const AccessAccount = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 pb-20 pt-24">
        <div className="bg-white p-8 w-full flex flex-row space-x-8">
          {/* Interviewer */}
          <div className="text-center flex-1">
            <button className="bg-yellow-200 text-black rounded-full px-4 py-2 mb-4 flex items-center justify-center mx-auto">
              <span role="img" aria-label="money">💸</span> Earn & Grow 10x
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Become an Interviewer</h2>
            <p className="mt-4 text-gray-600">
              Join our community of freelance interviewers at Intervues. Gain exposure beyond your workspace and exercise the power of your knowledge and freedom.
            </p>
            <Link href="/auth/interviewer">
              <button className="bg-black text-white rounded px-4 py-2 mt-6 hover:bg-gray-800 transition-colors duration-200">
                Login
              </button>
            </Link>
          </div>

          <hr className="w-px h-auto bg-gray-200 mx-4" />

          {/* Company */}
          <div className="text-center flex-1">
            <button className="bg-green-200 text-black rounded-full px-4 py-2 mb-4 flex items-center justify-center mx-auto">
              <span role="img" aria-label="clock">⏳</span> Save 90% of hiring bandwidth
            </button>
            <h2 className="text-2xl font-bold text-gray-800">For Companies</h2>
            <p className="mt-4 text-gray-600">
              Conduct interviews asynchronously on Intervues platform by vetted interviewers. A detailed report of the candidate's performance is available within 5 minutes.
            </p>
            <Link href="/auth/company">
              <button className="bg-green-600 text-white rounded px-4 py-2 mt-6 hover:bg-green-700 transition-colors duration-200">
                Login
              </button>
            </Link>
          </div>

          <hr className="w-px h-auto bg-gray-200 mx-4" />

          {/* Candidate */}
          <div className="text-center flex-1">
            <button className="bg-blue-200 text-black rounded-full px-4 py-2 mb-4 flex items-center justify-center mx-auto">
              <span role="img" aria-label="chat">💬</span> Mock interviews
            </button>
            <h2 className="text-2xl font-bold text-gray-800">For Candidates</h2>
            <p className="mt-4 text-gray-600">
              Get actionable feedback of your interview from industry experts and share it with 400+ actively hiring brands.
            </p>
            <Link href="/auth/candidate">
              <button className="bg-black text-white rounded px-4 py-2 mt-6 hover:bg-gray-800 transition-colors duration-200">
                Login
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccessAccount;
