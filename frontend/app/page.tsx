"use client";

import Link from "next/link";
import { Heart, Mic2, Brain, Sparkles, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Mic2,
    title: "Real-Time Voice Therapy",
    description: "Natural conversations with emotionally expressive AI voices",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Brain,
    title: "Intelligent Emotional AI",
    description: "Detects emotions and adapts responses to your emotional state",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Wellness Dashboard",
    description: "Track mood, journaling, and emotional growth over time",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Sparkles,
    title: "5 Personality Modes",
    description: "Choose your preferred AI companion style and tone",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    icon: Heart,
    title: "Deeply Empathetic",
    description: "AI that truly understands and responds with genuine care",
    gradient: "from-rose-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your privacy and data security are our top priority",
    gradient: "from-slate-500 to-zinc-500"
  }
];

const personalities = [
  { name: "Calm Mentor", emoji: "🧘", desc: "Wise guidance" },
  { name: "Best Friend", emoji: "😊", desc: "Warm support" },
  { name: "Soft Therapist", emoji: "💬", desc: "Professional care" },
  { name: "Motivational Coach", emoji: "💪", desc: "Inspiration" },
  { name: "Mindfulness Guide", emoji: "🌿", desc: "Peace & balance" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 sticky top-0 border-b border-white/5 bg-slate-950/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SereneMind</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-32">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="block">Your Emotional</span>
            <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Support Companion</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Meet SereneMind AI - your 24/7 emotionally intelligent companion powered by advanced voice therapy and deep empathy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold transition-all hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 flex items-center justify-center gap-2">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="px-8 py-4 border border-white/20 hover:border-purple-500/50 rounded-xl text-white font-semibold transition-all hover:bg-white/5">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Personality Showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Choose Your Perfect Companion
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {personalities.map((personality, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="glass p-6 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all hover:scale-105 text-center cursor-pointer group"
            >
              <div className="text-5xl mb-3 group-hover:scale-125 transition-transform">{personality.emoji}</div>
              <h3 className="font-bold text-white mb-1">{personality.name}</h3>
              <p className="text-sm text-gray-400">{personality.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-24">
        <motion.h2
          className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Powerful Features for Your Wellness
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass p-8 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all group hover:scale-105"
              >
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-24">
        <motion.div
          className="glass p-12 rounded-3xl border border-white/10 backdrop-blur-xl text-center bg-gradient-to-r from-purple-500/10 to-cyan-500/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Ready to Start Your Emotional Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands experiencing deeply empathetic AI support. Your first conversation is free.</p>
          <Link href="/signup" className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold transition-all hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105">
            Begin Now
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2026 SereneMind AI. Your emotional wellness companion. | Made with ❤️ for mental health</p>
        </div>
      </footer>
    </div>
  );
}
