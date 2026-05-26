'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Heart,
  LogOut,
  MessageSquare,
  BarChart3,
  Calendar,
  Settings,
  Plus,
  TrendingUp,
  Clock,
  Smile
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [moodEntries, setMoodEntries] = useState([])
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMoods: 0,
    averageMoodScore: 0
  })

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      const email = localStorage.getItem('user_email')
      const name = localStorage.getItem('user_name')

      if (!token) {
        router.push('/login')
        return
      }

      setUserEmail(email || '')
      setUserName(name || 'User')
      
      // Simulate loading data - in production, fetch from API
      setTimeout(() => {
        setConversations([
          { id: 1, title: 'Daily anxiety check-in', personality: 'Calm Mentor', date: 'Today', duration: '12 min' },
          { id: 2, title: 'Morning motivation session', personality: 'Coach', date: 'Yesterday', duration: '8 min' },
          { id: 3, title: 'Evening reflection', personality: 'Soft Therapist', date: '2 days ago', duration: '15 min' }
        ])
        
        setMoodEntries([
          { id: 1, mood: 'Calm', intensity: 7, date: 'Today', color: 'from-blue-400 to-cyan-400' },
          { id: 2, mood: 'Energized', intensity: 8, date: 'Yesterday', color: 'from-emerald-400 to-teal-400' },
          { id: 3, mood: 'Peaceful', intensity: 9, date: '2 days ago', color: 'from-purple-400 to-pink-400' }
        ])
        
        setStats({
          totalConversations: 12,
          totalMoods: 8,
          averageMoodScore: 7.8
        })
        
        setLoading(false)
      }, 500)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    router.push('/')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/5 rounded-2xl backdrop-blur-xl"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl backdrop-blur-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">SereneMind</h1>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-white font-semibold">{userName}</p>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300 hover:text-white"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Welcome Section */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {userName.split(' ')[0]}!</h2>
            <p className="text-gray-300">Track your emotional wellness journey and connect with your AI companion</p>
          </div>
          
          <Link
            href="/therapy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
          >
            <MessageSquare className="w-5 h-5" />
            Start Therapy Session
            <Plus className="w-5 h-5" />
          </Link>
        </motion.section>

        {/* Stats Grid */}
        <motion.section variants={itemVariants}>
          <h3 className="text-2xl font-bold text-white mb-6">Your Wellness Snapshot</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Conversations */}
            <motion.div
              variants={itemVariants}
              className="relative group"
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition opacity-0 group-hover:opacity-100"></div>
              <div className="relative p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-gray-300 font-medium">Total Conversations</h4>
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalConversations}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> 2 this week
                </p>
              </div>
            </motion.div>

            {/* Mood Entries */}
            <motion.div
              variants={itemVariants}
              className="relative group"
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition opacity-0 group-hover:opacity-100"></div>
              <div className="relative p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-gray-300 font-medium">Mood Entries</h4>
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalMoods}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Last 7 days
                </p>
              </div>
            </motion.div>

            {/* Average Mood Score */}
            <motion.div
              variants={itemVariants}
              className="relative group"
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition opacity-0 group-hover:opacity-100"></div>
              <div className="relative p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-gray-300 font-medium">Average Mood Score</h4>
                  <div className="p-2 rounded-lg bg-pink-500/20">
                    <Smile className="w-5 h-5 text-pink-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.averageMoodScore.toFixed(1)}/10</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Improving
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Recent Conversations */}
        <motion.section variants={itemVariants} className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Recent Conversations</h3>
          <div className="space-y-4">
            {conversations.length > 0 ? (
              conversations.map((conv, idx) => (
                <motion.div
                  key={conv.id}
                  variants={itemVariants}
                  className="relative group"
                  whileHover={{ x: 4 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition"></div>
                  <div className="relative p-5 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20">
                        <MessageSquare className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{conv.title}</h4>
                        <p className="text-xs text-gray-400">{conv.personality} • {conv.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{conv.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No conversations yet. Start your first session!
              </div>
            )}
          </div>
        </motion.section>

        {/* Recent Mood Entries */}
        <motion.section variants={itemVariants} className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Mood Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moodEntries.length > 0 ? (
              moodEntries.map((mood) => (
                <motion.div
                  key={mood.id}
                  variants={itemVariants}
                  className="relative group"
                  whileHover={{ y: -2 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${mood.color} rounded-xl blur opacity-0 group-hover:opacity-50 transition`}></div>
                  <div className="relative p-5 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Smile className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h4 className="text-white font-semibold text-lg">{mood.mood}</h4>
                    <div className="flex items-center justify-center gap-2 mt-3 py-2 px-3 bg-white/5 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-gray-300">Intensity: {mood.intensity}/10</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{mood.date}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-400">
                Start tracking your mood to see your wellness journey!
              </div>
            )}
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={itemVariants} className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/therapy"
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur group-hover:blur-lg opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative p-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-center hover:bg-white/10">
                <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Start Chat</p>
              </div>
            </Link>

            <Link
              href="/mood-tracker"
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur group-hover:blur-lg opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative p-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-center hover:bg-white/10">
                <BarChart3 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Log Mood</p>
              </div>
            </Link>

            <Link
              href="/journal"
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl blur group-hover:blur-lg opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative p-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-center hover:bg-white/10">
                <Calendar className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Journal</p>
              </div>
            </Link>

            <Link
              href="/settings"
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur group-hover:blur-lg opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative p-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition text-center hover:bg-white/10">
                <Settings className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Settings</p>
              </div>
            </Link>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
