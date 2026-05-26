'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Search,
  Heart,
  Lock,
  Globe,
  Calendar,
  Tag,
  LogOut,
  Edit2,
  Trash2,
  X
} from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: string
  tags: string[]
  isPrivate: boolean
  timestamp: Date
  gratitudeItems?: string[]
  insights?: string
}

export default function JournalPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: [] as string[],
    isPrivate: true,
    gratitudeItems: [] as string[],
    currentGratitude: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    // Load sample entries
    setEntries([
      {
        id: '1',
        title: 'A Day of Reflection',
        content: 'Today I spent time thinking about my goals and what truly matters to me. I realize I\'ve been so focused on external achievements that I forgot to appreciate the simple joys in life. Moving forward, I want to be more intentional about my choices and prioritize my mental health.',
        mood: 'Peaceful',
        tags: ['reflection', 'goals', 'gratitude'],
        isPrivate: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        gratitudeItems: ['My supportive family', 'Good health', 'New opportunities'],
        insights: 'I\'ve learned that self-awareness is the first step to meaningful change.'
      },
      {
        id: '2',
        title: 'Overcoming Anxiety',
        content: 'I had a challenging day today, but I used the breathing techniques I learned. It really helped me stay calm. I\'m proud of myself for taking these small steps toward managing my anxiety.',
        mood: 'Hopeful',
        tags: ['anxiety', 'coping', 'growth'],
        isPrivate: true,
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        gratitudeItems: ['My ability to learn', 'Support from friends'],
        insights: 'Progress is made one small step at a time.'
      }
    ])
  }, [router])

  const handleSaveEntry = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      mood: formData.mood,
      tags: formData.tags,
      isPrivate: formData.isPrivate,
      timestamp: new Date(),
      gratitudeItems: formData.gratitudeItems,
      insights: ''
    }

    setEntries(prev => [newEntry, ...prev])
    resetForm()
    setShowForm(false)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: '',
      tags: [],
      isPrivate: true,
      gratitudeItems: [],
      currentGratitude: ''
    })
  }

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    setSelectedEntry(null)
  }

  const addGratitude = () => {
    if (formData.currentGratitude.trim()) {
      setFormData(prev => ({
        ...prev,
        gratitudeItems: [...prev.gratitudeItems, prev.currentGratitude],
        currentGratitude: ''
      }))
    }
  }

  const removeGratitude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gratitudeItems: prev.gratitudeItems.filter((_, i) => i !== index)
    }))
  }

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
            <h1 className="text-2xl font-bold text-white">Journal</h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Entry
            </motion.button>
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Entries List */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
              />
            </div>

            {/* Entries */}
            <div className="space-y-4">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedEntry(entry)}
                    className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                          {entry.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {entry.timestamp.toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: entry.timestamp.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}
                          </span>
                          {entry.mood && (
                            <>
                              <span>•</span>
                              <span>{entry.mood}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.isPrivate ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Globe className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">{entry.content}</p>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No entries found. Start journaling your thoughts!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Form / Entry Detail */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            {showForm && (
              <div className="sticky top-32 p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">New Entry</h3>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
                    className="p-1 hover:bg-white/10 rounded transition"
                  >
                    <X className="w-5 h-5 text-gray-300" />
                  </button>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Entry title"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">How are you feeling?</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none text-sm"
                  >
                    <option value="">Select mood</option>
                    <option value="Happy">Happy</option>
                    <option value="Peaceful">Peaceful</option>
                    <option value="Excited">Excited</option>
                    <option value="Sad">Sad</option>
                    <option value="Anxious">Anxious</option>
                    <option value="Grateful">Grateful</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your thoughts..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none text-sm resize-none h-28"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Gratitude</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.currentGratitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentGratitude: e.target.value }))}
                      placeholder="Add something you're grateful for..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
                    />
                    <button
                      onClick={addGratitude}
                      className="px-3 py-2 bg-emerald-600/50 hover:bg-emerald-600 text-emerald-200 rounded-lg text-sm font-medium transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.gratitudeItems.length > 0 && (
                    <div className="space-y-2">
                      {formData.gratitudeItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/30"
                        >
                          <span className="text-xs text-emerald-300">{item}</span>
                          <button
                            onClick={() => removeGratitude(idx)}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="private" className="text-sm text-gray-300 flex items-center gap-1">
                    {formData.isPrivate ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Globe className="w-3 h-3" />
                    )}
                    Private entry
                  </label>
                </div>

                <button
                  onClick={handleSaveEntry}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all"
                >
                  Save Entry
                </button>
              </div>
            )}

            {selectedEntry && !showForm && (
              <div className="sticky top-32 p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex-1 pr-2">{selectedEntry.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowForm(true)
                        setFormData({
                          title: selectedEntry.title,
                          content: selectedEntry.content,
                          mood: selectedEntry.mood || '',
                          tags: selectedEntry.tags,
                          isPrivate: selectedEntry.isPrivate,
                          gratitudeItems: selectedEntry.gratitudeItems || [],
                          currentGratitude: ''
                        })
                        setSelectedEntry(null)
                      }}
                      className="p-1 hover:bg-white/10 rounded transition"
                    >
                      <Edit2 className="w-4 h-4 text-gray-300" />
                    </button>
                    <button
                      onClick={() => deleteEntry(selectedEntry.id)}
                      className="p-1 hover:bg-white/10 rounded transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {selectedEntry.timestamp.toLocaleDateString()}
                  {selectedEntry.mood && (
                    <>
                      <span>•</span>
                      <span>{selectedEntry.mood}</span>
                    </>
                  )}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">{selectedEntry.content}</p>

                {selectedEntry.gratitudeItems && selectedEntry.gratitudeItems.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <p className="text-xs font-semibold text-emerald-400">Grateful for:</p>
                    {selectedEntry.gratitudeItems.map((item, idx) => (
                      <p key={idx} className="text-xs text-emerald-300">• {item}</p>
                    ))}
                  </div>
                )}

                {selectedEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {selectedEntry.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSelectedEntry(null)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
