"use client"

import { useState, useEffect } from "react"
import {
  Mic,
  Video,
  Play,
  Pause,
  RotateCcw,
  Clock,
  User,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const questions = [
  "Tell us about yourself and your professional background.",
  "What motivates you in your work and what are your career goals?",
  "Describe a challenging project you've worked on and how you overcame obstacles.",
  "How do you stay updated with industry trends and continue learning?",
  "Where do you see yourself in the next 5 years?",
]

const instructions = [
  {
    step: 1,
    title: "You'll be asked several common interview questions.",
    description: "Each question is designed to understand your background and experience.",
  },
  {
    step: 2,
    title: "For each, you can record a short video or type your response.",
    description: "Choose the format that makes you most comfortable.",
  },
  {
    step: 3,
    title: "Each question has a timer—try to stay concise!",
    description: "Keep your responses focused and within the time limit.",
  },
  {
    step: 4,
    title: "Once complete, your responses will be submitted together.",
    description: "Review your answers before final submission.",
  },
]

const tips = [
  "Find a quiet, well-lit environment.",
  "Think about your answers before recording.",
  "Stay calm and be yourself!",
]

export default function AIInterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes per question
  const [isRecording, setIsRecording] = useState(false)
  const [recordingMode, setRecordingMode] = useState<"video" | "audio" | "text">("video")
  const [textResponse, setTextResponse] = useState("")
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [responses, setResponses] = useState<string[]>([])
  const [showInstructions, setShowInstructions] = useState(true)

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isTimerActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = ((120 - timeLeft) / 120) * 100

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setResponses([...responses, textResponse])
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(120)
      setTextResponse("")
      setIsRecording(false)
    }
  }

  const handleSubmit = () => {
    setResponses([...responses, textResponse])
    // Handle final submission
    alert("Interview submitted successfully!")
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setIsTimerActive(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Timer Bar */}
      <div className="relative z-10 w-full h-2 bg-blue-100/50 backdrop-blur-sm">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-linear relative overflow-hidden"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Instructions Sidebar */}
        <div className={`transition-all duration-300 ${showInstructions ? "w-80" : "w-12"} flex-shrink-0`}>
          <div className="h-full bg-white/80 backdrop-blur-xl border-r border-blue-200/50 p-6 overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`font-semibold text-gray-800 transition-opacity ${showInstructions ? "opacity-100" : "opacity-0"}`}
              >
                How This Works
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-gray-500 hover:text-gray-800 hover:bg-blue-50"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>

            {showInstructions && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="space-y-4">
                  {instructions.map((instruction) => (
                    <div key={instruction.step} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                        {instruction.step}
                      </div>
                      <div>
                        <p className="text-gray-700 text-sm font-medium mb-1">{instruction.title}</p>
                        <p className="text-gray-500 text-xs">{instruction.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-blue-200/50 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <h4 className="font-medium text-gray-800 text-sm">Tips:</h4>
                  </div>
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progress Summary */}
                <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 text-sm font-medium">Progress</span>
                    <span className="text-blue-600 text-sm font-bold">
                      {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant="outline" className="bg-blue-500/10 border-blue-400/30 text-blue-600 px-4 py-2">
                <User className="w-4 h-4 mr-2" />
                AI Interview
              </Badge>
              <Badge variant="outline" className="bg-blue-100/50 border-blue-300 text-gray-700 px-4 py-2">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <div className="w-px h-6 bg-blue-300"></div>
              <div className="text-sm">Time remaining for this question</div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8 bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-xl">
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{currentQuestion + 1}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2 leading-relaxed">
                    {questions[currentQuestion]}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Take your time to provide a thoughtful response. You can record a video, audio, or type your answer.
                  </p>
                </div>
              </div>

              {/* Response Mode Selector */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={recordingMode === "video" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecordingMode("video")}
                  className={
                    recordingMode === "video"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-50 border-blue-300 text-gray-700 hover:bg-blue-100"
                  }
                >
                  <Video className="w-4 h-4 mr-2" />
                  Record Video
                </Button>
                <Button
                  variant={recordingMode === "audio" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecordingMode("audio")}
                  className={
                    recordingMode === "audio"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-50 border-blue-300 text-gray-700 hover:bg-blue-100"
                  }
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Record Audio
                </Button>
                <Button
                  variant={recordingMode === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRecordingMode("text")}
                  className={
                    recordingMode === "text"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-50 border-blue-300 text-gray-700 hover:bg-blue-100"
                  }
                >
                  <span className="w-4 h-4 mr-2 text-xs font-bold">T</span>
                  Submit Text
                </Button>
              </div>

              {/* Recording/Input Area */}
              {recordingMode === "text" ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your response here..."
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    className="min-h-[200px] bg-blue-50/50 border-blue-300 text-gray-800 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden">
                    {isRecording ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          {recordingMode === "video" ? (
                            <Video className="w-8 h-8 text-white" />
                          ) : (
                            <Mic className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <p className="text-red-500 font-medium">Recording in progress...</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {recordingMode === "video" ? "Camera and microphone active" : "Microphone active"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mb-4">
                          {recordingMode === "video" ? (
                            <Video className="w-8 h-8 text-blue-600" />
                          ) : (
                            <Mic className="w-8 h-8 text-blue-600" />
                          )}
                        </div>
                        <p className="text-gray-600">
                          {recordingMode === "video" ? "Camera preview will appear here" : "Ready to record audio"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={toggleRecording}
                      size="lg"
                      className={`relative px-8 py-4 rounded-full font-medium transition-all duration-300 ${
                        isRecording
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          {recordingMode === "video" ? "Record Video" : "Record Audio"}
                        </>
                      )}
                      {!isRecording && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                      )}
                    </Button>
                  </div>

                  {!isRecording && (
                    <p className="text-center text-gray-600 text-sm">You will have one chance per question.</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setTimeLeft(120)}
              className="bg-blue-50 border-blue-300 text-gray-700 hover:bg-blue-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Timer
            </Button>

            <div className="flex gap-3">
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!textResponse && !isRecording && recordingMode === "text"}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 shadow-lg shadow-blue-500/25"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!textResponse && !isRecording && recordingMode === "text"}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 shadow-lg shadow-blue-500/25"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Interview
                </Button>
              )}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index < currentQuestion
                      ? "bg-blue-500 shadow-lg shadow-blue-500/50"
                      : index === currentQuestion
                        ? "bg-blue-600 shadow-lg shadow-blue-600/50 scale-125"
                        : "bg-blue-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
