"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, loginWithGithub } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white border border-border/60 shadow-xl shadow-violet-100/20 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-violet-500/15 mb-4">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to manage your credibility score</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="email" 
                required
                className="w-full bg-white border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="password" 
                required
                className="w-full bg-white border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-violet-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/15 transition-all active:scale-95 flex items-center justify-center gap-2 border border-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
            </button>
            <button 
              type="button"
              onClick={() => {
                setEmail("demo@credovia.com");
                setPassword("password");
              }}
              className="w-full bg-violet-50 hover:bg-violet-100 text-violet-900 font-medium py-3 rounded-2xl border border-violet-200 transition-all text-sm"
            >
              Autofill Demo Account
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={loginWithGithub}
          className="w-full bg-[#24292e] hover:bg-[#2f363d] text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Github className="w-6 h-6" /> GitHub
        </button>

        <p className="text-center text-muted-foreground mt-8">
          Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </motion.div>

    </div>
  );
}
