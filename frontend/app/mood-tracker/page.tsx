'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Heart,
  ArrowLeft,
  Plus,
  Calendar,
  TrendingUp,
  Smile,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Zap,
  Cloud,
  Droplets,
  Wind,
  Sun,
  Moon
} from 'lucide-react'

const MOODS = [
  { id: 'joyful', label: 'Joyful', emoji: '😄', color: 'from-yellow-400 to-orange-400' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: 'from-blue-400 to-cyan-400' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'from-purple-400 to-pink-400' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'from-indigo-400 to-blue-400' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: 'from-red-400 to-orange-400' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', color: 'from-gray-400 to-gray-500' },
  { id: 'energized', label: 'Energized', emoji: '⚡', color: 'from-green-400 to-emerald-400' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵', color: 'from-red-500 to-pink-500' }
]

const TRIGGERS = [
  'Work stress', 'Relationships', 'Health', 'Finance', 'Sleep', 'Social', 'Change', 'Uncertainty'
]

const ACTIVITIES = [
  'Meditation', 'Exercise', 'Journaling', 'Sleep', 'Social time', 'Therapy', 'Creative', 'Nature'
]

interface MoodEntry {
  id: string
  mood: string
  intensity: number
  triggers: string[]
  activities: string[]
  notes: string
  timestamp: Date
}

export default function MoodTrackerPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [step, setStep] = useState(1) // 1: select mood, 2: details, 3: confirm
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const email = localStorage.getItem('user_email')

    if (!token) {
      router.push('/login')
      return
    }

    setUserEmail(email || '')

    // Load sample entries
    setEntries([
      {
        id: '1',
        mood: 'Calm',
        intensity: 8,
        triggers: [],
        activities: ['Meditation', 'Sleep'],
        notes: 'Had a good morning routine',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        mood: 'Anxious',
        intensity: 6,
        triggers: ['Work stress'],
        activities: ['Exercise'],
        notes: 'Big project deadline approaching',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ])
  }, [router])

  const handleSaveMood = () => {
    if (!selectedMood) return

    const newEntry: MoodEntry = {
      id: `mood-${Date.now()}`,
      mood: MOODS.find(m => m.id === selectedMood)?.label || selectedMood,
      intensity,
      triggers: selectedTriggers,
      activities: selectedActivities,
      notes,
      timestamp: new Date()
    }

    setEntries(prev => [newEntry, ...prev])
    setSaved(true)
    
    setTimeout(() => {
      // Reset form
      setStep(1)
      setSelectedMood('')
      setIntensity(5)
      setSelectedTriggers([])
      setSelectedActivities([])
      setNotes('')
      setSaved(false)
    }, 2000)
  }

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    )
  }

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    )
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
            <h1 className="text-2xl font-bold text-white">Mood Tracker</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">Log Your Mood</h3>

                {saved ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">Mood saved!</p>
                    <p className="text-sm text-gray-400 mt-2">Thank you for tracking your wellness</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Step 1: Select Mood */}
                    {step === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <label className="text-sm font-semibold text-gray-300">How are you feeling?</label>
                        <div className="grid grid-cols-4 gap-2">
                          {MOODS.map(mood => (
                            <motion.button
                              key={mood.id}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedMood(mood.id)}
                              className={`p-3 rounded-lg transition-all text-2xl ${
                                selectedMood === mood.id
                                  ? `bg-gradient-to-r ${mood.color} shadow-lg`
                                  : 'bg-white/10 hover:bg-white/20'
                              }`}
                              title={mood.label}
                            >
                              {mood.emoji}
                            </motion.button>
                          ))}
                        </div>
                        {selectedMood && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setStep(2)}
                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all"
                          >
                            Continue
                          </motion.button>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-sm font-semibold text-gray-300 block mb-3">
                            Intensity: {intensity}/10
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-300 mb-2 block">Triggers (optional)</label>
                          <div className="flex flex-wrap gap-2">
                            {TRIGGERS.slice(0, 4).map(trigger => (
                              <motion.button
                                key={trigger}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleTrigger(trigger)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                  selectedTriggers.includes(trigger)
                                    ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                              >
                                {trigger}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-300 mb-2 block">Activities (optional)</label>
                          <div className="flex flex-wrap gap-2">
                            {ACTIVITIES.slice(0, 4).map(activity => (
                              <motion.button
                                key={activity}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleActivity(activity)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                  selectedActivities.includes(activity)
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                              >
                                {activity}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          placeholder="Any notes? (optional)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none text-sm resize-none h-20"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-lg transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => setStep(3)}
                            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all"
                          >
                            Review
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <div className="text-center py-4 px-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-3xl mb-2">
                            {MOODS.find(m => m.id === selectedMood)?.emoji}
                          </p>
                          <p className="text-white font-semibold">
                            {MOODS.find(m => m.id === selectedMood)?.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Intensity: {intensity}/10</p>
                        </div>

                        {selectedTriggers.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-300 mb-2">Triggers:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedTriggers.map(t => (
                                <span key={t} className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedActivities.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-300 mb-2">Activities:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedActivities.map(a => (
                                <span key={a} className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-300">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setStep(2)}
                            className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={handleSaveMood}
                            className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg transition-all"
                          >
                            Save Mood
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* History Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Entries</h3>
            <div className="space-y-4">
              {entries.length > 0 ? (
                entries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    variants={itemVariants}
                    className="p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {MOODS.find(m => m.label === entry.mood)?.emoji}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{entry.mood}</p>
                          <p className="text-xs text-gray-400">
                            {entry.timestamp.toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">{entry.intensity}/10</span>
                      </div>
                    </div>

                    {entry.triggers.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Triggers:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {entry.triggers.map(t => (
                            <span key={t} className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.activities.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Activities:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {entry.activities.map(a => (
                            <span key={a} className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-300">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-sm text-gray-300 italic">"{entry.notes}"</p>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Smile className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No mood entries yet. Start tracking your wellness!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
