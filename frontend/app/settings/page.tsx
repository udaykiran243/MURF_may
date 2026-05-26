'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bell,
  Lock,
  Eye,
  Mail,
  LogOut,
  Sun,
  Moon,
  Volume2,
  Globe,
  Heart,
  Shield
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    soundEnabled: true,
    language: 'en',
    personality: 'calm_mentor',
    emailUpdates: false,
    shareData: false
  })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const email = localStorage.getItem('user_email')
    const name = localStorage.getItem('user_name')

    if (!token) {
      router.push('/login')
      return
    }

    setUserEmail(email || '')
    setUserName(name || '')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    router.push('/')
  }

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }))
  }

  const handleLanguageChange = (lang: string) => {
    setSettings(prev => ({ ...prev, language: lang }))
  }

  const handlePersonalityChange = (personality: string) => {
    setSettings(prev => ({ ...prev, personality }))
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-400" />
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Email</label>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  {userEmail}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 block mb-2">Name</label>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">
                  {userName}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Preferences
            </h2>
            <div className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-xs text-gray-400">Use dark theme for comfortable viewing</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('darkMode')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.darkMode ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: settings.darkMode ? 24 : 0 }}
                  />
                </button>
              </div>

              {/* Language */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <label className="text-white font-medium block mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'es', name: 'Español' },
                    { code: 'fr', name: 'Français' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                        settings.language === lang.code
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Personality */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <label className="text-white font-medium block mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-purple-400" />
                  Default AI Personality
                </label>
                <select
                  value={settings.personality}
                  onChange={(e) => handlePersonalityChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                >
                  <option value="calm_mentor">Calm Mentor</option>
                  <option value="friendly_best_friend">Best Friend</option>
                  <option value="soft_therapist">Soft Therapist</option>
                  <option value="motivational_coach">Coach</option>
                  <option value="mindfulness_guide">Mindfulness Guide</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-xs text-gray-400">Get session reminders and wellness tips</p>
                </div>
                <button
                  onClick={() => toggleSetting('notifications')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.notifications ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: settings.notifications ? 24 : 0 }}
                  />
                </button>
              </div>

              {/* Email Updates */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Email Updates</p>
                  <p className="text-xs text-gray-400">Receive weekly wellness reports</p>
                </div>
                <button
                  onClick={() => toggleSetting('emailUpdates')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.emailUpdates ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: settings.emailUpdates ? 24 : 0 }}
                  />
                </button>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Sound Effects</p>
                    <p className="text-xs text-gray-400">Enable audio feedback during sessions</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('soundEnabled')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: settings.soundEnabled ? 24 : 0 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Privacy Section */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Privacy & Security
            </h2>
            <div className="space-y-4">
              {/* Share Data */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">Share Insights</p>
                  <p className="text-xs text-gray-400">Help us improve with anonymous usage data</p>
                </div>
                <button
                  onClick={() => toggleSetting('shareData')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.shareData ? 'bg-purple-600' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                    animate={{ x: settings.shareData ? 24 : 0 }}
                  />
                </button>
              </div>

              {/* Change Password */}
              <button className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white font-medium transition-all flex items-center gap-2 justify-center">
                <Lock className="w-5 h-5" />
                Change Password
              </button>

              {/* Privacy Policy */}
              <button className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white font-medium transition-all flex items-center gap-2 justify-center">
                <Eye className="w-5 h-5" />
                Privacy Policy
              </button>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <button
              onClick={handleLogout}
              className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 font-semibold rounded-lg transition-all border border-red-500/30 flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
            <button className="flex-1 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-semibold rounded-lg transition-all border border-red-600/30">
              Delete Account
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
