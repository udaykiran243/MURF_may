"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, LogOut, Users, MessageSquare, BarChart3, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState({ users: 0, conversations: 0, moods: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminEmail = localStorage.getItem("admin_email");
    const adminToken = localStorage.getItem("admin_token");

    if (!adminToken) {
      router.push("/admin/login");
      return;
    }

    setEmail(adminEmail || "Admin");
    fetchStats(adminToken);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-red-950 to-slate-950">
      {/* Header */}
      <nav className="border-b border-white/5 bg-slate-950/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">{email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-300 font-semibold text-sm transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-2 text-white">Welcome back, Administrator</h2>
          <p className="text-gray-400">Monitor and manage SereneMind AI platform</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Users</p>
                {loading ? (
                  <div className="h-10 w-20 bg-white/5 rounded animate-pulse" />
                ) : (
                  <h3 className="text-4xl font-bold text-white">{stats.users}</h3>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          {/* Conversations Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-2xl border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Conversations</p>
                {loading ? (
                  <div className="h-10 w-20 bg-white/5 rounded animate-pulse" />
                ) : (
                  <h3 className="text-4xl font-bold text-white">{stats.conversations}</h3>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          {/* Mood Entries Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-2xl border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Mood Entries</p>
                {loading ? (
                  <div className="h-10 w-20 bg-white/5 rounded animate-pulse" />
                ) : (
                  <h3 className="text-4xl font-bold text-white">{stats.moods}</h3>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-8 rounded-2xl border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">System Status</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>✅ Frontend server running on http://localhost:3001</li>
                <li>✅ Backend API server running on http://localhost:8000</li>
                <li>✅ Database connection active</li>
                <li>📊 API Documentation available at http://localhost:8000/docs</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Quick Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="glass p-4 rounded-xl border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all hover:bg-white/10"
            >
              <h4 className="text-white font-semibold mb-1">📚 API Documentation</h4>
              <p className="text-gray-400 text-sm">Swagger UI - Explore all backend endpoints</p>
            </a>
            <a
              href="/"
              className="glass p-4 rounded-xl border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all hover:bg-white/10"
            >
              <h4 className="text-white font-semibold mb-1">🏠 Landing Page</h4>
              <p className="text-gray-400 text-sm">View public-facing application</p>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
