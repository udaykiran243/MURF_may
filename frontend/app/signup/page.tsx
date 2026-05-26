"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, User, Mail, Lock, ArrowRight, Loader2, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", full_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string) => pwd.length >= 8;
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async () => {
    setError("");
    
    if (!formData.full_name.trim()) {
      setError("Please enter your full name");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Store user info for dashboard
        localStorage.setItem("user_email", formData.email);
        localStorage.setItem("user_name", formData.full_name);
        
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        className="relative z-10 max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and Header */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SereneMind</span>
        </Link>

        {/* Success State */}
        {success ? (
          <motion.div
            className="glass p-8 rounded-2xl border border-white/10 backdrop-blur-xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to SereneMind!</h2>
            <p className="text-gray-400 mb-6">Your account has been created successfully. Redirecting to login...</p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-cyan-400"
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : (
          /* Card */
          <div className="glass p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Join Now</h1>
            <p className="text-gray-400 mb-8">Begin your emotional wellness journey today</p>

            <div className="space-y-4 mb-6">
              {/* Full Name Input */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500 rounded-l-lg" />
                <User className="absolute left-4 top-3.5 w-5 h-5 text-purple-400/50" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:bg-white/10 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500 rounded-l-lg" />
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-purple-400/50" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:bg-white/10 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500 rounded-l-lg" />
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-purple-400/50" />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-purple-500/50 focus:bg-white/10 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              disabled={loading || !formData.full_name || !formData.email || !formData.password}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-purple-700 disabled:to-cyan-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-950 text-gray-400">or</span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-6">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Your wellbeing is our priority. All data is encrypted and secure.
        </p>
      </motion.div>
    </div>
  );
}
