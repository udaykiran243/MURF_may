"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.access_token);
        localStorage.setItem("admin_email", email);
        router.push("/admin/dashboard");
      } else {
        const data = await response.json();
        setError(data.detail || "Invalid admin credentials");
      }
    } catch (err) {
      setError("Connection error. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-red-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background - Admin theme (red/amber) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        className="relative z-10 max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Admin Logo and Header */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">SereneMind Admin</span>
        </Link>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300 text-xs">Admin access only. Unauthorized access attempts are logged.</p>
        </motion.div>

        {/* Card */}
        <div className="glass p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">Admin Portal</h1>
          <p className="text-gray-400 mb-8">Restricted administrator access</p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-600 to-amber-600 rounded-l-lg" />
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-red-400/50" />
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-red-500/50 focus:bg-white/10 focus:outline-none transition-all disabled:opacity-50"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-600 to-amber-600 rounded-l-lg" />
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-red-400/50" />
              <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-red-500/50 focus:bg-white/10 focus:outline-none transition-all disabled:opacity-50"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:from-red-700 disabled:to-amber-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-gray-400">or</span>
            </div>
          </div>

          {/* Back to User Link */}
          <p className="text-center text-gray-400 text-sm">
            User login?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Go here
            </Link>
          </p>

          {/* Security Notes */}
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Demo credentials:</strong><br />
              Email: admin@serenemin.ai<br />
              Password: admin123456
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Admin access is secure and monitored. All activities are logged.
        </p>
      </motion.div>
    </div>
  );
}
