"use client"

import { useState, useEffect } from "react"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Maximize,
  Settings,
  Volume2,
  VolumeX,
  Users,
  Clock,
  Wifi,
  Signal,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessage {
  id: string
  sender: "interviewer" | "candidate" | "system"
  message: string
  timestamp: string
}

const mockChatMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "system",
    message: "Interview session started. Good luck!",
    timestamp: "14:30",
  },
  {
    id: "2",
    sender: "interviewer",
    message: "Hello! Can you hear me clearly?",
    timestamp: "14:31",
  },
  {
    id: "3",
    sender: "candidate",
    message: "Yes, I can hear you perfectly. Thank you!",
    timestamp: "14:31",
  },
  {
    id: "4",
    sender: "interviewer",
    message: "Great! Let's begin with a brief introduction about yourself.",
    timestamp: "14:32",
  },
]

export default function LiveInterviewPage() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [newMessage, setNewMessage] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "poor">("connected")

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: "candidate",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setChatMessages([...chatMessages, message])
      setNewMessage("")
    }
  }

  const getConnectionBadge = () => {
    const statusConfig = {
      connected: { color: "bg-emerald-50 border-emerald-300 text-emerald-700", icon: Wifi, text: "Connected" },
      connecting: { color: "bg-yellow-50 border-yellow-300 text-yellow-700", icon: Signal, text: "Connecting" },
      poor: { color: "bg-red-50 border-red-300 text-red-700", icon: Wifi, text: "Poor Connection" },
    }

    const config = statusConfig[connectionStatus]
    const IconComponent = config.icon

    return (
      <Badge variant="outline" className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden font-['Inter',sans-serif] flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Top Header - Light Theme */}
      <div className="relative z-50 bg-white/80 backdrop-blur-2xl border-b border-blue-200/50 px-6 py-3 shadow-lg shadow-blue-100/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800">HireMate</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Live Interview in Progress</h1>
              <p className="text-gray-600 text-xs">Frontend Developer Position</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getConnectionBadge()}
            <div className="flex items-center space-x-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="text-sm">2 participants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Light Theme */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Video Call Interface */}
        <div className={`flex-1 p-4 transition-all duration-300 ${showChat ? "mr-80" : ""}`}>
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Interviewer Video - Light Theme */}
            <Card className="bg-white/90 backdrop-blur-xl border border-blue-200/50 shadow-2xl shadow-blue-500/10 overflow-hidden hover:shadow-blue-500/20 transition-all duration-500 hover:border-blue-300/50 h-full max-h-[calc(100vh-200px)]">
              <CardContent className="p-0 h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-blue-100/60 flex items-center justify-center">
                  {/* Enhanced video feed with light gradients */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-100/40 via-white/60 to-blue-200/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse"></div>
                        <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-blue-400/60 shadow-2xl shadow-blue-500/30 relative z-10">
                          <AvatarImage src="/placeholder.svg?height=128&width=128" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-3xl lg:text-4xl font-bold">
                            SJ
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    {/* Add floating particles */}
                    <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-ping"></div>
                    <div className="absolute bottom-12 right-10 w-1 h-1 bg-cyan-400/60 rounded-full animate-ping delay-1000"></div>
                    <div className="absolute top-1/4 right-6 w-1 h-1 bg-blue-500/60 rounded-full animate-ping delay-500"></div>
                  </div>
                </div>

                {/* Enhanced Interviewer Info Overlay - Light Theme */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xl rounded-xl px-4 py-2 border border-blue-200/60 shadow-lg shadow-blue-500/20 z-20">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold text-sm">Sarah Johnson</p>
                      <p className="text-blue-600 text-xs font-medium">Senior HR Manager</p>
                    </div>
                  </div>
                </div>

                {/* Video Controls Overlay */}
                <div className="absolute top-3 right-3 flex space-x-2 z-20">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/80 border-gray-300 text-gray-600 hover:bg-gray-50 h-8 w-8 p-0"
                  >
                    <Maximize className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Video (Self) - Light Theme */}
            <Card className="bg-white/90 backdrop-blur-xl border border-blue-200/50 shadow-2xl shadow-blue-500/10 overflow-hidden hover:shadow-blue-500/20 transition-all duration-500 hover:border-blue-300/50 h-full max-h-[calc(100vh-200px)]">
              <CardContent className="p-0 h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/80 via-white to-blue-100/60 flex items-center justify-center">
                  {/* Enhanced self video feed */}
                  <div className="w-full h-full bg-gradient-to-br from-cyan-100/40 via-white/60 to-blue-200/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08)_0%,transparent_70%)]"></div>
                    {isVideoOff ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="relative mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-200/40 to-orange-200/40 rounded-full blur-2xl animate-pulse"></div>
                            <VideoOff className="w-12 h-12 lg:w-16 lg:h-16 text-gray-500 mx-auto relative z-10" />
                          </div>
                          <p className="text-gray-600 text-sm lg:text-base font-medium">Camera is off</p>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
                          <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-cyan-400/60 shadow-2xl shadow-cyan-500/30 relative z-10">
                            <AvatarImage src="/placeholder.svg?height=128&width=128" />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-white text-3xl lg:text-4xl font-bold">
                              AH
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    )}
                    {/* Add floating particles */}
                    <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-ping"></div>
                    <div className="absolute bottom-10 left-12 w-1 h-1 bg-blue-400/60 rounded-full animate-ping delay-1000"></div>
                    <div className="absolute top-1/5 left-6 w-1 h-1 bg-blue-500/60 rounded-full animate-ping delay-500"></div>
                  </div>
                </div>

                {/* Enhanced Self Info Overlay - Light Theme */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xl rounded-xl px-4 py-2 border border-blue-200/60 shadow-lg shadow-blue-500/20 z-20">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div
                        className={`w-3 h-3 rounded-full ${isVideoOff ? "bg-red-500" : "bg-cyan-500"} animate-pulse`}
                      ></div>
                      <div
                        className={`absolute inset-0 w-3 h-3 rounded-full ${isVideoOff ? "bg-red-500" : "bg-cyan-500"} animate-ping opacity-75`}
                      ></div>
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold text-sm">Ahmed Hassan (You)</p>
                      <p className="text-cyan-600 text-xs font-medium">Candidate</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Mute Indicator - Light Theme */}
                {isMuted && (
                  <div className="absolute top-3 left-3 bg-red-50/90 border border-red-200 rounded-xl px-3 py-2 backdrop-blur-xl shadow-lg shadow-red-500/20 z-20">
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="relative">
                        <MicOff className="w-4 h-4" />
                        <div className="absolute inset-0 bg-red-400/20 rounded-full blur-lg animate-pulse"></div>
                      </div>
                      <span className="text-xs font-bold">Muted</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat Panel - Light Theme */}
        <div
          className={`fixed right-0 top-[70px] bottom-[90px] w-80 bg-white/90 backdrop-blur-xl border-l border-blue-200/50 transform transition-transform duration-300 z-40 shadow-xl shadow-blue-100/50 ${
            showChat ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-3 border-b border-blue-200/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-800 font-semibold flex items-center text-sm">
                  <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                  Chat
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "candidate" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.sender === "candidate"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : message.sender === "system"
                            ? "bg-gray-100 text-gray-700 text-center"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-xs">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-3 border-t border-blue-200/50 flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-white border-gray-300 text-gray-800 placeholder-gray-500 text-xs h-8 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-8 px-3 text-xs"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar - Light Theme */}
      <div className="relative z-50 bg-white/90 backdrop-blur-2xl border-t border-blue-200/50 px-6 py-4 shadow-2xl shadow-blue-100/50 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left Controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className={`${
                isMuted
                  ? "bg-gradient-to-r from-red-100 to-red-200 border-red-300 text-red-700 hover:from-red-200 hover:to-red-300 shadow-lg shadow-red-500/20"
                  : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-700 hover:from-blue-100 hover:to-blue-200 shadow-lg shadow-blue-500/20"
              } rounded-xl h-12 w-12 transition-all duration-300 hover:scale-105`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`${
                isVideoOff
                  ? "bg-gradient-to-r from-red-100 to-red-200 border-red-300 text-red-700 hover:from-red-200 hover:to-red-300 shadow-lg shadow-red-500/20"
                  : "bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-300 text-cyan-700 hover:from-cyan-100 hover:to-cyan-200 shadow-lg shadow-cyan-500/20"
              } rounded-xl h-12 w-12 transition-all duration-300 hover:scale-105`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsSpeakerOff(!isSpeakerOff)}
              className={`${
                isSpeakerOff
                  ? "bg-gradient-to-r from-red-100 to-red-200 border-red-300 text-red-700 hover:from-red-200 hover:to-red-300 shadow-lg shadow-red-500/20"
                  : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-700 hover:from-blue-100 hover:to-blue-200 shadow-lg shadow-blue-500/20"
              } rounded-xl h-12 w-12 transition-all duration-300 hover:scale-105`}
            >
              {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg h-10 px-4"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
              {showChat ? <ChevronRight className="w-3 h-3 ml-2" /> : <ChevronLeft className="w-3 h-3 ml-2" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg h-10 px-4"
            >
              <Maximize className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg h-10 px-4"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-lg shadow-red-500/30 h-10 px-6"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
