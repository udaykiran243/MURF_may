'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Send,
  MessageCircle,
  Mic,
  Settings2,
  X,
  ArrowLeft,
  Smile,
  Clock,
  Zap,
  ThermometerSun,
  Brain
} from 'lucide-react'

const PERSONALITIES = [
  { id: 'calm_mentor', name: 'Calm Mentor', emoji: '🧘', description: 'Wise, gentle guidance' },
  { id: 'friendly_best_friend', name: 'Best Friend', emoji: '😊', description: 'Warm, relatable support' },
  { id: 'soft_therapist', name: 'Soft Therapist', emoji: '💬', description: 'Professional empathy' },
  { id: 'motivational_coach', name: 'Coach', emoji: '💪', description: 'Energetic inspiration' },
  { id: 'mindfulness_guide', name: 'Mindfulness Guide', emoji: '🌿', description: 'Peaceful presence' }
]

interface Message {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: Date
  emotion?: string
  confidenceScore?: number
}

export default function TherapyPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [userEmail, setUserEmail] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPersonality, setSelectedPersonality] = useState('calm_mentor')
  const [sessionActive, setSessionActive] = useState(false)
  const [showPersonalitySelect, setShowPersonalitySelect] = useState(true)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const email = localStorage.getItem('user_email')

    if (!token) {
      // Auto-login with test user for development
      const autoLogin = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/test-user`,
            { method: 'POST' }
          )
          
          if (response.ok) {
            const data = await response.json()
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('user_email', 'test@serenemin.ai')
            setUserEmail('test@serenemin.ai')
          } else {
            router.push('/login')
          }
        } catch (error) {
          console.error('Auto-login failed:', error)
          router.push('/login')
        }
      }

      autoLogin()
    } else {
      setUserEmail(email || '')
    }

    // Welcome message
    const welcomeMessage: Message = {
      id: '1',
      sender: 'ai',
      content: `Hello! I'm your ${PERSONALITIES.find(p => p.id === selectedPersonality)?.name}. I'm here to listen and support you. How are you feeling today?`,
      timestamp: new Date(),
      emotion: 'welcome'
    }
    setMessages([welcomeMessage])
  }, [router, selectedPersonality])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startSession = async () => {
    try {
      // Create conversation
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/therapy/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            personality_mode: selectedPersonality,
            mood_at_start: 'reflective'
          })
        }
      )

      if (!response.ok) throw new Error('Failed to create conversation')

      const data = await response.json()
      setConversationId(data.id)
      setSessionActive(true)
      setShowPersonalitySelect(false)

      // Get greeting with voice
      try {
        const greetingResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/voice/greeting?personality_mode=${selectedPersonality}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        )

        if (greetingResponse.ok) {
          const greetingData = await greetingResponse.json()
          
          const greetingMessage: Message = {
            id: '1',
            sender: 'ai',
            content: greetingData.greeting,
            timestamp: new Date(),
            emotion: 'welcome'
          }
          setMessages([greetingMessage])

          // Play greeting audio
          if (greetingData.audio_url && audioRef.current) {
            audioRef.current.src = greetingData.audio_url
            audioRef.current.play().catch(err => console.log('Audio playback error:', err))
            setIsPlayingAudio(true)
          }
        } else {
          // Fallback if greeting fails
          const fallbackMessage: Message = {
            id: '1',
            sender: 'ai',
            content: `Hello! I'm your ${PERSONALITIES.find(p => p.id === selectedPersonality)?.name}. I'm here to listen and support you. How are you feeling today?`,
            timestamp: new Date(),
            emotion: 'welcome'
          }
          setMessages([fallbackMessage])
        }
      } catch (greetingError) {
        console.error('Error getting greeting:', greetingError)
        // Fallback message if greeting API fails
        const fallbackMessage: Message = {
          id: '1',
          sender: 'ai',
          content: `Hello! I'm your ${PERSONALITIES.find(p => p.id === selectedPersonality)?.name}. I'm here to listen and support you. How are you feeling today?`,
          timestamp: new Date(),
          emotion: 'welcome'
        }
        setMessages([fallbackMessage])
      }
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start session. Please try again.')
    }
  }

  const endSession = async () => {
    if (conversationId) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/therapy/conversations/${conversationId}/end`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        )
      } catch (error) {
        console.error('Error ending session:', error)
      }
    }
    
    setSessionActive(false)
    setShowPersonalitySelect(true)
    setMessages([])
    setInput('')
    setConversationId(null)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !conversationId) return

    const messageContent = input
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call backend API for AI response with voice
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/voice/send-message?conversation_id=${conversationId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            content: messageContent
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('[DEBUG] API Response:', data)

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: data.ai_response,
        timestamp: new Date(),
        emotion: data.emotion_detected,
        confidenceScore: data.emotion_confidence
      }

      setMessages(prev => [...prev, aiMessage])

      // Auto-play voice response if available
      if (data.audio_url && audioRef.current) {
        console.log('[DEBUG] Playing audio:', data.audio_url)
        audioRef.current.src = data.audio_url
        audioRef.current.play().catch(err => console.error('Audio playback error:', err))
        setIsPlayingAudio(true)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        content: `I apologize, but I encountered an issue processing your message. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        emotion: 'error'
      }
      
      setMessages(prev => [...prev, errorMessage])
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (isRecording) {
      setRecordingTime(0)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <motion.div
      className="h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hidden audio element for voice playback */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlayingAudio(false)} 
        className="hidden" 
      />
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Therapy Session</h1>
              <p className="text-xs text-gray-400">
                {sessionActive ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    {PERSONALITIES.find(p => p.id === selectedPersonality)?.name}
                  </span>
                ) : (
                  'Select a personality mode to begin'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sessionActive && (
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300">{messages.length} messages</span>
              </div>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {messages.length === 0 && !sessionActive ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ready to Connect</h3>
                    <p className="text-gray-400 mb-6">Choose a personality mode that resonates with you today</p>
                  </div>
                </motion.div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-br-none'
                          : 'bg-white/10 text-gray-100 border border-white/20 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.emotion && msg.sender === 'ai' && (
                        <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                          <span>Emotion detected:</span>
                          <Smile className="w-3 h-3" />
                          <span>{msg.emotion}</span>
                        </div>
                      )}
                      <span className="text-xs opacity-60 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 text-gray-100 border border-white/20 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {sessionActive && (
            <motion.div
              variants={itemVariants}
              className="sticky bottom-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent p-6 max-w-4xl mx-auto w-full"
            >
              <div className="flex gap-3">
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-lg transition ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  title="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <div className="flex-1 flex gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-purple-500/50 focus-within:bg-white/10 transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-purple-700 disabled:to-cyan-700 disabled:opacity-50 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Personality Selector Sidebar */}
        <motion.div
          className={`w-72 bg-white/5 border-l border-white/10 overflow-y-auto transition-all ${
            showPersonalitySelect ? 'translate-x-0' : 'translate-x-full hidden'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Personality Mode
              </h3>

              <div className="space-y-3">
                {PERSONALITIES.map((personality) => (
                  <motion.button
                    key={personality.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPersonality(personality.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedPersonality === personality.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{personality.emoji}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{personality.name}</p>
                        <p className="text-xs text-gray-400">{personality.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {!sessionActive && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSession}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/50"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Start Session
                </div>
              </motion.button>
            )}

            {sessionActive && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={endSession}
                className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all border border-red-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  End Session
                </div>
              </motion.button>
            )}

            {/* Session Info */}
            {sessionActive && (
              <div className="space-y-3 pt-6 border-t border-white/10">
                <div className="text-sm">
                  <p className="text-gray-400 mb-2">Session Metrics</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <MessageCircle className="w-3 h-3 text-purple-400" />
                      <span>{messages.length} messages</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>~{Math.max(1, Math.floor(messages.length * 0.5))} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>Session active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
